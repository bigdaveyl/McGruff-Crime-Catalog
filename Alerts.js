import React from 'react';
// import MapView from 'react-native-maps';
import { Button, Dimensions, Slider, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MarkerAnimated, Circle } from 'react-native-maps';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { MapView } from 'expo';
import { AsyncStorage } from "react-native";
import AlertItem from "./AlertItem"

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const milesToMeters = d => d * 1609.344;
const feetToMeters = d => d * 0.3048;
const MAX_ALERTS = 5;
const STORAGE_BASE = "@McGruffCrimeCatalog:";
const KEY_SEPERATOR = "--";
const LOCATION_SEPARATOR = ",";
const colors = ["teal", "gold", "magenta", "tomato", "plum"] // android maps have limited supported colors
export default class Alerts extends React.Component {
  state = {
    alerts: [],
    activeAlertIndex: 0,
  }
  map = null

  componentDidMount() {
    this.grabAlerts();
  }

  parseAlert = (alert="", i) => ({
    label:     alert.split(KEY_SEPERATOR)[0] || `Alert ${i + 1}`,
    distance: +alert.split(KEY_SEPERATOR)[1],
    latitude:  alert.split(KEY_SEPERATOR)[2] && alert.split(KEY_SEPERATOR)[2].trim(),
    longitude: alert.split(KEY_SEPERATOR)[3] && alert.split(KEY_SEPERATOR)[3].trim(),
    color: colors[i],
  })

  formatAlert = ({ label, latitude, longitude, distance }, index) => (
    [
      label,
      distance,
      latitude,
      longitude,
    ].join(KEY_SEPERATOR)
  )

  grabAlerts = async () => {
    let alerts = [];
    for (let i = 0; i < MAX_ALERTS; i++) {
      const alertString = await this.grabAlert(i)
      console.log(alertString)
      if (alertString) alerts.push(this.parseAlert(alertString || undefined, alerts.length + 1))
    }
    console.log(alerts)
    this.setState({ alerts });
  }

  grabAlert = async i => await AsyncStorage.getItem(`${STORAGE_BASE}alert${i}`);

  onUpdateAlert = index => async (newAlertParameters) => {
    const { alerts } = this.state
    console.log(newAlertParameters)
    if (newAlertParameters) {
      const currentAlert = Object.assign({},
        alerts[index],
        newAlertParameters.latitude !== undefined ? {latitude: newAlertParameters.latitude} : {},
        newAlertParameters.longitude !== undefined ? {longitude: newAlertParameters.longitude} : {},
        newAlertParameters.distance ? {distance: newAlertParameters.distance} : {},
      )
      const updatedAlert = this.formatAlert(currentAlert, index)
      console.log(updatedAlert,currentAlert )
      await AsyncStorage.setItem(`${STORAGE_BASE}alert${index}`, updatedAlert)
    } else {
      await AsyncStorage.setItem(`${STORAGE_BASE}alert${index}`, "")
    }
    this.grabAlerts()
  }

  onUpdateAlerts = alerts => {
    for (let index = 0; index < MAX_ALERTS; index++) {
      if (alerts[index] && alerts[index].latitude && !alerts[index].distance) alerts[index].distance = 10
      this.onUpdateAlert(index)(alerts[index])
    }
  }

  onMarkerDragEnd = index => e => {
    const coords = e.nativeEvent.coordinate
    this.onUpdateAlert(index)({
      latitude: coords.latitude,
      longitude: coords.longitude
    })
  }

  setMapRegionToAlert = alertIndex => () => {
    console.log("setMapRegionToAlert")
    const { currentLocation } = this.props
    const { alerts } = this.state
    const alert = alerts[alertIndex]
    console.log(alert)
    if (!alert) return

    if (this.map) this.map.animateToCoordinate(!alert.latitude ? currentLocation : {
        latitude: +alert.latitude,
        longitude: +alert.longitude,
      },
      300,
    )
    this.setState({activeAlertIndex: alertIndex})
  }

  onDeleteAlert = alertIndex => () => {
    const alerts = [
      ...this.state.alerts.slice(0, alertIndex),
      ...this.state.alerts.slice(alertIndex + 1),
    ]
    console.log(alerts)
    this.onUpdateAlerts(alerts);
  }

  onTestAlert = () => {
    const { token } = this.props
    console.log("token: ", token)
    if (!token) return;
    const title = "There's something happening!"
    const body = "check it out"
    return fetch('https://exp.host/--/api/v2/push/send', {
      body: JSON.stringify({
        to: token,
        title: title,
        body: body,
        data: { message: `${title} - ${body}` },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }

  renderAlert = ({item, index}) => (
    <AlertItem
      key={index}
      index={index}
      {...item}
      onUpdate={this.onUpdateAlert(index)}
      onFocus={this.setMapRegionToAlert(index)}
      onDelete={this.onDeleteAlert(index)}
    />
  )

  render() {
    const { currentLocation } = this.props
    const { alerts, activeAlertIndex } = this.state

    return (
      <View style={styles.container}>
        {currentLocation.latitude && (
          <MapView
            ref={elem => { this.map = elem }}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
            showsUserLocation
          >
          {alerts.map((alert, i) => (
              <React.Fragment key={i}>
                <MarkerAnimated
                  draggable
                  onDragEnd={this.onMarkerDragEnd(i)}
                  coordinate={!alert.latitude ? currentLocation : {
                    latitude: +alert.latitude,
                    longitude: +alert.longitude,
                  }}
                  title={alert.label}
                  pinColor={colors[i]}
                />
                <Circle
                  center={!alert.latitude ? currentLocation : {
                    latitude: +alert.latitude,
                    longitude: +alert.longitude,
                  }}
                  radius={feetToMeters(alert.distance)}
                  strokeColor="transparent"
                  fillColor="rgba(24,24,50, 0.2)"
                />
              </React.Fragment>
          ))}
          </MapView>
        )}

        <View style={styles.carouselContainer}>
          {/* <View style={{padding: 20, marginBottom: 20, backgroundColor:'#eaeaea'}}>
            <Text style={{ fontSize: 22 }}>Alerts</Text>
          </View> */}

          <Carousel
            style={styles.carousel}
            ref={c => { this.carousel = c; }}
            data={[...alerts, {}].slice(0, MAX_ALERTS)}
            renderItem={this.renderAlert}
            sliderWidth={viewportWidth}
            itemWidth={viewportWidth * 0.88}
            onSnapToItem={(index, marker) => this.setMapRegionToAlert(index)()}
            layout="stack"
            layoutCardOffset={18}
          />

          <Pagination
            dotsLength={Math.min(MAX_ALERTS, alerts.length + 1)}
            activeDotIndex={activeAlertIndex}
            dotColor={'rgba(0, 0, 0, 0.2)'}
            containerStyle={styles.paginationContainer}
            dotStyle={styles.paginationDot}
            inactiveDotColor={"#000"}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.9}
            carouselRef={this.carousel}
            tappableDots={!!this.carousel}
          />

          <Button onPress={this.onTestAlert} title="Test alert" />
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
    // paddingTop: 40,
    // paddingBottom: 20,
    backgroundColor: '#fafafa',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  carouselContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    margin: 0,
    padding: 0,
  },
  paginationContainer: {
    margin: 0,
    marginTop: -30,
    padding: 0,
  },
  paginationDot: {
    // transform: ["scale(3)"],

    // flex: 1,
    // backgroundColor: '#000',
    // width: 500,
    // height: 200,
  }
});
