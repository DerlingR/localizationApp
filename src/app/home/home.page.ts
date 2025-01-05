import { Component } from '@angular/core';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage {
  currentLocation: { latitude: number; longitude: number } | null = null;

  constructor(private geolocation: Geolocation) {}

  getLocation() {
    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        this.currentLocation = {
          latitude: resp.coords.latitude,
          longitude: resp.coords.longitude,
        };
      })
      .catch((error) => {
        console.error('Error getting location', error);
      });
  }
}