import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardMetrics } from '../../models/dashboard.model';

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="summary-cards">
      <mat-card class="summary-card urgent">
        <div class="card-content">
          <div class="card-icon urgent-icon">
            <mat-icon>warning</mat-icon>
          </div>
          <div class="card-info">
            <h3>Criticità urgenti</h3>
            <p class="card-value">{{ metrics?.urgent_criticalities || 0 }}</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="summary-card review">
        <div class="card-content">
          <div class="card-icon review-icon">
            <mat-icon>folder</mat-icon>
          </div>
          <div class="card-info">
            <h3>Piani da revisionare</h3>
            <p class="card-value">{{ metrics?.plans_to_review || 0 }}</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="summary-card retention">
        <div class="card-content">
          <div class="card-icon retention-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="card-info">
            <h3>Retention pazienti</h3>
            <p class="card-value">{{ metrics?.patient_retention || 0 }}%</p>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      padding: 1.5rem;
    }

    .card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .card-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }

    .urgent-icon {
      background-color: #ffebee;
      color: #f44336;
    }

    .review-icon {
      background-color: #fff8e1;
      color: #ffc107;
    }

    .retention-icon {
      background-color: #e3f2fd;
      color: #2196f3;
    }

    .card-info h3 {
      margin: 0;
      font-size: 0.875rem;
      color: #757575;
      font-weight: 400;
    }

    .card-value {
      margin: 0.5rem 0 0 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .urgent .card-value {
      color: #f44336;
    }

    .review .card-value {
      color: #ffc107;
    }

    .retention .card-value {
      color: #2196f3;
    }
  `]
})
export class SummaryCardsComponent {
  @Input() metrics?: DashboardMetrics;
}

