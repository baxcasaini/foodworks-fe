import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientDetail, HealthMetric } from '../../models/patient.model';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-patient-metrics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="metrics-container">
      <div class="charts-section">
        <mat-card *ngIf="weightChartData.labels && weightChartData.labels.length > 0">
          <mat-card-header>
            <mat-card-title>Andamento Peso</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas #weightChart></canvas>
          </mat-card-content>
        </mat-card>

        <mat-card *ngIf="hrvChartData.labels && hrvChartData.labels.length > 0">
          <mat-card-header>
            <mat-card-title>HRV (Heart Rate Variability)</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas #hrvChart></canvas>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="stats-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Statistiche</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-item" *ngIf="averageWeight > 0">
              <span class="stat-label">Peso Medio:</span>
              <span class="stat-value">{{ averageWeight.toFixed(1) }} kg</span>
            </div>
            <div class="stat-item" *ngIf="weightChange !== null">
              <span class="stat-label">Variazione Peso:</span>
              <span class="stat-value" [ngClass]="weightChange >= 0 ? 'positive' : 'negative'">
                {{ weightChange >= 0 ? '+' : '' }}{{ weightChange.toFixed(1) }} kg
              </span>
            </div>
            <div class="stat-item" *ngIf="averageHRV > 0">
              <span class="stat-label">HRV Medio:</span>
              <span class="stat-value">{{ averageHRV.toFixed(1) }} ms</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Totale Registrazioni:</span>
              <span class="stat-value">{{ (patient.health_metrics && patient.health_metrics.length) || 0 }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="table-card">
        <mat-card-header>
          <mat-card-title>Storico Completo</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="filteredMetrics.length === 0" class="no-data">
            Nessuna metrica disponibile
          </div>
          <table mat-table [dataSource]="filteredMetrics" *ngIf="filteredMetrics.length > 0" class="metrics-table">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Data</th>
              <td mat-cell *matCellDef="let metric">{{ getFormattedDate(metric.record_date) }}</td>
            </ng-container>

            <ng-container matColumnDef="weight">
              <th mat-header-cell *matHeaderCellDef>Peso (kg)</th>
              <td mat-cell *matCellDef="let metric">{{ metric.weight || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="hrv">
              <th mat-header-cell *matHeaderCellDef>HRV (ms)</th>
              <td mat-cell *matCellDef="let metric">{{ metric.hrv || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="body_fat">
              <th mat-header-cell *matHeaderCellDef>Grasso Corporeo (%)</th>
              <td mat-cell *matCellDef="let metric">{{ metric.body_fat || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="muscle_mass">
              <th mat-header-cell *matHeaderCellDef>Massa Muscolare (kg)</th>
              <td mat-cell *matCellDef="let metric">{{ metric.muscle_mass || '-' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .metrics-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .charts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .charts-section {
        grid-template-columns: 1fr;
      }
    }

    .stats-section {
      display: flex;
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .stat-label {
      color: #666;
    }

    .stat-value {
      font-weight: 500;
      color: #1976d2;
    }

    .stat-value.positive {
      color: #4caf50;
    }

    .stat-value.negative {
      color: #f44336;
    }

    .table-card {
      margin-top: 1rem;
    }

    .metrics-table {
      width: 100%;
    }

    .no-data {
      text-align: center;
      padding: 2rem;
      color: #999;
    }
  `]
})
export class PatientMetricsComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() patient!: PatientDetail;
  @ViewChild('weightChart', { static: false }) weightChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hrvChart', { static: false }) hrvChartRef!: ElementRef<HTMLCanvasElement>;

  displayedColumns: string[] = ['date', 'weight', 'hrv', 'body_fat', 'muscle_mass'];
  filteredMetrics: HealthMetric[] = [];
  
  private weightChart?: Chart;
  private hrvChart?: Chart;
  private chartsInitialized = false;

  weightChartData: ChartData<'line'> = {
    labels: [] as string[],
    datasets: [{
      label: 'Peso (kg)',
      data: [],
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      tension: 0.4
    }]
  };

  hrvChartData: ChartData<'line'> = {
    labels: [] as string[],
    datasets: [{
      label: 'HRV (ms)',
      data: [],
      borderColor: '#4caf50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      tension: 0.4
    }]
  };

  weightChartType: ChartType = 'line';
  hrvChartType: ChartType = 'line';

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  averageWeight = 0;
  weightChange: number | null = null;
  averageHRV = 0;

  ngOnInit(): void {
    if (this.patient) {
      this.processMetrics();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patient'] && this.patient) {
      this.processMetrics();
      // Se i grafici sono già stati inizializzati, ricreali con i nuovi dati
      if (this.chartsInitialized) {
        setTimeout(() => this.createCharts(), 200);
      }
    }
  }

  ngAfterViewInit(): void {
    // I grafici verranno creati dopo che i dati sono processati
    this.chartsInitialized = true;
    setTimeout(() => {
      this.createCharts();
    }, 300);
  }

  processMetrics(): void {
    // Se non ci sono dati reali, usa dati fake per demo
    let metrics = this.patient.health_metrics;
    if (!metrics || metrics.length === 0) {
      metrics = this.generateFakeMetrics();
    }

    if (!metrics || metrics.length === 0) {
      this.filteredMetrics = [];
      return;
    }

    // Ordina per data
    const sorted = [...metrics].sort((a, b) => 
      new Date(a.record_date).getTime() - new Date(b.record_date).getTime()
    );

    this.filteredMetrics = sorted;

    // Prepara dati per grafico peso
    const weightData = sorted.filter(m => m.weight != null).map(m => m.weight!);
    const weightLabels = sorted.filter(m => m.weight != null).map(m => 
      new Date(m.record_date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
    );

    if (weightData.length > 0) {
      this.weightChartData = {
        labels: weightLabels,
        datasets: [{
          label: 'Peso (kg)',
          data: weightData,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };

      this.averageWeight = weightData.reduce((a, b) => a + b, 0) / weightData.length;
      this.weightChange = weightData.length > 1 ? weightData[weightData.length - 1] - weightData[0] : null;
    }

    // Prepara dati per grafico HRV
    const hrvData = sorted.filter(m => m.hrv != null).map(m => m.hrv!);
    const hrvLabels = sorted.filter(m => m.hrv != null).map(m => 
      new Date(m.record_date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
    );

    if (hrvData.length > 0) {
      this.hrvChartData = {
        labels: hrvLabels,
        datasets: [{
          label: 'HRV (ms)',
          data: hrvData,
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };

      this.averageHRV = hrvData.reduce((a, b) => a + b, 0) / hrvData.length;
    }

    // Ricrea i grafici se già inizializzati
    if (this.weightChart || this.hrvChart) {
      setTimeout(() => this.createCharts(), 100);
    }
  }

  createCharts(): void {
    // Distruggi grafici esistenti
    if (this.weightChart) {
      this.weightChart.destroy();
      this.weightChart = undefined;
    }
    if (this.hrvChart) {
      this.hrvChart.destroy();
      this.hrvChart = undefined;
    }

    // Crea grafico peso
    if (this.weightChartRef?.nativeElement && this.weightChartData.labels && this.weightChartData.labels.length > 0) {
      const ctx = this.weightChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.weightChart = new Chart(ctx, {
          type: 'line',
          data: this.weightChartData,
          options: this.chartOptions
        });
      }
    }

    // Crea grafico HRV
    if (this.hrvChartRef?.nativeElement && this.hrvChartData.labels && this.hrvChartData.labels.length > 0) {
      const ctx = this.hrvChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.hrvChart = new Chart(ctx, {
          type: 'line',
          data: this.hrvChartData,
          options: this.chartOptions
        });
      }
    }
  }

  getFormattedDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  private generateFakeMetrics(): HealthMetric[] {
    const fakeMetrics: HealthMetric[] = [];
    const today = new Date();
    
    // Genera 10 metriche degli ultimi 30 giorni
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (30 - i * 3));
      
      // Peso variabile tra 70-75 kg con trend decrescente
      const baseWeight = 75;
      const weight = baseWeight - (i * 0.3) + (Math.random() * 0.8 - 0.4);
      
      // HRV variabile tra 40-60 ms
      const hrv = 45 + (Math.random() * 15);
      
      // Grasso corporeo variabile tra 18-22%
      const bodyFat = 20 + (Math.random() * 4 - 2);
      
      // Massa muscolare variabile tra 55-60 kg
      const muscleMass = 57 + (Math.random() * 5 - 2.5);
      
      fakeMetrics.push({
        chat_id: this.patient.chat_id,
        record_date: date.toISOString(),
        weight: Math.round(weight * 10) / 10,
        hrv: Math.round(hrv * 10) / 10,
        body_fat: Math.round(bodyFat * 10) / 10,
        muscle_mass: Math.round(muscleMass * 10) / 10
      });
    }
    
    return fakeMetrics;
  }
}

