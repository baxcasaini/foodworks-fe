import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NutritionService, DietSummary, NutritionStats, DietTemplate } from '../../services/nutrition.service';
import { PatientsService } from '../../services/patients.service';
import { PatientListItem } from '../../models/patient.model';
import { Chart, ChartData, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="nutrition-container">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-header subtitle="Gestione completa dei piani nutrizionali"></app-header>
        <div class="content-area">
          <div *ngIf="loading" class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Caricamento dati...</p>
          </div>

          <div *ngIf="!loading">
            <mat-tab-group>
              <!-- TAB 1: PANORAMICA -->
              <mat-tab label="Panoramica">
                <div class="tab-content">
                  <div class="stats-grid">
                    <mat-card class="stat-card">
                      <mat-card-content>
                        <div class="stat-icon">📋</div>
                        <div class="stat-value">{{ stats?.total_active_plans || 0 }}</div>
                        <div class="stat-label">Piani Attivi</div>
                      </mat-card-content>
                    </mat-card>

                    <mat-card class="stat-card">
                      <mat-card-content>
                        <div class="stat-icon">👥</div>
                        <div class="stat-value">{{ stats?.total_patients_with_plans || 0 }}</div>
                        <div class="stat-label">Pazienti con Piano</div>
                      </mat-card-content>
                    </mat-card>

                    <mat-card class="stat-card">
                      <mat-card-content>
                        <div class="stat-icon">⚠️</div>
                        <div class="stat-value">{{ stats?.plans_to_review || 0 }}</div>
                        <div class="stat-label">Piani da Revisionare</div>
                      </mat-card-content>
                    </mat-card>

                    <mat-card class="stat-card">
                      <mat-card-content>
                        <div class="stat-icon">📊</div>
                        <div class="stat-value">{{ (stats?.average_compliance || 0).toFixed(0) }}%</div>
                        <div class="stat-label">Compliance Media</div>
                      </mat-card-content>
                    </mat-card>
                  </div>

                  <div class="charts-section">
                    <mat-card class="full-width-chart">
                      <mat-card-header>
                        <mat-card-title>Distribuzione Piani per Tipologia</mat-card-title>
                        <mat-card-subtitle>Analisi dei tipi di piani alimentari assegnati</mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="chart-container-large">
                          <canvas #plansByTypeChart></canvas>
                        </div>
                        <div class="chart-legend" *ngIf="plansByTypeChartData.labels && plansByTypeChartData.labels.length > 0">
                          <div class="legend-item" *ngFor="let label of getChartLabels(); let i = index">
                            <div class="legend-color" [style.background-color]="getLegendColor(i)"></div>
                            <span>{{ label }}</span>
                            <strong>{{ getPlanCountByType(label) }}</strong>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>

                  <mat-card class="recent-plans-card">
                    <mat-card-header>
                      <mat-card-title>Piani Recenti</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div *ngIf="recentPlans.length === 0" class="no-data">
                        Nessun piano recente
                      </div>
                      <table mat-table [dataSource]="recentPlans" *ngIf="recentPlans.length > 0" class="plans-table">
                        <ng-container matColumnDef="patient">
                          <th mat-header-cell *matHeaderCellDef>Paziente</th>
                          <td mat-cell *matCellDef="let plan">{{ plan.patient_name }}</td>
                        </ng-container>

                        <ng-container matColumnDef="diet_name">
                          <th mat-header-cell *matHeaderCellDef>Nome Piano</th>
                          <td mat-cell *matCellDef="let plan">{{ plan.diet_name || 'N/A' }}</td>
                        </ng-container>

                        <ng-container matColumnDef="type">
                          <th mat-header-cell *matHeaderCellDef>Tipo</th>
                          <td mat-cell *matCellDef="let plan">
                            <mat-chip>{{ plan.diet_type || 'Standard' }}</mat-chip>
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="date">
                          <th mat-header-cell *matHeaderCellDef>Data Creazione</th>
                          <td mat-cell *matCellDef="let plan">{{ getFormattedDate(plan.creation_date) }}</td>
                        </ng-container>

                        <ng-container matColumnDef="status">
                          <th mat-header-cell *matHeaderCellDef>Stato</th>
                          <td mat-cell *matCellDef="let plan">
                            <mat-chip [ngClass]="plan.status === 'active' ? 'status-active' : 'status-inactive'">
                              {{ plan.status === 'active' ? 'Attivo' : 'Inattivo' }}
                            </mat-chip>
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="recentPlansColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: recentPlansColumns;"></tr>
                      </table>
                    </mat-card-content>
                  </mat-card>
                </div>
              </mat-tab>

              <!-- TAB 2: GESTIONE PIANI -->
              <mat-tab label="Gestione Piani">
                <div class="tab-content">
                  <div class="filters-section">
                    <mat-form-field>
                      <mat-label>Filtro Stato</mat-label>
                      <mat-select [(ngModel)]="selectedStatus" (selectionChange)="loadPlans()">
                        <mat-option [value]="undefined">Tutti</mat-option>
                        <mat-option value="active">Attivi</mat-option>
                        <mat-option value="inactive">Inattivi</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Filtro Paziente</mat-label>
                      <mat-select [(ngModel)]="selectedPatient" (selectionChange)="loadPlans()">
                        <mat-option [value]="undefined">Tutti i pazienti</mat-option>
                        <mat-option *ngFor="let patient of patients" [value]="patient.chat_id">
                          {{ patient.name }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <button mat-button (click)="clearFilters()">Reset Filtri</button>
                  </div>

                  <mat-card>
                    <mat-card-header>
                      <mat-card-title>Tutti i Piani Alimentari</mat-card-title>
                      <mat-card-subtitle>{{ allPlans.length }} piani trovati</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <div *ngIf="allPlans.length === 0" class="no-data">
                        <mat-icon>restaurant_menu</mat-icon>
                        <p>Nessun piano trovato con i filtri selezionati</p>
                      </div>
                      <table mat-table [dataSource]="allPlans" *ngIf="allPlans.length > 0" class="plans-table">
                        <ng-container matColumnDef="patient">
                          <th mat-header-cell *matHeaderCellDef>Paziente</th>
                          <td mat-cell *matCellDef="let plan">
                            <a (click)="viewPatient(plan.chat_id)" class="patient-link">{{ plan.patient_name }}</a>
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="diet_name">
                          <th mat-header-cell *matHeaderCellDef>Nome Piano</th>
                          <td mat-cell *matCellDef="let plan">{{ plan.diet_name || 'N/A' }}</td>
                        </ng-container>

                        <ng-container matColumnDef="type">
                          <th mat-header-cell *matHeaderCellDef>Tipo</th>
                          <td mat-cell *matCellDef="let plan">
                            <mat-chip>{{ plan.diet_type || 'Standard' }}</mat-chip>
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="days">
                          <th mat-header-cell *matHeaderCellDef>Durata</th>
                          <td mat-cell *matCellDef="let plan">{{ plan.days || '-' }} giorni</td>
                        </ng-container>

                        <ng-container matColumnDef="date">
                          <th mat-header-cell *matHeaderCellDef>Data Creazione</th>
                          <td mat-cell *matCellDef="let plan">{{ getFormattedDate(plan.creation_date) }}</td>
                        </ng-container>

                        <ng-container matColumnDef="status">
                          <th mat-header-cell *matHeaderCellDef>Stato</th>
                          <td mat-cell *matCellDef="let plan">
                            <mat-chip [ngClass]="plan.status === 'active' ? 'status-active' : 'status-inactive'">
                              {{ plan.status === 'active' ? 'Attivo' : 'Inattivo' }}
                            </mat-chip>
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="actions">
                          <th mat-header-cell *matHeaderCellDef>Azioni</th>
                          <td mat-cell *matCellDef="let plan">
                            <button mat-icon-button (click)="viewPlan(plan)" matTooltip="Visualizza piano">
                              <mat-icon>visibility</mat-icon>
                            </button>
                            <button mat-icon-button (click)="editPlan(plan)" matTooltip="Modifica piano">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button (click)="duplicatePlan(plan)" matTooltip="Duplica piano">
                              <mat-icon>content_copy</mat-icon>
                            </button>
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="allPlansColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: allPlansColumns;"></tr>
                      </table>
                    </mat-card-content>
                  </mat-card>
                </div>
              </mat-tab>

              <!-- TAB 3: TEMPLATE -->
              <mat-tab label="Template">
                <div class="tab-content">
                  <mat-card>
                    <mat-card-header>
                      <mat-card-title>Template Piani Alimentari</mat-card-title>
                      <mat-card-subtitle>Template riutilizzabili per creare nuovi piani</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <div *ngIf="templates.length === 0" class="no-data">
                        <mat-icon>folder</mat-icon>
                        <p>Nessun template disponibile</p>
                      </div>
                      <div class="templates-grid" *ngIf="templates.length > 0">
                        <mat-card *ngFor="let template of templates" class="template-card">
                          <mat-card-header>
                            <mat-card-title>{{ template.name }}</mat-card-title>
                            <mat-card-subtitle>{{ template.description }}</mat-card-subtitle>
                          </mat-card-header>
                          <mat-card-content>
                            <div class="template-info">
                              <div class="info-row">
                                <mat-icon>local_fire_department</mat-icon>
                                <span><strong>Calorie:</strong> {{ template.calories }} kcal/giorno</span>
                              </div>
                              <div class="info-row">
                                <mat-icon>pie_chart</mat-icon>
                                <span><strong>Macro:</strong> 
                                  C {{ template.macros.carbs }}% | 
                                  P {{ template.macros.proteins }}% | 
                                  G {{ template.macros.fats }}%
                                </span>
                              </div>
                              <div class="info-row">
                                <mat-icon>calendar_today</mat-icon>
                                <span><strong>Durata:</strong> {{ template.days }} giorni</span>
                              </div>
                              <div class="info-row">
                                <mat-icon>category</mat-icon>
                                <span><strong>Tipo:</strong> {{ getDietTypeLabel(template.diet_type) }}</span>
                              </div>
                            </div>
                            <div class="template-actions">
                              <button mat-raised-button color="primary" (click)="useTemplate(template)">
                                <mat-icon>add</mat-icon>
                                Usa Template
                              </button>
                              <button mat-button (click)="viewTemplate(template)">
                                <mat-icon>visibility</mat-icon>
                                Anteprima
                              </button>
                            </div>
                          </mat-card-content>
                        </mat-card>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nutrition-container {
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

    .tab-content {
      padding: 1rem 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      text-align: center;
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
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

    .charts-section {
      margin-bottom: 2rem;
    }

    .full-width-chart {
      width: 100%;
    }

    .chart-container-large {
      position: relative;
      height: 400px;
      margin-bottom: 1.5rem;
    }

    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      justify-content: center;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }

    .chart-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
    }

    .recent-plans-card {
      margin-top: 1.5rem;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .filters-section mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .plans-table {
      width: 100%;
    }

    .patient-link {
      color: #1976d2;
      cursor: pointer;
      text-decoration: underline;
    }

    .patient-link:hover {
      color: #1565c0;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #999;
      gap: 1rem;
    }

    .no-data mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .template-card {
      height: 100%;
    }

    .template-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .info-row mat-icon {
      color: #666;
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .template-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    mat-chip {
      margin: 0 0.25rem;
    }

    .status-active {
      background-color: #4caf50;
      color: white;
    }

    .status-inactive {
      background-color: #999;
      color: white;
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      padding: 1rem 0;
    }
  `]
})
export class NutritionComponent implements OnInit, AfterViewInit {
  loading = false;
  stats?: NutritionStats;
  allPlans: DietSummary[] = [];
  recentPlans: DietSummary[] = [];
  templates: DietTemplate[] = [];
  patients: PatientListItem[] = [];

  selectedStatus?: string;
  selectedPatient?: string;

  recentPlansColumns: string[] = ['patient', 'diet_name', 'type', 'date', 'status'];
  allPlansColumns: string[] = ['patient', 'diet_name', 'type', 'days', 'date', 'status', 'actions'];

  @ViewChild('plansByTypeChart', { static: false }) plansByTypeChartRef!: ElementRef<HTMLCanvasElement>;

  private plansByTypeChart?: Chart;

  plansByTypeChartData: ChartData<'doughnut'> = {
    labels: [] as string[],
    datasets: [{
      data: [],
      backgroundColor: [
        '#1976d2',
        '#4caf50',
        '#ff9800',
        '#9c27b0',
        '#f44336'
      ]
    }]
  };

  constructor(
    private nutritionService: NutritionService,
    private patientsService: PatientsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadPatients();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createCharts();
    }, 500);
  }

  loadData(): void {
    this.loading = true;

    // Carica statistiche
    this.nutritionService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.updateChartsData();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.loading = false;
      }
    });

    // Carica piani
    this.loadPlans();

    // Carica template
    this.nutritionService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
      },
      error: (err) => {
        console.error('Error loading templates:', err);
      }
    });
  }

  loadPatients(): void {
    this.patientsService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: (err) => {
        console.error('Error loading patients:', err);
      }
    });
  }

  loadPlans(): void {
    this.nutritionService.getAllPlans(this.selectedStatus, this.selectedPatient).subscribe({
      next: (plans) => {
        this.allPlans = plans;
        // Piani recenti (ultimi 5)
        this.recentPlans = plans.slice(0, 5);
        this.updateChartsData();
      },
      error: (err) => {
        console.error('Error loading plans:', err);
      }
    });
  }

  clearFilters(): void {
    this.selectedStatus = undefined;
    this.selectedPatient = undefined;
    this.loadPlans();
  }

  updateChartsData(): void {
    // Grafico piani per tipo
    const typeCounts: { [key: string]: number } = {};
    this.allPlans.forEach(plan => {
      const type = plan.diet_type || 'standard';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Se non ci sono piani, usa dati fake per demo
    if (Object.keys(typeCounts).length === 0) {
      typeCounts['mediterranean'] = 5;
      typeCounts['low_carb'] = 3;
      typeCounts['high_protein'] = 4;
      typeCounts['vegetarian'] = 2;
      typeCounts['weight_loss'] = 6;
    }

    const types = Object.keys(typeCounts);
    const counts = types.map(t => typeCounts[t]);
    const colors = this.getColorsForTypes(types.length);

    this.plansByTypeChartData = {
      labels: types.map(t => this.getDietTypeLabel(t)),
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    setTimeout(() => this.createCharts(), 100);
  }

  createCharts(): void {
    // Grafico piani per tipo
    if (this.plansByTypeChart) {
      this.plansByTypeChart.destroy();
      this.plansByTypeChart = undefined;
    }
    if (this.plansByTypeChartRef?.nativeElement && 
        this.plansByTypeChartData.labels && 
        this.plansByTypeChartData.labels.length > 0) {
      const ctx = this.plansByTypeChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.plansByTypeChart = new Chart(ctx, {
          type: 'doughnut',
          data: this.plansByTypeChartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} piani (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }
    }
  }

  getColorsForTypes(count: number): string[] {
    const colors = [
      '#1976d2', // Blu
      '#4caf50', // Verde
      '#ff9800', // Arancione
      '#9c27b0', // Viola
      '#f44336', // Rosso
      '#00bcd4', // Ciano
      '#ffeb3b', // Giallo
      '#795548'  // Marrone
    ];
    return colors.slice(0, count);
  }

  getLegendColor(index: number): string {
    const colors = this.getColorsForTypes(10);
    return colors[index % colors.length];
  }

  getChartLabels(): string[] {
    if (!this.plansByTypeChartData.labels) {
      return [];
    }
    return this.plansByTypeChartData.labels.map(label => String(label));
  }

  getPlanCountByType(typeLabel: string): string {
    const typeKey = Object.keys(this.getDietTypeMap()).find(
      key => this.getDietTypeMap()[key] === typeLabel
    ) || 'standard';
    
    const count = this.allPlans.filter(p => (p.diet_type || 'standard') === typeKey).length;
    return `${count} ${count === 1 ? 'piano' : 'piani'}`;
  }

  getDietTypeMap(): { [key: string]: string } {
    return {
      'mediterranean': 'Mediterraneo',
      'low_carb': 'Low-Carb',
      'high_protein': 'Alto Proteico',
      'vegetarian': 'Vegetariano',
      'weight_loss': 'Dimagrante',
      'standard': 'Standard'
    };
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

  getDietTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'mediterranean': 'Mediterraneo',
      'low_carb': 'Low-Carb',
      'high_protein': 'Alto Proteico',
      'vegetarian': 'Vegetariano',
      'weight_loss': 'Dimagrante',
      'standard': 'Standard'
    };
    return labels[type] || type;
  }

  viewPatient(chatId: string): void {
    this.router.navigate(['/patients', chatId]);
  }

  viewPlan(plan: DietSummary): void {
    console.log('View plan:', plan);
    // TODO: Implementare visualizzazione dettagli piano
  }

  editPlan(plan: DietSummary): void {
    console.log('Edit plan:', plan);
    // TODO: Implementare modifica piano
  }

  duplicatePlan(plan: DietSummary): void {
    console.log('Duplicate plan:', plan);
    // TODO: Implementare duplicazione piano
  }

  useTemplate(template: DietTemplate): void {
    console.log('Use template:', template);
    // TODO: Implementare creazione piano da template
  }

  viewTemplate(template: DietTemplate): void {
    console.log('View template:', template);
    // TODO: Implementare anteprima template
  }
}

