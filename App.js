import React from 'react';
import { Button, Slider, StyleSheet, Text, View } from 'react-native';
import { MapView } from 'expo';
import Alerts from './Alerts';
import { MarkerAnimated, Circle } from 'react-native-maps';

export default class App extends React.Component {
  state = {
    coords: {},
  }

  componentDidMount() {
    this.grabLocation()
  }

  grabLocation = () => {
    navigator.geolocation.getCurrentPosition(d => {
      this.setState({ coords: d.coords });
    })
  }

  render() {
    const { coords, distance, alerts } = this.state

    return (
      <View style={styles.container}>

        <Alerts currentLocation={coords} />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
