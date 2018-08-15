import React from 'react';
// import MapView from 'react-native-maps';
import { Button, Slider, StyleSheet, Text, View } from 'react-native';
import { MapView } from 'expo';
import { AsyncStorage } from "react-native";
import AlertItem from "./AlertItem"

const MAX_ALERTS = 5;
const STORAGE_BASE = "@McGruffCrimeCatalog:";
const KEY_SEPERATOR = "--";
const LOCATION_SEPARATOR = ",";
export default class Alerts extends React.Component {
  state = {
    alerts: [],
  }

  componentDidMount() {
    this.grabAlerts();
  }

  parseAlert = alert => ({
    location: alert.split(KEY_SEPERATOR)[0].split(LOCATION_SEPARATOR).map(d => d.replace("-", " ")),
    distance: +alert.split(KEY_SEPERATOR)[1],
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
      const alertString = await AsyncStorage.getItem(`${STORAGE_BASE}alert${i}`);
      console.log(alertString)
      if (alertString) alerts.push(this.parseAlert(alertString));
    }
    console.log(alerts)
    this.setState({ alerts });
  }

  onUpdateAlert = index => ({ location, distance }) => {
    const updatedAlert = this.formatAlert({ location, distance });
    AsyncStorage.setItem(`${STORAGE_BASE}alert${index}`, updatedAlert);
  }

  render() {
    const { currentLocation } = this.props
    const { alerts } = this.state

    return (
      <View style={styles.container}>
        <View style={{padding: 20, marginBottom: 20, backgroundColor:'#eaeaea'}}>
          <Text style={{ fontSize: 22 }}>Alerts</Text>
        </View>

        {currentLocation.latitude && (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.0022,
              longitudeDelta: 0.0021,
            }}
            showsUserLocation
          >
          {false && alerts.map((alert, i) => (
              <React.Fragment key={i}>
                <MarkerAnimated
                  coordinate={{
                    latitude:  alert.location[0] != "near me" ? alert.location[0] : currentLocation.latitude,
                    longitude: alert.location[0] != "near me" ? alert.location[1] : currentLocation.longitude,
                  }}
                  title={`Alert ${i}`}
                />
                <Circle
                  center={{
                    latitude:  alert.location[0] != "near me" ? alert.location[0] : currentLocation.latitude,
                    longitude: alert.location[0] != "near me" ? alert.location[1] : currentLocation.longitude,
                  }}
                  radius={feetToMeters(alert.distance)}
                  strokeColor="transparent"
                  fillColor="rgba(24,24,50, 0.2)"
                />
              </React.Fragment>
          ))}
          </MapView>
        )}

        <View style={{
          paddingLeft: 20,
        }}>

          {alerts.map((alert, i) => (
            <AlertItem
              key={i}
              location={alert.location}
              distance={alert.distance}
              onUpdate={this.onUpdateAlert(i)}
            />
          ))}

          <AlertItem
            location={null}
            distance={null}
            onUpdate={this.onUpdateAlert(alerts.length + 1)}
          />
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 20,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
