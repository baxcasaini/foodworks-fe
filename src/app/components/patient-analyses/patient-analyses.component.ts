import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientDetail, FoodAnalysis } from '../../models/patient.model';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Chart, ChartData, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-patient-analyses',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="analyses-container">
      <div class="chart-section" *ngIf="frequencyChartData.labels && frequencyChartData.labels.length > 0">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Frequenza Analisi nel Tempo</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas #frequencyChart></canvas>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="patient.food_analyses && patient.food_analyses.length === 0" class="no-data">
        <mat-icon>restaurant</mat-icon>
        <p>Nessuna analisi cibo disponibile</p>
      </div>

      <div *ngIf="patient.food_analyses && patient.food_analyses.length > 0" class="analyses-list">
        <mat-card *ngFor="let analysis of sortedAnalyses" class="analysis-card">
          <mat-card-header>
            <mat-card-title>
              Analisi del {{ getFormattedDate(analysis.analysis_date) }}
            </mat-card-title>
            <mat-card-subtitle *ngIf="analysis.score">
              Score: 
              <mat-chip [ngClass]="getScoreClass(analysis.score)">
                {{ analysis.score }}/10
              </mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="analysis-info">
              <div class="info-row" *ngIf="analysis.feedback">
                <mat-icon>feedback</mat-icon>
                <div>
                  <strong>Feedback:</strong>
                  <p>{{ analysis.feedback }}</p>
                </div>
              </div>
              <div class="info-row" *ngIf="analysis.food_items">
                <mat-icon>restaurant</mat-icon>
                <div>
                  <strong>Alimenti Analizzati:</strong>
                  <p>{{ getFoodItemsSummary(analysis.food_items) }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .analyses-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .chart-section {
      margin-bottom: 1rem;
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

    .analyses-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .analysis-card {
      margin-bottom: 1rem;
    }

    .analysis-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .info-row {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .info-row mat-icon {
      color: #666;
      margin-top: 0.25rem;
    }

    .info-row p {
      margin: 0.5rem 0 0 0;
      color: #666;
    }

    mat-chip {
      margin-left: 0.5rem;
    }

    .score-high {
      background-color: #4caf50;
      color: white;
    }

    .score-medium {
      background-color: #ff9800;
      color: white;
    }

    .score-low {
      background-color: #f44336;
      color: white;
    }
  `]
})
export class PatientAnalysesComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() patient!: PatientDetail;
  @ViewChild('frequencyChart', { static: false }) frequencyChartRef!: ElementRef<HTMLCanvasElement>;

  private frequencyChart?: Chart;
  private chartInitialized = false;

  frequencyChartData: ChartData<'bar'> = {
    labels: [] as string[],
    datasets: [{
      label: 'Numero Analisi',
      data: [],
      backgroundColor: '#1976d2'
    }]
  };

  chartType: ChartType = 'bar';

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  ngOnInit(): void {
    if (this.patient) {
      this.processAnalyses();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patient'] && this.patient) {
      this.processAnalyses();
      // Se il grafico è già stato inizializzato, ricrealo con i nuovi dati
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

  get sortedAnalyses(): FoodAnalysis[] {
    // Usa dati fake se non ci sono dati reali
    let analyses = this.patient.food_analyses;
    if (!analyses || analyses.length === 0) {
      analyses = this.generateFakeAnalyses();
    }
    if (!analyses) return [];
    return [...analyses].sort((a, b) => 
      new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime()
    );
  }

  processAnalyses(): void {
    // Se non ci sono dati reali, usa dati fake per demo
    let analyses = this.patient.food_analyses;
    if (!analyses || analyses.length === 0) {
      analyses = this.generateFakeAnalyses();
    }

    if (!analyses || analyses.length === 0) {
      return;
    }

    // Raggruppa per mese
    const monthlyCount: { [key: string]: number } = {};
    
    analyses.forEach(analysis => {
      const date = new Date(analysis.analysis_date);
      const monthKey = date.toLocaleDateString('it-IT', { year: 'numeric', month: 'short' });
      monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
    });

    const labels = Object.keys(monthlyCount).sort();
    const data = labels.map(label => monthlyCount[label]);

    this.frequencyChartData = {
      labels: labels,
      datasets: [{
        label: 'Numero Analisi',
        data: data,
        backgroundColor: '#1976d2'
      }]
    };

    // Ricrea il grafico se già inizializzato
    if (this.frequencyChart) {
      setTimeout(() => this.createChart(), 100);
    }
  }

  createChart(): void {
    // Distruggi grafico esistente
    if (this.frequencyChart) {
      this.frequencyChart.destroy();
      this.frequencyChart = undefined;
    }

    // Crea grafico frequenza
    if (this.frequencyChartRef?.nativeElement && this.frequencyChartData.labels && this.frequencyChartData.labels.length > 0) {
      const ctx = this.frequencyChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.frequencyChart = new Chart(ctx, {
          type: 'bar',
          data: this.frequencyChartData,
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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  getScoreClass(score: number): string {
    if (score >= 7) return 'score-high';
    if (score >= 4) return 'score-medium';
    return 'score-low';
  }

  getFoodItemsSummary(foodItems: any): string {
    if (typeof foodItems === 'string') {
      try {
        const parsed = JSON.parse(foodItems);
        if (Array.isArray(parsed)) {
          return parsed.join(', ');
        }
        return parsed.toString();
      } catch {
        return foodItems;
      }
    }
    if (Array.isArray(foodItems)) {
      return foodItems.join(', ');
    }
    return foodItems?.toString() || 'N/A';
  }

  private generateFakeAnalyses(): FoodAnalysis[] {
    const fakeAnalyses: FoodAnalysis[] = [];
    const today = new Date();
    const feedbacks = [
      'Ottimo pasto, mi sento sazio e soddisfatto',
      'Buona combinazione di nutrienti',
      'Pasto equilibrato, perfetto per i miei obiettivi',
      'Eccellente scelta, seguirò questo piano',
      'Molto buono, continuerò così',
      'Pasto nutriente e gustoso',
      'Perfetto per la mia dieta',
      'Ottima selezione di alimenti'
    ];
    
    const foodItems = [
      ['Pollo grigliato', 'Riso integrale', 'Verdure miste'],
      ['Salmone', 'Patate dolci', 'Broccoli'],
      ['Pasta integrale', 'Pomodoro', 'Basilico'],
      ['Petto di tacchino', 'Quinoa', 'Zucchine'],
      ['Uova', 'Avocado', 'Pane integrale'],
      ['Tonno', 'Insalata', 'Olive'],
      ['Yogurt greco', 'Frutta fresca', 'Noci'],
      ['Bistecca', 'Patate', 'Carote']
    ];
    
    // Genera 15 analisi degli ultimi 2 mesi
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (60 - i * 4));
      
      const score = Math.floor(Math.random() * 4) + 7; // Score tra 7-10
      const feedbackIndex = Math.floor(Math.random() * feedbacks.length);
      const foodIndex = Math.floor(Math.random() * foodItems.length);
      
      fakeAnalyses.push({
        chat_id: this.patient.chat_id,
        analysis_date: date.toISOString(),
        food_items: foodItems[foodIndex],
        feedback: feedbacks[feedbackIndex],
        score: score
      });
    }
    
    return fakeAnalyses;
  }
}

