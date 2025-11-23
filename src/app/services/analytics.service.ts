import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsData } from '../models/analytics.model';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private http: HttpClient) {}

  getAnalyticsOverview(): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${API_URL}/analytics/overview`);
  }
}

