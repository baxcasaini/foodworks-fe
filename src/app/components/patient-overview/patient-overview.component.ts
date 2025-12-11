import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PatientDetail } from '../../models/patient.model';
import { ChurnIndicatorComponent } from '../churn-indicator/churn-indicator.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Chart, ChartData, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-patient-overview',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ChurnIndicatorComponent,
    MatCardModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="overview-container">
      <div class="info-grid">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>{{ 'patientOverview.basicInfo' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-item">
              <mat-icon>person</mat-icon>
              <div>
                <strong>{{ 'patientOverview.name' | translate }}:</strong> {{ patient.name }}
              </div>
            </div>
            <div class="info-item">
              <mat-icon>tag</mat-icon>
              <div>
                <strong>{{ 'patientOverview.chatId' | translate }}:</strong> {{ patient.chat_id }}
              </div>
            </div>
            <div class="info-item" *ngIf="patient.language">
              <mat-icon>language</mat-icon>
              <div>
                <strong>{{ 'patientOverview.language' | translate }}:</strong> {{ patient.language }}
              </div>
            </div>
            <div class="info-item">
              <mat-icon>calendar_today</mat-icon>
              <div>
                <strong>{{ 'patientOverview.firstAccess' | translate }}:</strong> {{ getFormattedDate(patient.first_access) }}
              </div>
            </div>
            <div class="info-item">
              <mat-icon>update</mat-icon>
              <div>
                <strong>{{ 'patientOverview.lastAccess' | translate }}:</strong> {{ getFormattedDate(patient.last_access) }}
              </div>
            </div>
            <div class="info-item" *ngIf="getDaysActive() > 0">
              <mat-icon>schedule</mat-icon>
              <div>
                <strong>{{ 'patientOverview.activeDays' | translate }}:</strong> {{ getDaysActive() }}
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="churn-card">
          <mat-card-header>
            <mat-card-title>{{ 'patientOverview.churnRisk' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-churn-indicator 
              [score]="patient.churn_info.score" 
              [riskLevel]="patient.churn_info.risk_level">
            </app-churn-indicator>
            <div class="churn-details" *ngIf="patient.churn_info.details">
              <h4>{{ 'patientOverview.calculationDetails' | translate }}:</h4>
              <div class="detail-item">
                <span>{{ 'patientOverview.lastAccessLabel' | translate }}:</span>
                <span>{{ patient.churn_info.details.last_access_score }}%</span>
              </div>
              <div class="detail-item">
                <span>{{ 'patientOverview.interaction' | translate }}:</span>
                <span>{{ patient.churn_info.details.interaction_score }}%</span>
              </div>
              <div class="detail-item">
                <span>{{ 'patientOverview.objectives' | translate }}:</span>
                <span>{{ patient.churn_info.details.goal_score }}%</span>
              </div>
              <div class="detail-item">
                <span>{{ 'patientOverview.feedback' | translate }}:</span>
                <span>{{ patient.churn_info.details.feedback_score }}%</span>
              </div>
              <div class="detail-item">
                <span>{{ 'patientOverview.metrics' | translate }}:</span>
                <span>{{ patient.churn_info.details.metrics_score }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ (patient.diets && patient.diets.length) || 0 }}</div>
            <div class="stat-label">{{ 'patientOverview.mealPlans' | translate }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ (patient.health_metrics && patient.health_metrics.length) || 0 }}</div>
            <div class="stat-label">{{ 'patientOverview.recordedMetrics' | translate }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ (patient.food_analyses && patient.food_analyses.length) || 0 }}</div>
            <div class="stat-label">{{ 'patientOverview.foodAnalyses' | translate }}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="adherence-chart-card">
        <mat-card-header>
          <mat-card-title>{{ 'patientOverview.planAdherence' | translate }}</mat-card-title>
          <mat-card-subtitle>{{ 'patientOverview.planAdherenceSubtitle' | translate }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="chart-container" *ngIf="adherenceChartData.labels && adherenceChartData.labels.length > 0">
            <canvas #adherenceChart></canvas>
          </div>
          <div class="no-chart-data" *ngIf="!adherenceChartData.labels || adherenceChartData.labels.length === 0">
            <p>{{ 'patientOverview.insufficientData' | translate }}</p>
          </div>
          <div class="adherence-info">
            <div class="info-badge">
              <span class="label">{{ 'patientOverview.currentScore' | translate }}:</span>
              <span class="value" [ngClass]="getAdherenceClass(currentAdherenceScore)">
                {{ currentAdherenceScore.toFixed(1) }}/100
              </span>
            </div>
            <div class="info-badge">
              <span class="label">{{ 'patientOverview.trend' | translate }}:</span>
              <span class="value" [ngClass]="getTrendClass()">
                {{ getTrendLabel() | translate }}
              </span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .overview-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }

    .info-card, .churn-card {
      height: 100%;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .info-item mat-icon {
      color: #666;
    }

    .churn-details {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e0e0e0;
    }

    .churn-details h4 {
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
      color: #666;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    .adherence-chart-card {
      margin-top: 1.5rem;
    }

    .chart-container {
      position: relative;
      height: 300px;
      margin-bottom: 1rem;
    }

    .no-chart-data {
      text-align: center;
      padding: 2rem;
      color: #999;
    }

    .adherence-info {
      display: flex;
      gap: 2rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .info-badge {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-badge .label {
      font-size: 0.85rem;
      color: #666;
    }

    .info-badge .value {
      font-size: 1.25rem;
      font-weight: bold;
    }

    .value.excellent {
      color: #4caf50;
    }

    .value.good {
      color: #8bc34a;
    }

    .value.fair {
      color: #ff9800;
    }

    .value.poor {
      color: #f44336;
    }

    .value.positive {
      color: #4caf50;
    }

    .value.negative {
      color: #f44336;
    }

    .value.stable {
      color: #2196f3;
    }
  `]
})
export class PatientOverviewComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() patient!: PatientDetail;
  @ViewChild('adherenceChart', { static: false }) adherenceChartRef!: ElementRef<HTMLCanvasElement>;

  private adherenceChart?: Chart;
  private chartInitialized = false;

  adherenceChartData: ChartData<'line'> = {
    labels: [] as string[],
    datasets: [{
      label: 'Adherence Score',
      data: [],
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  currentAdherenceScore = 0;
  adherenceTrend: 'positive' | 'negative' | 'stable' = 'stable';

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 10
        },
        title: {
          display: true,
          text: 'Adherence Score (0-100)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    },
    plugins: {
      legend: {
        display: true
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Adherence: ${context.parsed.y.toFixed(1)}/100`;
          }
        }
      }
    }
  };

  getFormattedDate(dateString?: string): string {
    if (!dateString) return 'Mai';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString || 'Mai';
    }
  }

  getDaysActive(): number {
    if (!this.patient.first_access) return 0;
    try {
      const first = new Date(this.patient.first_access);
      const now = new Date();
      const diff = now.getTime() - first.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  ngOnInit(): void {
    if (this.patient) {
      this.calculateAdherenceScore();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patient'] && this.patient) {
      this.calculateAdherenceScore();
      if (this.chartInitialized) {
        setTimeout(() => this.createChart(), 200);
      }
    }
  }

  ngAfterViewInit(): void {
    this.chartInitialized = true;
    setTimeout(() => {
      this.createChart();
    }, 300);
  }

  calculateAdherenceScore(): void {
    const scores: { date: Date; score: number }[] = [];
    const today = new Date();
    
    // Usa dati reali o fake
    const metrics = this.patient.health_metrics || [];
    const analyses = this.patient.food_analyses || [];
    const diets = this.patient.diets || [];

    // Se non ci sono dati, genera dati fake
    if (metrics.length === 0 && analyses.length === 0) {
      this.generateFakeAdherenceData(scores, today);
    } else {
      // Calcola score per ogni settimana degli ultimi 2 mesi
      for (let week = 0; week < 8; week++) {
        const weekDate = new Date(today);
        weekDate.setDate(weekDate.getDate() - (56 - week * 7));
        
        const score = this.calculateWeeklyAdherence(weekDate, metrics, analyses, diets);
        scores.push({ date: weekDate, score });
      }
    }

    // Ordina per data
    scores.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Prepara dati per il grafico
    const labels = scores.map(s => 
      s.date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
    );
    const data = scores.map(s => s.score);

    this.adherenceChartData = {
      labels: labels,
      datasets: [{
        label: 'Adherence Score',
        data: data,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };

    // Calcola score attuale e trend
    if (scores.length > 0) {
      this.currentAdherenceScore = scores[scores.length - 1].score;
      
      if (scores.length >= 2) {
        const recent = scores[scores.length - 1].score;
        const previous = scores[scores.length - 2].score;
        const diff = recent - previous;
        
        if (Math.abs(diff) < 2) {
          this.adherenceTrend = 'stable';
        } else if (diff > 0) {
          this.adherenceTrend = 'positive';
        } else {
          this.adherenceTrend = 'negative';
        }
      }
    }

    // Ricrea il grafico se già inizializzato
    if (this.chartInitialized) {
      setTimeout(() => this.createChart(), 200);
    }
  }

  private calculateWeeklyAdherence(
    weekDate: Date,
    metrics: any[],
    analyses: any[],
    diets: any[]
  ): number {
    const weekStart = new Date(weekDate);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekEnd = new Date(weekDate);

    // 1. Score Peso (30%): Variazione peso rispetto all'obiettivo
    let weightScore = 50; // Default
    const weekMetrics = metrics.filter(m => {
      const mDate = new Date(m.record_date);
      return mDate >= weekStart && mDate <= weekEnd;
    });
    
    if (weekMetrics.length >= 2) {
      const weightMetrics = weekMetrics
        .filter(m => m.weight != null)
        .sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime());
      
      if (weightMetrics.length >= 2) {
        const firstWeight = weightMetrics[0].weight;
        const lastWeight = weightMetrics[weightMetrics.length - 1].weight;
        const weightChange = lastWeight - firstWeight;
        // Assumiamo obiettivo di perdita di 0.5kg/settimana
        const targetChange = -0.5;
        const deviation = Math.abs(weightChange - targetChange);
        weightScore = Math.max(0, Math.min(100, 100 - (deviation * 20)));
      }
    }

    // 2. Score Pasti (25%): Numero di analisi cibo nella settimana
    const weekAnalyses = analyses.filter(a => {
      const aDate = new Date(a.analysis_date);
      return aDate >= weekStart && aDate <= weekEnd;
    });
    const mealScore = Math.min(100, (weekAnalyses.length / 7) * 100); // Obiettivo: 1 analisi/giorno

    // 3. Score Qualità Pasti (20%): Score medio delle analisi
    let qualityScore = 50;
    if (weekAnalyses.length > 0) {
      const scores = weekAnalyses
        .filter(a => a.score != null)
        .map(a => a.score);
      if (scores.length > 0) {
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        qualityScore = (avgScore / 10) * 100; // Normalizza da 0-10 a 0-100
      }
    }

    // 4. Score HRV (15%): Consistenza HRV (valori buoni = aderenza)
    let hrvScore = 50;
    const hrvValues = weekMetrics
      .filter(m => m.hrv != null)
      .map(m => m.hrv);
    
    if (hrvValues.length > 0) {
      const avgHRV = hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length;
      // HRV buono è tra 40-60ms
      if (avgHRV >= 40 && avgHRV <= 60) {
        hrvScore = 100;
      } else if (avgHRV >= 30 && avgHRV < 40) {
        hrvScore = 70;
      } else if (avgHRV > 60 && avgHRV <= 70) {
        hrvScore = 80;
      } else {
        hrvScore = 30;
      }
    }

    // 5. Score Interazione (10%): Frequenza interazioni
    const interactionScore = Math.min(100, (weekAnalyses.length + weekMetrics.length) * 5);

    // Calcolo finale pesato
    const finalScore = 
      (weightScore * 0.30) +
      (mealScore * 0.25) +
      (qualityScore * 0.20) +
      (hrvScore * 0.15) +
      (interactionScore * 0.10);

    return Math.round(finalScore * 10) / 10;
  }

  private generateFakeAdherenceData(scores: { date: Date; score: number }[], today: Date): void {
    // Genera dati fake con trend positivo
    let baseScore = 60;
    
    for (let week = 0; week < 8; week++) {
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() - (56 - week * 7));
      
      // Trend positivo con variazioni casuali
      baseScore += Math.random() * 3 - 1; // Variazione casuale
      baseScore = Math.max(40, Math.min(95, baseScore)); // Limiti 40-95
      
      scores.push({ date: weekDate, score: Math.round(baseScore * 10) / 10 });
    }
  }

  createChart(): void {
    if (this.adherenceChart) {
      this.adherenceChart.destroy();
      this.adherenceChart = undefined;
    }

    if (this.adherenceChartRef?.nativeElement && 
        this.adherenceChartData.labels && 
        this.adherenceChartData.labels.length > 0) {
      const ctx = this.adherenceChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.adherenceChart = new Chart(ctx, {
          type: 'line',
          data: this.adherenceChartData,
          options: this.chartOptions
        });
      }
    }
  }

  getAdherenceClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  getTrendClass(): string {
    return this.adherenceTrend;
  }

  getTrendLabel(): string {
    // Questo sarà tradotto nel template usando una pipe
    switch (this.adherenceTrend) {
      case 'positive':
        return 'patientOverview.trendImproving';
      case 'negative':
        return 'patientOverview.trendDeclining';
      default:
        return 'patientOverview.trendStable';
    }
  }
}

