import { Component } from '@angular/core';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

interface Place {
  name: string;
  vicinity: string;
  distance: number;
  types: string[];
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage {
  currentLocation: { latitude: number; longitude: number } | null = null;
  nearbyPlaces: Place[] = [];
  isLoading = false;
  errorMessage = '';
  
  // Categorías de lugares
  placeTypes = [
    { id: 'restaurant', name: 'Restaurantes' },
    { id: 'tourist_attraction', name: 'Turismo' },
    { id: 'store', name: 'Tiendas' }
  ];

  constructor(private geolocation: Geolocation) {}

  async getLocation() {
    try {
      this.isLoading = true;
      const resp = await this.geolocation.getCurrentPosition();
      this.currentLocation = {
        latitude: resp.coords.latitude,
        longitude: resp.coords.longitude
      };
      this.errorMessage = '';
    } catch (error) {
      console.error('Error getting location', error);
      this.errorMessage = 'No se pudo obtener la ubicación. Por favor, verifica los permisos de GPS.';
    } finally {
      this.isLoading = false;
    }
  }

  async searchNearbyPlaces(type: string) {
    if (!this.currentLocation) {
      this.errorMessage = 'Primero debes obtener tu ubicación actual';
      return;
    }

    try {
      this.isLoading = true;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${this.currentLocation.latitude},${this.currentLocation.longitude}&radius=1500&type=${type}&key=${environment.googleMapsApiKey}`
      );
      const data = await response.json();
      
      this.nearbyPlaces = data.results.map((place: any) => ({
        name: place.name,
        vicinity: place.vicinity,
        types: place.types,
        distance: this.calculateDistance(
          this.currentLocation!.latitude,
          this.currentLocation!.longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        )
      }));
    } catch (error) {
      console.error('Error fetching nearby places', error);
      this.errorMessage = 'Error al buscar lugares cercanos';
    } finally {
      this.isLoading = false;
    }
  }

  // Función para calcular la distancia entre dos puntos
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return Math.round((R * c) * 100) / 100; // Distancia en km con 2 decimales
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  shareLocation() {
    if (this.currentLocation) {
      const locationUrl = `https://www.google.com/maps?q=${this.currentLocation.latitude},${this.currentLocation.longitude}`;
      if (navigator.share) {
        navigator.share({
          title: 'Mi ubicación',
          text: '¡Esta es mi ubicación actual!',
          url: locationUrl
        });
      } else {
        // Fallback para navegadores que no soportan Web Share API
        navigator.clipboard.writeText(locationUrl);
        // Aquí deberías mostrar un toast o alerta indicando que se copió al portapapeles
      }
    }
  }
}