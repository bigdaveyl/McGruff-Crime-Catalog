import React from 'react';
import PropTypes from "prop-types";
import { BackHandler, Button, Dimensions, Modal, Slider, StyleSheet, Text, View, ViewPropTypes, TouchableHighlight, TouchableOpacity } from 'react-native';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const numberWithCommas = (x="") => {
  if (!x) return ""
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
export default class AlertItemModal extends React.Component {
  state = {
  }

  static propTypes = {
    location: PropTypes.array,
    distance: PropTypes.number,
    onUpdate: PropTypes.func,
    onResetLocation: PropTypes.func,
  }

  static defaultProps = {
    distance: 10,
  }

  componentDidMount() {
    console.log("componentDidMount")
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress = () => {
    console.log("back")
    this.props.onClose()
    return true
  }

  onDelete = () => {
    this.props.onDelete()
    this.props.onClose()
  }

  render() {
    const { index, label, latitude, longitude, distance, isVisible, onDistanceChange, onResetLocation, onDelete, onClose,...props } = this.props
    const isNewAlert = !latitude

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={isVisible}
        style={{margin: 50}}
        presentationStyle="pageSheet"
        onRequestClose={() => {}}>
        <View style={{padding: 20, flexDirection: "column", justifyContent: "space-between", flex: 1, height: "100%"}}>
          <View style={{}}>

            {label && (
              <View>
                <Text style={styles.label}>
                  { (label || `Alert ${ index }`).toUpperCase() }
                </Text>
              </View>
            )}
            <View style={{
              flexDirection: "column",
              justifyContent: 'center',
            }}>
              <View style={{
                flexDirection: "column",
              }}>
                {latitude ? (
                  <View style={{flexDirection: 'row', justifyContent: "space-between", alignItems: 'center',}}>
                    <Text style={styles.location}>
                      { latitude.slice(0, 7) }, { longitude.slice(0, 7) }
                    </Text>
                    <Button onPress={onResetLocation} title="Set to near me" />
                  </View>
                ) : (
                  <Text style={styles.location}>
                    Near me
                  </Text>
                )}
                {distance && (
                  <Text style={styles.distance}>
                    { numberWithCommas(Math.round(distance)) } feet
                  </Text>
                )}

                <Slider
                  style={{flex: 1, width: "100%"}}
                  value={distance}
                  minimumValue={10}
                  maximumValue={5000}
                  onSlidingComplete={onDistanceChange}
                />
            </View>

          </View>
        </View>

        <View style={{marginTop: "auto"}}>
          <View style={{marginBottom: 20,}}>
            <Button
              onPress={this.onDelete} title="Delete Alert"
            />
          </View>
          <Button
            onPress={onClose} title="Back to map"
          />
        </View>
      </View>
    </Modal>
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