import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>{{ 'login.title' | translate }}</mat-card-title>
          <mat-card-subtitle>{{ 'login.subtitle' | translate }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'login.username' | translate }}</mat-label>
              <input matInput formControlName="username" required>
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                {{ 'login.usernameRequired' | translate }}
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'login.password' | translate }}</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                {{ 'login.passwordRequired' | translate }}
              </mat-error>
            </mat-form-field>

            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="loginForm.invalid || loading" class="full-width">
              {{ loading ? ('login.loggingIn' | translate) : ('login.loginButton' | translate) }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .error-message {
      color: #f44336;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    mat-card-header {
      margin-bottom: 2rem;
    }

    mat-card-title {
      font-size: 1.5rem;
      font-weight: 500;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = '';
          console.error('Login error:', err);
        }
      });
    }
  }
}

