import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardMetrics } from '../models/dashboard.model';
import { PatientSummary } from '../models/patient.model';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${API_URL}/dashboard/metrics`);
  }

  getPatients(): Observable<PatientSummary[]> {
    return this.http.get<PatientSummary[]>(`${API_URL}/dashboard/patients`);
  }
}

