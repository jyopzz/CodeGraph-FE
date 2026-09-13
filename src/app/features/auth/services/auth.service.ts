import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserProfile {
  userId: number;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        tap(() => this.checkSession().subscribe()), // Refresh user profile on login
      );
  }

  /**
   * Uses the refresh token cookie to create a new authenticated session.
   * The backend is expected to rotate/set the authentication cookie here.
   */
  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh`, {}, {
      withCredentials: true,
    });
  }

  checkSession(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/me`, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response && response.successful) {
            this.currentUserSubject.next(response.data);
          } else {
            this.currentUserSubject.next(null);
          }
        }),
      );
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.currentUserSubject.next(null)));
  }

  sendOtp(payload: { email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/send-otp`, payload, {
      withCredentials: true,
    });
  }

  verifyOtp(payload: { email: string; otp: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/verify-otp`, payload, {
      withCredentials: true,
    });
  }

  setPassword(payload: {
    password: string;
    reenterPassword: string;
  }): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/register/set-password`, payload, {
        withCredentials: true,
      })
      .pipe(
        tap(() => this.checkSession().subscribe()), // Hydrates currentUserSubject with the new session
      );
  }
}
