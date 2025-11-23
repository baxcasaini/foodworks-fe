import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="header">
      <div class="header-content">
        <div class="greeting">
          <h1>Buongiorno, {{ nutritionistName }}</h1>
          <p *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <div class="header-actions">
          <button mat-icon-button (click)="logout()" matTooltip="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header {
      background-color: #ffffff;
      border-bottom: 1px solid #e0e0e0;
      padding: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .greeting h1 {
      font-size: 2rem;
      font-weight: 500;
      margin: 0;
      color: #212121;
    }

    .greeting p {
      margin: 0.5rem 0 0 0;
      color: #757575;
      font-size: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() subtitle = '';
  nutritionistName = 'Dr. Rossi';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.full_name) {
      this.nutritionistName = user.full_name;
    } else if (user?.username) {
      this.nutritionistName = `Dr. ${user.username}`;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

