import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthRequest, AuthResponse } from '../models/auth.model';

// NOTE on localStorage: this is a real, deployed Angular app (unlike a Claude
// artifact, which can't use browser storage) - localStorage IS the standard
// place to keep a JWT in simple apps like this one. The trade-off worth
// knowing: it's readable by any JavaScript running on your page, so if your
// app were ever vulnerable to XSS, the token could be stolen. Larger
// production apps often use an httpOnly cookie instead, which JavaScript
// can't read at all - more secure, but requires the backend to set/manage
// the cookie instead of the frontend handling the token directly.
const TOKEN_KEY = 'library_auth_token';
const USERNAME_KEY = 'library_auth_username';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  register(request: AuthRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, request)
      .pipe(tap((response) => this.storeSession(response)));
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((response) => this.storeSession(response)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USERNAME_KEY, response.username);
  }
}
