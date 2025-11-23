import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { PatientsService } from '../../services/patients.service';
import { PatientDetail } from '../../models/patient.model';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientOverviewComponent } from '../../components/patient-overview/patient-overview.component';
import { PatientMetricsComponent } from '../../components/patient-metrics/patient-metrics.component';
import { PatientDietsComponent } from '../../components/patient-diets/patient-diets.component';
import { PatientAnalysesComponent } from '../../components/patient-analyses/patient-analyses.component';
import { PatientPsychologicalMetricsComponent } from '../../components/patient-psychological-metrics/patient-psychological-metrics.component';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PatientOverviewComponent,
    PatientMetricsComponent,
    PatientDietsComponent,
    PatientAnalysesComponent,
    PatientPsychologicalMetricsComponent
  ],
  template: `
    <div class="patient-detail-container">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-header [subtitle]="'Dettaglio paziente: ' + (patient?.name || 'Caricamento...')"></app-header>
        <div class="content-area">
          <button mat-icon-button (click)="goBack()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
            <span>Indietro</span>
          </button>

          <div *ngIf="loading" class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Caricamento dati paziente...</p>
          </div>

          <div *ngIf="error" class="error-container">
            <mat-icon>error</mat-icon>
            <p><strong>Errore:</strong> {{ error }}</p>
            <p class="error-hint">Verifica che il backend sia in esecuzione su http://localhost:8000</p>
            <button mat-button color="primary" (click)="loadPatient()">Riprova</button>
            <button mat-button (click)="goBack()">Torna alla lista</button>
          </div>

          <div *ngIf="!loading && !error && patient" class="patient-content">
            <mat-tab-group>
              <mat-tab label="Panoramica">
                <app-patient-overview [patient]="patient"></app-patient-overview>
              </mat-tab>
              <mat-tab label="Metriche di Salute">
                <app-patient-metrics [patient]="patient"></app-patient-metrics>
              </mat-tab>
              <mat-tab label="Piani Alimentari">
                <app-patient-diets [patient]="patient"></app-patient-diets>
              </mat-tab>
              <mat-tab label="Analisi Cibo">
                <app-patient-analyses [patient]="patient"></app-patient-analyses>
              </mat-tab>
              <mat-tab label="Metriche Psicologiche">
                <app-patient-psychological-metrics [patient]="patient"></app-patient-psychological-metrics>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .patient-detail-container {
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

    .back-button {
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
    }

    .error-container {
      color: #d32f2f;
      text-align: center;
    }

    .error-container p {
      margin: 0.5rem 0;
    }

    .error-hint {
      font-size: 0.9rem;
      color: #666;
      font-style: italic;
      margin-top: 1rem !important;
    }

    .error-container button {
      margin: 0.5rem;
    }

    .patient-content {
      margin-top: 1rem;
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      padding: 1rem 0;
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  patient?: PatientDetail;
  loading = false;
  error?: string;
  chatId?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientsService: PatientsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.chatId = params['chatId'];
      console.log('Patient detail - Chat ID:', this.chatId);
      if (this.chatId) {
        this.loadPatient();
      } else {
        this.error = 'Chat ID non valido';
        this.loading = false;
      }
    });
  }

  loadPatient(): void {
    if (!this.chatId) {
      this.error = 'Chat ID non specificato';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = undefined;
    this.patient = undefined;

    console.log('Loading patient detail for chat_id:', this.chatId);

    this.patientsService.getPatientDetail(this.chatId).subscribe({
      next: (patient) => {
        console.log('Patient loaded successfully:', patient);
        this.patient = patient;
        this.loading = false;
        this.error = undefined;
      },
      error: (err) => {
        console.error('Error loading patient:', err);
        this.loading = false;
        this.error = err.message || 'Errore nel caricamento dei dati del paziente. Verifica che il backend sia in esecuzione.';
        this.patient = undefined;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }
}

