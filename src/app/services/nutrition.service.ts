import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

export interface DietSummary {
  id: number;
  chat_id: string;
  patient_name: string;
  diet_name?: string;
  diet_type?: string;
  creation_date: string;
  status: string;
  days?: number;
}

export interface NutritionStats {
  total_active_plans: number;
  total_patients_with_plans: number;
  plans_to_review: number;
  average_compliance: number;
  total_calories_distributed: number;
  average_daily_calories: number;
}

export interface DietTemplate {
  id: number;
  name: string;
  description: string;
  diet_type: string;
  calories: number;
  macros: {
    carbs: number;
    proteins: number;
    fats: number;
  };
  days: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<NutritionStats> {
    return this.http.get<NutritionStats>(`${API_URL}/nutrition/stats`);
  }

  getAllPlans(status?: string, patientChatId?: string): Observable<DietSummary[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (patientChatId) {
      params = params.set('patient_chat_id', patientChatId);
    }
    return this.http.get<DietSummary[]>(`${API_URL}/nutrition/plans`, { params });
  }

  getTemplates(): Observable<DietTemplate[]> {
    return this.http.get<DietTemplate[]>(`${API_URL}/nutrition/templates`);
  }
}

