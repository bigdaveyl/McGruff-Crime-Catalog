import React from 'react';
import PropTypes from "prop-types";
import { Button, Dimensions, Modal, Slider, StyleSheet, Text, View, ViewPropTypes, TouchableHighlight, TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import { MapView } from 'expo';
import { AsyncStorage } from "react-native";
import AlertItemModal from "./AlertItemModal"

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const numberWithCommas = (x="") => {
  if (!x) return ""
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
export default class AlertItem extends React.Component {
  state = {
    isExpanded: false,
  }

  static propTypes = {
    location: PropTypes.array,
    distance: PropTypes.number,
    onUpdate: PropTypes.func,
  }

  componentDidMount() {
  }

  onDistanceChange = newValue => {
    this.props.onUpdate({
      distance: newValue,
    });
  }

  onResetLocation = () => {
    console.log("onResetLocation")
    this.props.onUpdate({
      latitude: null,
      longitude: null,
    })
  }

  onModalToggle = (newState) => () => {
    if (newState && !this.props.distance) this.createAlert();
    this.setState({ isExpanded: newState });
  }

  createAlert = () => {
    this.props.onUpdate({
      distance: 20,
    })
  }

  render() {
    const { index, label, latitude, longitude, distance, color, onDelete, ...props } = this.props
    const { isExpanded } = this.state
    const isNewAlert = !distance;

    return (
      <TouchableNativeFeedback onPress={this.onModalToggle(true)}>
          <View style={styles.container} {...props}>
            {isExpanded && (
              <AlertItemModal
                label={label}
                latitude={latitude}
                longitude={longitude}
                distance={distance}
                isVisible={true}
                onDistanceChange={this.onDistanceChange}
                onResetLocation={this.onResetLocation}
                onClose={this.onModalToggle(false)}
                onDelete={onDelete}
              />
            )}

            {isNewAlert ? (
                <View styles={{alignItems: "center", justifyContent: "center", width: "100%", height: "100%"}}>
                  <Text style={{margin: "auto"}}>
                    Add new alert
                  </Text>
                </View>
            ) : (
              <View>
                {label && (
                  <View>
                    <Text style={styles.label}>
                      { (label || `Alert ${ index }`).toUpperCase() }
                    </Text>
                  </View>
                )}
                <View style={styles.content}>
                  <View style={styles.text}>
                    {!latitude && (
                      <Text style={styles.location}>
                        Near me
                      </Text>
                    )}
                    {false && latitude && (
                      <Text style={styles.location}>
                        { latitude }, { longitude }
                      </Text>
                    )}
                    {distance && (
                      <Text style={styles.distance}>
                        { numberWithCommas(Math.round(distance)) } feet
                      </Text>
                    )}

                    <Slider
                      style={styles.slider}
                      value={distance}
                      minimumValue={10}
                      maximumValue={5000}
                      onValueChange={this.onDistanceChange}
                    />
                </View>
              </View>
            </View>
          )}
        </View>
      </TouchableNativeFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // width: "100%",
    flexDirection: "column",
    height: 80,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    paddingTop: 17,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 12,
  },
  containerExpanded: {
    flexDirection: "column",
    height: viewportHeight * 0.9,
    width: viewportWidth * 0.9,
    marginTop: -viewportHeight * 0.8,
    marginBottom: 20,
    padding: 20,
    paddingTop: 17,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 12,

  },
  content: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flexDirection: "row",
    flex: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  location: {
    // paddingLeft: 6,
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