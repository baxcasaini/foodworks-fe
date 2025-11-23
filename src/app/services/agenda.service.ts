import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

export interface AgendaEvent {
  id: string;
  patient_chat_id?: string;
  patient_name?: string;
  date: string;
  type: string;
  title: string;
  notes?: string;
  source: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  constructor(private http: HttpClient) {}

  getEvents(
    startDate?: string,
    endDate?: string,
    patientChatId?: string
  ): Observable<AgendaEvent[]> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }
    if (patientChatId) {
      params = params.set('patient_chat_id', patientChatId);
    }

    return this.http.get<AgendaEvent[]>(`${API_URL}/agenda/events`, { params });
  }
}

