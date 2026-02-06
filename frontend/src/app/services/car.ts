import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private http = inject(HttpClient);
  // URL to your Node.js backend
  // private apiUrl = 'http://localhost:3000/api/cars'; // OLD
private apiUrl = 'https://skyblue-buffalo-277376.hostingersite.com/api/cars'; // NEW

  /**
   * Fetches the full inventory from MongoDB
   */
  getCars(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Fetches a single car by its MongoDB _id (String)
   */
  getCarById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Sends a POST request to add a new car listing
   * @param carData The car object from the admin modal
   */
  addCar(carData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, carData);
  }

  /**
   * Sends a DELETE request to remove a car listing by ID
   * @param id The MongoDB _id of the vehicle
   */
  deleteCar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  // Inside your CarService class
updateCar(id: string, data: any): Observable<any> {
  // This sends a PATCH or PUT request to update only specific fields (like the gallery)
  return this.http.patch(`${this.apiUrl}/${id}`, data);
}
}
