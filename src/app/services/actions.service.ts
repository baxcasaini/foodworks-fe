import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

export interface ActionRequest {
  patient_chat_id: string;
  action_type: 'checkin' | 'modify_plan' | 'message' | 'high_five';
  message?: string;
  action_data?: any;
}

export interface ActionResponse {
  success: boolean;
  action_id?: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActionsService {
  constructor(private http: HttpClient) {}

  createAction(action: ActionRequest): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(`${API_URL}/actions`, action);
  }

  quickCheckin(patientChatId: string, message?: string): Observable<ActionResponse> {
    let url = `${API_URL}/actions/checkin?patient_chat_id=${patientChatId}`;
    if (message) {
      url += `&message=${encodeURIComponent(message)}`;
    }
    return this.http.post<ActionResponse>(url, {});
  }

  highFive(patientChatId: string, message?: string): Observable<ActionResponse> {
    let url = `${API_URL}/actions/high-five?patient_chat_id=${patientChatId}`;
    if (message) {
      url += `&message=${encodeURIComponent(message)}`;
    }
    return this.http.post<ActionResponse>(url, {});
  }
}

