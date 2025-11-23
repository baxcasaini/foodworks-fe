import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-churn-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="churn-indicator">
      <div class="churn-badge" [ngClass]="riskClass">
        <span class="risk-label">{{ riskLabel }}</span>
        <span class="risk-score">{{ score }}%</span>
      </div>
    </div>
  `,
  styles: [`
    .churn-indicator {
      margin: 0.5rem 0;
    }

    .churn-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .risk-low {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .risk-medium {
      background-color: #fff8e1;
      color: #f57c00;
    }

    .risk-high {
      background-color: #ffebee;
      color: #c62828;
    }

    .risk-label {
      text-transform: uppercase;
      font-size: 0.625rem;
    }

    .risk-score {
      font-weight: 600;
    }
  `]
})
export class ChurnIndicatorComponent {
  @Input() score: number = 0;
  @Input() riskLevel: 'low' | 'medium' | 'high' = 'low';

  get riskClass(): string {
    return `risk-${this.riskLevel}`;
  }

  get riskLabel(): string {
    const labels = {
      low: 'Basso',
      medium: 'Medio',
      high: 'Alto'
    };
    return labels[this.riskLevel] || 'Sconosciuto';
  }
}

