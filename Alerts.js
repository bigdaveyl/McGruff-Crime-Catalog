import React from 'react';
// import MapView from 'react-native-maps';
import { MarkerAnimated, Circle } from 'react-native-maps';
import { Button, Slider, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MapView } from 'expo';
import { AsyncStorage } from "react-native";
import AlertItem from "./AlertItem"

const milesToMeters = d => d * 1609.344;
const feetToMeters = d => d * 0.3048;
const MAX_ALERTS = 5;
const STORAGE_BASE = "@McGruffCrimeCatalog:";
const KEY_SEPERATOR = "--";
const LOCATION_SEPARATOR = ",";
const nearMeString = "near me";
export default class Alerts extends React.Component {
  state = {
    alerts: [],
  }
  map = null

  componentDidMount() {
    this.grabAlerts();
  }

  parseAlert = (alert="", i) => ({
    label: `Alert ${i + 1}`,
    location: alert.split(KEY_SEPERATOR)[0].split(LOCATION_SEPARATOR).map(d => d.trim()),
    distance: +alert.split(KEY_SEPERATOR)[1] || 10,
  })

  formatAlert = ({ location, distance }) => (
    [
      location.join(LOCATION_SEPARATOR),
      distance
    ].join(KEY_SEPERATOR)
  )

  grabAlerts = async () => {
    let alerts = [];
    for (let i = 0; i < MAX_ALERTS; i++) {
      const alertString = await this.grabAlert(i)
      if (alertString) alerts.push(this.parseAlert(alertString, i))
    }
    this.setState({ alerts });
  }

  grabAlert = async i => await AsyncStorage.getItem(`${STORAGE_BASE}alert${i}`);

  onUpdateAlert = index => ({ location, distance }) => {
    const { alerts } = this.state
    const currentAlert = Object.assign({}, alerts[index], location && {location}, distance && {distance})
    const updatedAlert = this.formatAlert(currentAlert)
    AsyncStorage.setItem(`${STORAGE_BASE}alert${index}`, updatedAlert)
    this.grabAlerts()
  }

  onMarkerDragEnd = index => e => {
    const coords = e.nativeEvent.coordinate
    const location = [ coords.latitude, coords.longitude ]
    this.onUpdateAlert(index)({location})
  }

  setMapRegionToAlert = alertIndex => () => {
    console.log("setMapRegionToAlert")
    const { currentLocation } = this.props
    const { alerts } = this.state
    const alert = alerts[alertIndex]
    console.log(alert)
    if (!alert) return

    if (this.map) this.map.animateToCoordinate(alert.location[0] == nearMeString ? currentLocation : {
        latitude: +alert.location[0],
        longitude: +alert.location[1],
      },
      300,
    )
    console.log()
  }

  render() {
    const { currentLocation } = this.props
    const { alerts } = this.state
    console.log(alerts)
    console.log(currentLocation)

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
                  coordinate={alert.location[0] == nearMeString ? currentLocation : {
                    latitude: +alert.location[0],
                    longitude: +alert.location[1],
                  }}
                  title={alert.label}
                />
                <Circle
                  center={alert.location[0] == nearMeString ? currentLocation : {
                    latitude: +alert.location[0],
                    longitude: +alert.location[1],
                  }}
                  radius={feetToMeters(alert.distance)}
                  strokeColor="transparent"
                  fillColor="rgba(24,24,50, 0.2)"
                />
              </React.Fragment>
          ))}
          </MapView>
        )}

        <View>
          {/* <View style={{padding: 20, marginBottom: 20, backgroundColor:'#eaeaea'}}>
            <Text style={{ fontSize: 22 }}>Alerts</Text>
          </View> */}

          {alerts.map((alert, i) => (
            <TouchableOpacity
              key={i}
              onPress={this.setMapRegionToAlert(i)}
              >
              <AlertItem
                index={i}
                label={alert.label}
                location={alert.location}
                distance={alert.distance}
                onUpdate={this.onUpdateAlert(i)}
              />
            </TouchableOpacity>
          ))}

          {alerts.length < MAX_ALERTS && (
            <AlertItem
              location={null}
              distance={null}
              onUpdate={this.onUpdateAlert(alerts.length + 1)}
            />
          )}
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#fafafa',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
