import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { AnalyticsService } from '../../services/analytics.service';
import { AnalyticsData } from '../../models/analytics.model';
import Chart, { ChartData, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    SidebarComponent,
    HeaderComponent,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  template: `
    <div class="analytics-container">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-header [subtitle]="'analytics.subtitle' | translate"></app-header>
        <div class="content-area">
          <div *ngIf="loading" class="loading-container">
            <mat-spinner></mat-spinner>
            <p>{{ 'analytics.loading' | translate }}</p>
          </div>

          <div *ngIf="!loading && analyticsData" class="analytics-content">
            <!-- Overview Cards -->
            <div class="overview-cards">
              <mat-card class="overview-card">
                <mat-card-content>
                  <div class="card-icon">👥</div>
                  <div class="card-value">{{ analyticsData.overview.total_patients }}</div>
                  <div class="card-label">{{ 'analytics.totalPatients' | translate }}</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="overview-card">
                <mat-card-content>
                  <div class="card-icon">✅</div>
                  <div class="card-value">{{ analyticsData.overview.active_patients }}</div>
                  <div class="card-label">{{ 'analytics.activePatients' | translate }}</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="overview-card">
                <mat-card-content>
                  <div class="card-icon">🆕</div>
                  <div class="card-value">{{ analyticsData.overview.new_patients_last_month }}</div>
                  <div class="card-label">{{ 'analytics.newLastMonth' | translate }}</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="overview-card">
                <mat-card-content>
                  <div class="card-icon">📊</div>
                  <div class="card-value">{{ analyticsData.overview.average_churn_score }}</div>
                  <div class="card-label">{{ 'analytics.averageChurnScore' | translate }}</div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Tabs per diverse analisi -->
            <mat-tab-group animationDuration="0ms">
              <!-- Tab Compliance -->
              <mat-tab [label]="'analytics.compliance' | translate">
                <div class="tab-content">
                  <div class="stats-grid">
                    <mat-card>
                      <mat-card-header>
                        <mat-card-title>{{ 'analytics.averageCompliance' | translate }}</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="big-number">{{ analyticsData.compliance.average_compliance.toFixed(1) }}%</div>
                        <div class="stat-details">
                          <div class="stat-item">
                            <span class="stat-label">{{ 'analytics.aboveThreshold' | translate }}</span>
                            <span class="stat-value positive">{{ analyticsData.compliance.patients_above_threshold }}</span>
                          </div>
                          <div class="stat-item">
                            <span class="stat-label">{{ 'analytics.belowThreshold' | translate }}</span>
                            <span class="stat-value negative">{{ analyticsData.compliance.patients_below_threshold }}</span>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>

                    <mat-card>
                      <mat-card-header>
                        <mat-card-title>{{ 'analytics.complianceTrend' | translate }}</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="chart-wrapper">
                          <canvas #complianceChart></canvas>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>
              </mat-tab>

              <!-- Tab Perdita Peso -->
              <mat-tab [label]="'analytics.weightLoss' | translate">
                <div class="tab-content">
                  <div class="stats-grid">
                    <mat-card>
                      <mat-card-header>
                        <mat-card-title>{{ 'analytics.weightLossStats' | translate }}</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="big-number">{{ analyticsData.weight_loss.total_weight_loss.toFixed(1) }} kg</div>
                        <div class="stat-details">
                          <div class="stat-item">
                            <span class="stat-label">{{ 'analytics.averagePerPatient' | translate }}</span>
                            <span class="stat-value">{{ analyticsData.weight_loss.average_weight_loss_per_patient.toFixed(1) }} kg</span>
                          </div>
                          <div class="stat-item">
                            <span class="stat-label">{{ 'analytics.withProgress' | translate }}</span>
                            <span class="stat-value positive">{{ analyticsData.weight_loss.patients_with_progress }}</span>
                          </div>
                          <div class="stat-item">
                            <span class="stat-label">{{ 'analytics.withoutProgress' | translate }}</span>
                            <span class="stat-value negative">{{ analyticsData.weight_loss.patients_without_progress }}</span>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>

                    <mat-card>
                      <mat-card-header>
                        <mat-card-title>{{ 'analytics.weightLossTrend' | translate }}</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="chart-wrapper">
                          <canvas #weightLossChart></canvas>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>
              </mat-tab>

              <!-- Tab Efficacia Piani -->
              <mat-tab [label]="'analytics.planEffectiveness' | translate">
                <div class="tab-content">
                  <div class="stats-grid">
                    <mat-card>
                      <mat-card-header>
                        <mat-card-title>{{ 'analytics.mostEffectivePlan' | translate }}</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="big-number highlight">{{ analyticsData.plan_effectiveness.most_effective_plan_type }}</div>
                        <p class="subtitle">{{ 'analytics.highestSuccessRate' | translate }}</p>
                      </mat-card-content>
                    </mat-card>

                    <mat-card>
                      <mat-card-header>
                        <mat-card-title>{{ 'analytics.successRateByType' | translate }}</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="chart-wrapper">
                          <canvas #successRateChart></canvas>
                        </div>
                      </mat-card-content>
                    </mat-card>

                    <mat-card>
                      <mat-card-header>
                        <mat-card-title>{{ 'analytics.averageDurationByType' | translate }}</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="chart-wrapper">
                          <canvas #durationChart></canvas>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>
              </mat-tab>

              <!-- Tab Distribuzione Rischio -->
              <mat-tab [label]="'analytics.riskDistribution' | translate">
                <div class="tab-content">
                  <div class="stats-grid">
                    <mat-card>
                      <mat-card-header>
                        <mat-card-title>{{ 'analytics.riskDistributionByLevel' | translate }}</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="chart-wrapper">
                          <canvas #riskDistributionChart></canvas>
                        </div>
                        <div class="risk-legend">
                          <div class="risk-item">
                            <span class="risk-color high"></span>
                            <span>{{ 'analytics.high' | translate }}: {{ analyticsData.overview.patients_by_risk_level['high'] || 0 }}</span>
                          </div>
                          <div class="risk-item">
                            <span class="risk-color medium"></span>
                            <span>{{ 'analytics.medium' | translate }}: {{ analyticsData.overview.patients_by_risk_level['medium'] || 0 }}</span>
                          </div>
                          <div class="risk-item">
                            <span class="risk-color low"></span>
                            <span>{{ 'analytics.low' | translate }}: {{ analyticsData.overview.patients_by_risk_level['low'] || 0 }}</span>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>

          <div *ngIf="!loading && !analyticsData" class="error-container">
            <p>{{ 'analytics.errorLoading' | translate }}</p>
            <button mat-button (click)="loadAnalytics()">Riprova</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      display: flex;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      margin-left: 250px;
      display: flex;
      flex-direction: column;
    }

    .content-area {
      padding: 2rem;
      flex: 1;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
    }

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .overview-card {
      text-align: center;
    }

    .card-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }

    .card-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 0.5rem;
    }

    .card-label {
      color: #666;
      font-size: 0.9rem;
    }

    .tab-content {
      padding: 1.5rem 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    .big-number {
      font-size: 3rem;
      font-weight: bold;
      color: #1976d2;
      text-align: center;
      margin: 1rem 0;
    }

    .big-number.highlight {
      color: #4caf50;
    }

    .subtitle {
      text-align: center;
      color: #666;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .stat-details {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e0e0e0;
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
      font-weight: bold;
    }

    .stat-value.positive {
      color: #4caf50;
    }

    .stat-value.negative {
      color: #f44336;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
      margin-top: 1rem;
    }

    .risk-legend {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e0e0e0;
    }

    .risk-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .risk-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }

    .risk-color.high {
      background-color: #f44336;
    }

    .risk-color.medium {
      background-color: #ff9800;
    }

    .risk-color.low {
      background-color: #4caf50;
    }

    .error-container {
      text-align: center;
      padding: 3rem;
      color: #d32f2f;
    }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('complianceChart', { static: false }) complianceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('weightLossChart', { static: false }) weightLossChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('successRateChart', { static: false }) successRateChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('durationChart', { static: false }) durationChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('riskDistributionChart', { static: false }) riskDistributionChartRef!: ElementRef<HTMLCanvasElement>;

  analyticsData?: AnalyticsData;
  loading = false;

  private complianceChart?: Chart;
  private weightLossChart?: Chart;
  private successRateChart?: Chart;
  private durationChart?: Chart;
  private riskDistributionChart?: Chart;

  constructor(
    private analyticsService: AnalyticsService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngAfterViewInit(): void {
    // I grafici verranno creati dopo il caricamento dei dati
  }

  loadAnalytics(): void {
    this.loading = true;
    this.analyticsService.getAnalyticsOverview().subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.loading = false;
        setTimeout(() => {
          this.createCharts();
        }, 300);
      },
      error: (err) => {
        console.error('Error loading analytics:', err);
        this.loading = false;
      }
    });
  }

  createCharts(): void {
    if (!this.analyticsData) return;

    // Compliance Trend Chart
    if (this.complianceChartRef?.nativeElement) {
      const complianceData = this.analyticsData.compliance.compliance_trend;
      this.createComplianceChart(complianceData);
    }

    // Weight Loss Trend Chart
    if (this.weightLossChartRef?.nativeElement) {
      const weightLossData = this.analyticsData.weight_loss.weight_loss_trend;
      this.createWeightLossChart(weightLossData);
    }

    // Success Rate Chart
    if (this.successRateChartRef?.nativeElement) {
      this.createSuccessRateChart();
    }

    // Duration Chart
    if (this.durationChartRef?.nativeElement) {
      this.createDurationChart();
    }

    // Risk Distribution Chart
    if (this.riskDistributionChartRef?.nativeElement) {
      this.createRiskDistributionChart();
    }
  }

  createComplianceChart(data: Array<{ date: string; compliance: number }>): void {
    if (this.complianceChart) {
      this.complianceChart.destroy();
    }

    const ctx = this.complianceChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.complianceChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(d => new Date(d.date).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })),
          datasets: [{
            label: 'Compliance %',
            data: data.map(d => d.compliance),
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              min: 50,
              max: 100,
              title: {
                display: true,
                text: 'Compliance (%)'
              }
            }
          }
        }
      });
    }
  }

  createWeightLossChart(data: Array<{ date: string; average_weight_loss: number }>): void {
    if (this.weightLossChart) {
      this.weightLossChart.destroy();
    }

    const ctx = this.weightLossChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.weightLossChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => new Date(d.date).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })),
          datasets: [{
            label: 'Perdita Peso Media (kg)',
            data: data.map(d => d.average_weight_loss),
            backgroundColor: '#4caf50'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Kg persi'
              }
            }
          }
        }
      });
    }
  }

  createSuccessRateChart(): void {
    if (this.successRateChart) {
      this.successRateChart.destroy();
    }

    const ctx = this.successRateChartRef.nativeElement.getContext('2d');
    if (ctx && this.analyticsData) {
      const planTypes = Object.keys(this.analyticsData.plan_effectiveness.plan_success_rate);
      const successRates = Object.values(this.analyticsData.plan_effectiveness.plan_success_rate);

      this.successRateChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: planTypes,
          datasets: [{
            label: 'Tasso di Successo (%)',
            data: successRates,
            backgroundColor: ['#1976d2', '#4caf50', '#ff9800', '#9c27b0', '#f44336']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Successo (%)'
              }
            }
          }
        }
      });
    }
  }

  createDurationChart(): void {
    if (this.durationChart) {
      this.durationChart.destroy();
    }

    const ctx = this.durationChartRef.nativeElement.getContext('2d');
    if (ctx && this.analyticsData) {
      const planTypes = Object.keys(this.analyticsData.plan_effectiveness.average_duration);
      const durations = Object.values(this.analyticsData.plan_effectiveness.average_duration);

      this.durationChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: planTypes,
          datasets: [{
            label: 'Durata Media (giorni)',
            data: durations,
            backgroundColor: '#ff9800'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Giorni'
              }
            }
          }
        }
      });
    }
  }

  createRiskDistributionChart(): void {
    if (this.riskDistributionChart) {
      this.riskDistributionChart.destroy();
    }

    const ctx = this.riskDistributionChartRef.nativeElement.getContext('2d');
    if (ctx && this.analyticsData) {
      const riskLevels = Object.keys(this.analyticsData.overview.patients_by_risk_level);
      const counts = Object.values(this.analyticsData.overview.patients_by_risk_level);

      this.riskDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: riskLevels.map(r => {
            const key = r === 'high' ? 'analytics.high' : r === 'medium' ? 'analytics.medium' : 'analytics.low';
            return this.translate.instant(key);
          }),
          datasets: [{
            data: counts,
            backgroundColor: ['#f44336', '#ff9800', '#4caf50']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }
}
