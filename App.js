import React from 'react';
import { Button, Slider, StyleSheet, Text, View } from 'react-native';
import { MapView, Permissions, Notifications } from 'expo';
import Alerts from './Alerts';
import { MarkerAnimated, Circle } from 'react-native-maps';
import * as rssParser from 'react-native-rss-parser';

export default class App extends React.Component {
  state = {
    coords: {},
    token: null,
    rss: {}
  }

  componentDidMount() {
    this.grabLocation()
    this.registerForPushNotifications();
    fetch('https://www2.monroecounty.gov/911/rss.php')
      .then((response) => response.text())
      .then((responseData) => rssParser.parse(responseData))
      .then((rss) => {
        console.log(rss.title);
        console.log(rss.items.length);
        console.log(rss.items);
	var re = /([0-9]{0,} [A-Z][^a-z]+, [A-Z][a-z]*)/ ;
	for(var i = 0; i < rss.items.length; i++){
	  var tempString = rss.items[i].title;
	  var cleanstring = "";
	  cleanString = tempString.replace(re, "$1");
	  console.log(cleanString);
	}
        this.setState( {rss:  rss})
      });
  }

  grabLocation = () => {
    navigator.geolocation.getCurrentPosition(d => {
      this.setState({ coords: d.coords });
    })
  }

  handleNotification = notification => {
    console.log("notification", notification)
  }

  registerForPushNotifications = async () => {
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

    if (status !== 'granted') {
      console.log("notification permission not granted, asking")
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      if (status !== 'granted') {
        console.log("notification permission not granted")
        return;
      }
    }

    const token = await Notifications.getExpoPushTokenAsync();
    this.subscription = Notifications.addListener(this.handleNotification);

    this.setState({
      token,
    });
  }

  render() {
    const { coords, token, rss } = this.state

    return (
      <View style={styles.container}>

        <Alerts currentLocation={coords} token={token} />

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
