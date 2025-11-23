import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, Nutritionist } from '../models/auth.model';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<Nutritionist | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Carica utente corrente se c'è un token salvato
    const token = this.getToken();
    if (token) {
      this.loadCurrentUser();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // FastAPI OAuth2PasswordRequestForm si aspetta application/x-www-form-urlencoded
    const body = new URLSearchParams();
    body.set('username', credentials.username);
    body.set('password', credentials.password);

    return this.http.post<LoginResponse>(
      `${API_URL}/auth/login`,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    ).pipe(
      tap(response => {
        this.setToken(response.access_token);
        this.loadCurrentUser();
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): Nutritionist | null {
    return this.currentUserSubject.value;
  }

  private loadCurrentUser(): void {
    this.http.get<Nutritionist>(`${API_URL}/auth/me`).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
      },
      error: (err) => {
        console.error('Error loading current user:', err);
        // Non fare logout automatico se è solo un errore di rete
        if (err.status === 401) {
          this.logout();
        }
      }
    });
  }
}

