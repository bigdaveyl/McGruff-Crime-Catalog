import React from 'react';
import PropTypes from "prop-types";
import { Button, Slider, StyleSheet, Text, View, ViewPropTypes, TouchableOpacity } from 'react-native';
import { MapView } from 'expo';
import { AsyncStorage } from "react-native";

const numberWithCommas = (x="") => {
  if (!x) return ""
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
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
      distance: newValue,
    });
  }

  onResetLocation = () => {
    this.props.onUpdate({
      location: ["near me"],
    })
  }

  render() {
    const { label, location, distance, ...props } = this.props

    return (
      <View style={styles.container} {...props}>
        <View style={styles.text}>
          {label && (
            <Text style={styles.label}>
              { label }:
            </Text>
          )}
          {location && (
              <Text style={styles.location}>
              { (location || []).map(d => d.slice(0, 7)).join(", ") }
            </Text>
          )}
          {distance && (
            <Text style={styles.distance}>
              { numberWithCommas(Math.round(distance)) } feet
            </Text>
          )}
        </View>

        <Slider
          style={styles.slider}
          value={distance}
          minimumValue={10}
          maximumValue={5000}
          onValueChange={this.onDistanceChange}
        />

          <TouchableOpacity style={styles.link} onPress={this.onResetLocation}>
            <Text style={styles.linkText}>Near me</Text>
          </TouchableOpacity>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flexDirection: "row",
    flex: 2,
  },
  label: {
    fontWeight: "bold",
  },
  location: {
    paddingLeft: 6,
    paddingRight: 6,
    opacity: 0.4,
  },
  slider: {
    flex: 1,
  },
  link: {
    flex: 0,
    width: 50,
  },
  linkText: {
    fontSize: 10,
  },
});
