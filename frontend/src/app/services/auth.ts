import { Injectable, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // The official endpoint for your Buffalo backend
  private apiUrl = 'https://skyblue-buffalo-277376.hostingersite.com/api/login';

  /**
   * Initial check: safely access localStorage only when running in the browser.
   * This prevents 'localStorage is not defined' errors during build/SSR.
   */
  private get initialStatus(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('isAdmin') === 'true';
    }
    return false;
  }

  // Reactive signal to track login state throughout the showroom app
  isLoggedIn = signal<boolean>(this.initialStatus);

  constructor() {
    /**
     * Effect: Automatically syncs the signal state to LocalStorage.
     * Whenever this.isLoggedIn() changes, this code runs automatically.
     */
    effect(() => {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (this.isLoggedIn()) {
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }
      }
    });
  }

  /**
   * AUTHENTICATION HANDSHAKE
   * Sends credentials to server.js on the Buffalo server.
   * Only updates the UI signal if the database confirms the user exists.
   */
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrl, credentials).pipe(
      tap({
        next: (response: any) => {
          console.log('✅ Login Successful:', response.user);
          this.isLoggedIn.set(true);
        },
        error: (err) => {
          console.error('❌ Login Failed:', err.error.message || 'Server Error');
          this.isLoggedIn.set(false);
        }
      })
    );
  }

  /**
   * Clears the session and updates the UI instantly.
   */
  logout() {
    this.isLoggedIn.set(false);
  }
}