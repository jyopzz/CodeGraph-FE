import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';

export interface ProfileDetails {
  displayName: string;
  dateOfBirth: string | Date;
  gender: 'FEMALE' | 'MALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  bio: string;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/profiles`;

  getProfile(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  createProfile(payload: ProfileDetails): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  patchProfile(payload: Partial<ProfileDetails>): Observable<any> {
    return this.http.patch<any>(this.apiUrl, payload);
  }
}