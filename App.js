import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default class App extends React.Component {
  state = {
    coords: {},
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(d => {
      this.setState({ coords: d.coords})
    })
  }

  render() {
    const { coords } = this.state
    return (
      <View style={styles.container}>
        <Text>This is where you are</Text>
        <Text>latitude: {coords.latitude}</Text>
        <Text>longitude: {coords.longitude}</Text>
        <Button title="I'm a button" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
