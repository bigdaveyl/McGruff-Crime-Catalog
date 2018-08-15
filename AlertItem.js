import React from 'react';
import PropTypes from "prop-types";
import { Button, Slider, StyleSheet, Text, View, ViewPropTypes } from 'react-native';
import { MapView } from 'expo';
import { AsyncStorage } from "react-native";

export default class AlertItem extends React.Component {
  state = {
  }

  static propTypes = {
    location: PropTypes.array,
    distance: PropTypes.number,
    onUpdate: PropTypes.func,
  }

  componentDidMount() {
  }

  updateDistance = newValue => {
    this.setState({ distance: newValue });
    this.storeData(newValue);
  }

  storeData = (distance) => {
    const index = 0;
    AsyncStorage.setItem(`${STORAGE_BASE}alert${index}`, distance + "")
    this.grabAlerts();
  }

  grabAlerts = async () => {
    let alerts = [];
    for (let i = 0; i < MAX_ALERTS; i++) {
      const alert = await AsyncStorage.getItem(`${STORAGE_BASE}alert${i}`);
      if (alert) alerts.push(alert);
    }
    this.setState({ alerts });
  }

  onDistanceChange = newValue => {
    this.props.onUpdate({
      location: ["near-me"],
      distance: newValue,
    });
  }

  render() {
    const { location, distance } = this.props

    return (
      <View style={styles.container}>
          <Text>
            Alert: { location } { distance }
          </Text>

          <Slider
            value={distance}
            maximumValue={20}
            onValueChange={this.onDistanceChange}
            style={{ width: "100%" }}
          />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
