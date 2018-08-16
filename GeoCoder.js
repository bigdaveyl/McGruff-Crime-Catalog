const NodeGeocoder = require('node-geocoder');
const config = require('./app.json');

 
const geocoder = NodeGeocoder(config.geoCode);
 
export function getCords(address){
    return geocoder.geocode(address)
    .then(function(res) {
        return [res[0].latitude, res[0].longitude];
    })
    .catch(function(err) {
      console.log(err);
    });

}


