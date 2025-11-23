import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientSummary } from '../../models/patient.model';
import { PatientCardComponent } from '../patient-card/patient-card.component';

@Component({
  selector: 'app-patient-grid',
  standalone: true,
  imports: [CommonModule, PatientCardComponent],
  template: `
    <div class="patient-grid">
      <app-patient-card
        *ngFor="let patient of patients"
        [patient]="patient"
        (quickCheckin)="onQuickCheckin($event)"
        (modifyPlan)="onModifyPlan($event)"
        (highFive)="onHighFive($event)">
      </app-patient-card>
    </div>
  `,
  styles: [`
    .patient-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
  `]
})
export class PatientGridComponent {
  @Input() patients: PatientSummary[] = [];
  @Output() quickCheckin = new EventEmitter<string>();
  @Output() modifyPlan = new EventEmitter<string>();
  @Output() highFive = new EventEmitter<string>();

  onQuickCheckin(chatId: string): void {
    this.quickCheckin.emit(chatId);
  }

  onModifyPlan(chatId: string): void {
    this.modifyPlan.emit(chatId);
  }

  onHighFive(chatId: string): void {
    this.highFive.emit(chatId);
  }
}

