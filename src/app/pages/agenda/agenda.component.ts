import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgendaService, AgendaEvent } from '../../services/agenda.service';
import { PatientsService } from '../../services/patients.service';
import { PatientListItem } from '../../models/patient.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="agenda-container">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-header subtitle="Calendario e appuntamenti"></app-header>
        <div class="content-area">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Eventi e Appuntamenti</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="filters">
                <mat-form-field>
                  <mat-label>Paziente</mat-label>
                  <mat-select [(ngModel)]="selectedPatient" (selectionChange)="loadEvents()">
                    <mat-option [value]="undefined">Tutti i pazienti</mat-option>
                    <mat-option *ngFor="let patient of patients" [value]="patient.chat_id">
                      {{ patient.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Data Inizio</mat-label>
                  <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" (dateChange)="loadEvents()">
                  <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                  <mat-datepicker #startPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Data Fine</mat-label>
                  <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" (dateChange)="loadEvents()">
                  <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                  <mat-datepicker #endPicker></mat-datepicker>
                </mat-form-field>

                <button mat-button (click)="clearFilters()">Reset Filtri</button>
              </div>

              <div *ngIf="loading" class="loading-container">
                <mat-spinner></mat-spinner>
                <p>Caricamento eventi...</p>
              </div>

              <div *ngIf="!loading && events.length === 0" class="no-data">
                <mat-icon>event_busy</mat-icon>
                <p>Nessun evento trovato nel periodo selezionato</p>
              </div>

              <table mat-table [dataSource]="events" *ngIf="!loading && events.length > 0" class="events-table">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Data</th>
                  <td mat-cell *matCellDef="let event">{{ getFormattedDate(event.date) }}</td>
                </ng-container>

                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Titolo</th>
                  <td mat-cell *matCellDef="let event">
                    <div class="event-title">
                      <mat-icon [ngClass]="getEventIconClass(event.source)">{{ getEventIcon(event.source) }}</mat-icon>
                      {{ event.title }}
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="patient">
                  <th mat-header-cell *matHeaderCellDef>Paziente</th>
                  <td mat-cell *matCellDef="let event">
                    {{ event.patient_name || event.patient_chat_id || '-' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let event">
                    <mat-chip [ngClass]="getTypeClass(event.source)">
                      {{ getTypeLabel(event.source) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="notes">
                  <th mat-header-cell *matHeaderCellDef>Note</th>
                  <td mat-cell *matCellDef="let event">{{ event.notes || '-' }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .agenda-container {
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

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .filters mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .loading-container, .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
    }

    .events-table {
      width: 100%;
    }

    .event-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .event-title mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .icon-appointment {
      color: #1976d2;
    }

    .icon-diet {
      color: #4caf50;
    }

    .icon-action {
      color: #ff9800;
    }

    .type-appointment {
      background-color: #1976d2;
      color: white;
    }

    .type-diet {
      background-color: #4caf50;
      color: white;
    }

    .type-action {
      background-color: #ff9800;
      color: white;
    }
  `]
})
export class AgendaComponent implements OnInit {
  events: AgendaEvent[] = [];
  patients: PatientListItem[] = [];
  loading = false;
  selectedPatient?: string;
  startDate?: Date;
  endDate?: Date;

  displayedColumns: string[] = ['date', 'title', 'patient', 'type', 'notes'];

  constructor(
    private agendaService: AgendaService,
    private patientsService: PatientsService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadEvents();
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

  loadEvents(): void {
    this.loading = true;
    
    const startDateStr = this.startDate ? this.startDate.toISOString().split('T')[0] : undefined;
    const endDateStr = this.endDate ? this.endDate.toISOString().split('T')[0] : undefined;

    this.agendaService.getEvents(startDateStr, endDateStr, this.selectedPatient).subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.selectedPatient = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    this.loadEvents();
  }

  getFormattedDate(dateString: string): string {
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
      return dateString;
    }
  }

  getEventIcon(source: string): string {
    switch (source) {
      case 'appointment':
        return 'event';
      case 'diet':
        return 'restaurant_menu';
      case 'action':
        return 'touch_app';
      default:
        return 'info';
    }
  }

  getEventIconClass(source: string): string {
    return `icon-${source}`;
  }

  getTypeLabel(source: string): string {
    switch (source) {
      case 'appointment':
        return 'Appuntamento';
      case 'diet':
        return 'Piano Alimentare';
      case 'action':
        return 'Azione';
      default:
        return source;
    }
  }

  getTypeClass(source: string): string {
    return `type-${source}`;
  }
}

