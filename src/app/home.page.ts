import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  lat;
  lng;
  accuracy;
  timestamp;
  watch: any;
  locationWatchStarted: boolean;
  locationTraces = [];
  

  constructor(public platform: Platform,
    public geolocation: Geolocation,
    public socialSharing: SocialSharing,
    public androidPermissions: AndroidPermissions,
    public locationAccuracy: LocationAccuracy,
  ) {
    this.getPermission();
  }
  getPermission() {
    console.log("Get permission called");
    this.androidPermissions.checkPermission(
      this.androidPermissions.PERMISSION.READ_PHONE_STATE
    ).then(res => {
      if (res.hasPermission) {
        this.askToTurnOnGPS();

      } else {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE).then(res => {
          //alert("Persmission Granted Please Restart App!");
          this.requestGPSPermission();
        }).catch(error => {
          alert("Error! " + error);
        });
      }
    }).catch(error => {
      alert("Error! " + error);
    });
  }
  askToTurnOnGPS() {
    console.log("Ask permission is called");
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        // When GPS Turned ON call method to get Accurate location coordinates
        this.whereIam()
      },
      error => alert('Error requesting location permissions ' + JSON.stringify(error))
    );
  }
  requestGPSPermission() {
    console.log("Request permission is called")
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log("4");
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              //Show alert if user click on 'No Thanks'
              alert('requestPermission Error requesting location permissions ' + error)
            }
          );
      }
    });
  }

  whereIam() {
    console.log('Watch Started!');
    this.watch = this.geolocation.watchPosition();
    this.watch.subscribe((data) => {
      this.locationWatchStarted = true;
      this.locationTraces.push({
        latitude: data.coords.latitude,
        longitude: data.coords.longitude,
        accuracy: data.coords.accuracy,
        timestamp: data.timestamp
      });
    }, (err) => {
      alert("Retry");
    })
  }

  shareIt() {
    this.geolocation.getCurrentPosition({
    }).then((res) => {
      this.lat = res.coords.latitude;
      this.lng = res.coords.longitude;
      var maplink = "https://www.google.com/maps/?q=" + this.lat + "," + this.lng;
      console.log("Share map link",maplink);
      this.socialSharing.share("I am here", "Location", "", maplink).then((data) => {
      }, (err) => {
        alert("Error");
      })
    }, (err) => {
      alert("Please Enable GPS Location");
    })
  }
}
/*whereIam(){
    this.geolocation.getCurrentPosition({
      timeout: 10000, enableHighAccuracy:true
    }).then((res) => {
      var lat = res.coords.latitude;
      var lng = res.coords.longitude;
      var maplink = "https://www.google.com/maps/?q="+lat+","+lng;
      this.socialSharing.share("I am here","Location","",maplink).then((data)=> {
        console.log("Shared!")
      },(err) => {
        alert(JSON.stringify(err));
      })
    },(err)=>{
      alert(JSON.stringify(err));
    });
  }*/
/*createMap() {
      this.mapElement = document.getElementById('map');
        let mapOptions: GoogleMapOptions = {
           camera: {
             target: {
               lat: this.lat,
               lng: this.lng
             },
          zoom: 18,
          tilt: 30
           }
        };
     this.googleMap = this.googleMaps.create(this.elementMap, mapOptions);
     this.googleMap.one(GoogleMapsEvent.MAP_READY)
          .then(() => {
              console.log('Map is Ready To Use')
          });
    }*/



