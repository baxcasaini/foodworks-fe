import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';
import { SummaryCardsComponent } from '../components/summary-cards/summary-cards.component';
import { PatientGridComponent } from '../components/patient-grid/patient-grid.component';
import { DashboardService } from '../services/dashboard.service';
import { ActionsService } from '../services/actions.service';
import { DashboardMetrics } from '../models/dashboard.model';
import { PatientSummary } from '../models/patient.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    SummaryCardsComponent,
    PatientGridComponent,
    MatSnackBarModule
  ],
  template: `
    <div class="dashboard-container">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-header subtitle="Ecco il Triage Metabolico di oggi. Hai {{ metrics?.urgent_criticalities || 0 }} pazienti che richiedono attenzione."></app-header>
        <div class="content-area">
          <div *ngIf="loading" class="loading-container">
            <p>Caricamento dati...</p>
          </div>
          <div *ngIf="!loading">
            <app-summary-cards [metrics]="metrics"></app-summary-cards>
            <app-patient-grid
              [patients]="patients"
              (quickCheckin)="handleQuickCheckin($event)"
              (modifyPlan)="handleModifyPlan($event)"
              (highFive)="handleHighFive($event)">
            </app-patient-grid>
            <div *ngIf="patients.length === 0 && !loading" class="no-patients">
              <p>Nessun paziente trovato nel database.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
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
      text-align: center;
      padding: 2rem;
      color: #757575;
    }

    .no-patients {
      text-align: center;
      padding: 3rem;
      color: #757575;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  metrics?: DashboardMetrics;
  patients: PatientSummary[] = [];
  loading = false;

  constructor(
    private dashboardService: DashboardService,
    private actionsService: ActionsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Carica metriche
    this.dashboardService.getMetrics().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        console.log('Metrics loaded:', metrics);
      },
      error: (err) => {
        console.error('Error loading metrics:', err);
        this.showError(`Errore nel caricamento delle metriche: ${err.message || 'Errore sconosciuto'}`);
        this.loading = false;
      }
    });

    // Carica pazienti
    this.dashboardService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.loading = false;
        console.log('Patients loaded:', patients.length);
      },
      error: (err) => {
        console.error('Error loading patients:', err);
        this.loading = false;
        this.showError(`Errore nel caricamento dei pazienti: ${err.message || 'Errore sconosciuto'}`);
        this.patients = [];
      }
    });
  }

  handleQuickCheckin(chatId: string): void {
    this.actionsService.quickCheckin(chatId).subscribe({
      next: () => {
        this.showSuccess('Check-in rapido inviato con successo');
      },
      error: (err) => {
        console.error('Error sending check-in:', err);
        this.showError('Errore nell\'invio del check-in');
      }
    });
  }

  handleModifyPlan(chatId: string): void {
    // TODO: Implementare navigazione a pagina modifica piano
    this.showInfo('Funzionalità in sviluppo');
  }

  handleHighFive(chatId: string): void {
    this.actionsService.highFive(chatId).subscribe({
      next: () => {
        this.showSuccess('Batti 5 inviato! 👋');
      },
      error: (err) => {
        console.error('Error sending high five:', err);
        this.showError('Errore nell\'invio del messaggio');
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}

