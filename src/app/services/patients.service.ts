import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timeout, catchError } from 'rxjs';
import { Patient, PatientDetail, PatientListItem } from '../models/patient.model';
import { API_URL } from '../config/api.config';
const REQUEST_TIMEOUT = 10000; // 10 secondi

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  constructor(private http: HttpClient) {}

  getPatients(): Observable<PatientListItem[]> {
    return this.http.get<PatientListItem[]>(`${API_URL}/patients`).pipe(
      timeout(REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  getPatientDetail(chatId: string): Observable<PatientDetail> {
    return this.http.get<PatientDetail>(`${API_URL}/patients/${chatId}`).pipe(
      timeout(REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    let errorMessage = 'Errore sconosciuto';
    
    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        // Errore lato client
        errorMessage = `Errore: ${error.error.message}`;
      } else {
        // Errore lato server
        errorMessage = `Errore ${error.status}: ${error.error?.detail || error.message || 'Errore del server'}`;
      }
    } else if (error.name === 'TimeoutError') {
      errorMessage = 'Timeout: la richiesta ha impiegato troppo tempo';
    } else {
      errorMessage = error.message || 'Errore sconosciuto';
    }
    
    console.error('PatientsService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}

