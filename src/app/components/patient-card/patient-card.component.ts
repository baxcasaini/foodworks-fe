import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PatientSummary } from '../../models/patient.model';
import { ChurnIndicatorComponent } from '../churn-indicator/churn-indicator.component';

@Component({
  selector: 'app-patient-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ChurnIndicatorComponent
  ],
  template: `
    <mat-card class="patient-card">
      <mat-card-header>
        <mat-card-title>{{ patient.name }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p class="issue-description">{{ patient.issue_description }}</p>
        <app-churn-indicator 
          [score]="patient.churn_score" 
          [riskLevel]="patient.churn_risk_level">
        </app-churn-indicator>
      </mat-card-content>
      <mat-card-actions>
        <button 
          *ngIf="patient.action_type === 'urgent'"
          mat-raised-button 
          color="warn"
          (click)="onQuickCheckin()"
          class="action-button">
          Check-in Rapido
        </button>
        <button 
          *ngIf="patient.action_type === 'review'"
          mat-raised-button 
          color="accent"
          (click)="onModifyPlan()"
          class="action-button">
          Modifica piano
        </button>
        <button 
          *ngIf="patient.action_type === 'positive'"
          mat-raised-button 
          color="primary"
          (click)="onHighFive()"
          class="action-button">
          Batti 5 👋
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .patient-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    mat-card-header {
      margin-bottom: 1rem;
    }

    mat-card-title {
      font-size: 1.125rem;
      font-weight: 500;
    }

    .issue-description {
      color: #757575;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    mat-card-actions {
      margin-top: auto;
      padding: 1rem;
    }

    .action-button {
      width: 100%;
    }
  `]
})
export class PatientCardComponent {
  @Input() patient!: PatientSummary;
  @Output() quickCheckin = new EventEmitter<string>();
  @Output() modifyPlan = new EventEmitter<string>();
  @Output() highFive = new EventEmitter<string>();

  onQuickCheckin(): void {
    this.quickCheckin.emit(this.patient.chat_id);
  }

  onModifyPlan(): void {
    this.modifyPlan.emit(this.patient.chat_id);
  }

  onHighFive(): void {
    this.highFive.emit(this.patient.chat_id);
  }
}

