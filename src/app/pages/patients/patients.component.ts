import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { PatientsService } from '../../services/patients.service';
import { PatientListItem } from '../../models/patient.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChurnIndicatorComponent } from '../../components/churn-indicator/churn-indicator.component';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    ChurnIndicatorComponent,
    TranslateModule
  ],
  template: `
    <div class="patients-container">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-header [subtitle]="'patients.title' | translate"></app-header>
        <div class="content-area">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'patients.list' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="loading" class="loading">{{ 'common.loading' | translate }}</div>
              <div *ngIf="!loading && patients.length === 0" class="no-data">
                {{ 'patients.noPatients' | translate }}
              </div>
              <table mat-table [dataSource]="patients" *ngIf="!loading && patients.length > 0" class="patients-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>{{ 'patients.name' | translate }}</th>
                  <td mat-cell *matCellDef="let patient">{{ patient.name }}</td>
                </ng-container>
                
                <ng-container matColumnDef="last_access">
                  <th mat-header-cell *matHeaderCellDef>{{ 'patients.lastAccess' | translate }}</th>
                  <td mat-cell *matCellDef="let patient">
                    {{ getFormattedDate(patient.last_access) }}
                  </td>
                </ng-container>
                
                <ng-container matColumnDef="churn">
                  <th mat-header-cell *matHeaderCellDef>{{ 'patients.churnScore' | translate }}</th>
                  <td mat-cell *matCellDef="let patient">
                    <app-churn-indicator 
                      [score]="patient.churn_score" 
                      [riskLevel]="patient.churn_risk_level">
                    </app-churn-indicator>
                  </td>
                </ng-container>
                
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>{{ 'patients.actions' | translate }}</th>
                  <td mat-cell *matCellDef="let patient">
                    <button mat-icon-button (click)="viewPatient(patient.chat_id); $event.stopPropagation()" [matTooltip]="'patients.viewDetails' | translate">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>
                
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                    (click)="viewPatient(row.chat_id)" 
                    style="cursor: pointer;">
                </tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .patients-container {
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

    .patients-table {
      width: 100%;
    }

    .loading, .no-data {
      text-align: center;
      padding: 2rem;
      color: #757575;
    }

    tr[mat-row]:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
  `]
})
export class PatientsComponent implements OnInit {
  patients: PatientListItem[] = [];
  loading = false;
  displayedColumns: string[] = ['name', 'last_access', 'churn', 'actions'];

  constructor(
    private patientsService: PatientsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.patientsService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading patients:', err);
        this.loading = false;
      }
    });
  }

  viewPatient(chatId: string): void {
    if (!chatId) {
      console.error('Chat ID non valido:', chatId);
      return;
    }
    console.log('Navigating to patient:', chatId);
    this.router.navigate(['/patients', chatId]).catch(err => {
      console.error('Errore nella navigazione:', err);
    });
  }

  getFormattedDate(dateString?: string): string {
    if (!dateString) return 'Mai';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}

