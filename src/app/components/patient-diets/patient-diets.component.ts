import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientDetail, Diet } from '../../models/patient.model';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-patient-diets',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="diets-container">
      <div *ngIf="patient.diets && patient.diets.length === 0" class="no-data">
        <mat-icon>restaurant_menu</mat-icon>
        <p>Nessun piano alimentare disponibile</p>
      </div>

      <div *ngIf="patient.diets && patient.diets.length > 0" class="diets-list">
        <mat-card *ngFor="let diet of sortedDiets; let i = index" class="diet-card">
          <mat-card-header>
            <mat-card-title>Piano Alimentare #{{ i + 1 }}</mat-card-title>
            <mat-card-subtitle>
              Creato il {{ getFormattedDate(diet.creation_date) }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="diet-info">
              <div class="info-row">
                <mat-icon>calendar_today</mat-icon>
                <span><strong>Data Creazione:</strong> {{ getFormattedDate(diet.creation_date) }}</span>
              </div>
              <div class="info-row" *ngIf="diet.status">
                <mat-icon>info</mat-icon>
                <span>
                  <strong>Stato:</strong>
                  <mat-chip [ngClass]="getStatusClass(diet.status)">
                    {{ getStatusLabel(diet.status) }}
                  </mat-chip>
                </span>
              </div>
              <div class="info-row" *ngIf="diet.id">
                <mat-icon>tag</mat-icon>
                <span><strong>ID Piano:</strong> {{ diet.id }}</span>
              </div>
            </div>
            <div class="diet-actions">
              <button mat-button color="primary" (click)="viewDiet(diet)" matTooltip="Visualizza dettagli piano">
                <mat-icon>visibility</mat-icon>
                Visualizza
              </button>
              <button mat-button (click)="modifyDiet(diet)" matTooltip="Modifica piano">
                <mat-icon>edit</mat-icon>
                Modifica
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .diets-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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

    .diets-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .diet-card {
      margin-bottom: 1rem;
    }

    .diet-info {
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

    .diet-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    mat-chip {
      margin-left: 0.5rem;
    }

    .status-active {
      background-color: #4caf50;
      color: white;
    }

    .status-inactive {
      background-color: #999;
      color: white;
    }

    .status-pending {
      background-color: #ff9800;
      color: white;
    }
  `]
})
export class PatientDietsComponent {
  @Input() patient!: PatientDetail;

  get sortedDiets(): Diet[] {
    // Usa dati fake se non ci sono dati reali
    let diets = this.patient.diets;
    if (!diets || diets.length === 0) {
      diets = this.generateFakeDiets();
    }
    if (!diets) return [];
    return [...diets].sort((a, b) => 
      new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime()
    );
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

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('attivo')) {
      return 'status-active';
    } else if (statusLower.includes('pending') || statusLower.includes('in attesa')) {
      return 'status-pending';
    }
    return 'status-inactive';
  }

  getStatusLabel(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('attivo')) {
      return 'Attivo';
    } else if (statusLower.includes('pending') || statusLower.includes('in attesa')) {
      return 'In Attesa';
    }
    return 'Inattivo';
  }

  viewDiet(diet: Diet): void {
    console.log('View diet:', diet);
    // TODO: Implementare visualizzazione dettagli piano
  }

  modifyDiet(diet: Diet): void {
    console.log('Modify diet:', diet);
    // TODO: Implementare modifica piano
  }

  private generateFakeDiets(): Diet[] {
    const fakeDiets: Diet[] = [];
    const today = new Date();
    const statuses = ['active', 'inactive', 'pending'];
    
    // Genera 3 piani alimentari degli ultimi 3 mesi
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - (2 - i));
      
      fakeDiets.push({
        id: 1000 + i,
        chat_id: this.patient.chat_id,
        creation_date: date.toISOString(),
        status: statuses[i] || 'active',
        diet_data: {
          name: `Piano Alimentare ${i + 1}`,
          calories: 1800 + (i * 100),
          description: `Piano personalizzato per ${this.patient.name}`
        }
      });
    }
    
    return fakeDiets;
  }
}

