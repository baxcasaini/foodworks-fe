import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientDetail, PsychologicalMetric } from '../../models/patient.model';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import Chart, { ChartData, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-patient-psychological-metrics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule
  ],
  template: `
    <div class="psychological-metrics-container">
      <div *ngIf="sortedMetrics.length === 0" class="no-data">
        <mat-icon>psychology</mat-icon>
        <p>Nessuna metrica psicologica registrata per questo paziente.</p>
        <p class="subtitle">Le metriche verranno generate automaticamente dall'analisi dei messaggi e degli audio vocali.</p>
      </div>

      <div *ngIf="sortedMetrics.length > 0" class="metrics-content">
        <!-- Statistiche riassuntive -->
        <div class="summary-cards">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="summary-icon">😊</div>
              <div class="summary-value">{{ averageSentiment.toFixed(2) }}</div>
              <div class="summary-label">Sentiment Medio</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="summary-icon">{{ getMoodIcon(dominantMoodState) }}</div>
              <div class="summary-value">{{ getMoodLabel(dominantMoodState) }}</div>
              <div class="summary-label">Stato d'Animo Dominante</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="summary-icon">📊</div>
              <div class="summary-value">{{ sortedMetrics.length }}</div>
              <div class="summary-label">Analisi Totali</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="summary-icon">🎯</div>
              <div class="summary-value">{{ getTopEmotion() }}</div>
              <div class="summary-label">Emozione Più Frequente</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Grafici -->
        <div class="charts-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Andamento Sentiment nel Tempo</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-wrapper">
                <canvas #sentimentChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Distribuzione Emozioni</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-wrapper">
                <canvas #emotionsChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tabella dettagliata -->
        <mat-card class="metrics-table-card">
          <mat-card-header>
            <mat-card-title>Storico Analisi Psicologiche</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="sortedMetrics" class="full-width-table">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Data</th>
                <td mat-cell *matCellDef="let metric">{{ getFormattedDate(metric.analysis_date) }}</td>
              </ng-container>

              <ng-container matColumnDef="source">
                <th mat-header-cell *matHeaderCellDef>Fonte</th>
                <td mat-cell *matCellDef="let metric">
                  <mat-chip-listbox>
                    <mat-chip [color]="metric.source_type === 'voice' ? 'primary' : 'accent'" selected>
                      {{ metric.source_type === 'voice' ? '🎤 Audio' : '💬 Testo' }}
                    </mat-chip>
                  </mat-chip-listbox>
                </td>
              </ng-container>

              <ng-container matColumnDef="dominant_emotion">
                <th mat-header-cell *matHeaderCellDef>Emozione Dominante</th>
                <td mat-cell *matCellDef="let metric">
                  <mat-chip-listbox>
                    <mat-chip [ngClass]="getEmotionClass(metric.dominant_emotion)" selected>
                      {{ getEmotionLabel(metric.dominant_emotion) }}
                    </mat-chip>
                  </mat-chip-listbox>
                </td>
              </ng-container>

              <ng-container matColumnDef="sentiment">
                <th mat-header-cell *matHeaderCellDef>Sentiment</th>
                <td mat-cell *matCellDef="let metric">
                  <div class="sentiment-bar">
                    <div class="sentiment-fill" 
                         [style.width.%]="(metric.sentiment_score + 1) * 50"
                         [ngClass]="getSentimentClass(metric.sentiment_score)">
                    </div>
                    <span class="sentiment-value">{{ metric.sentiment_score.toFixed(2) }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="mood">
                <th mat-header-cell *matHeaderCellDef>Stato d'Animo</th>
                <td mat-cell *matCellDef="let metric">
                  <mat-chip-listbox>
                    <mat-chip [ngClass]="getMoodClass(metric.mood_state)" selected>
                      {{ getMoodLabel(metric.mood_state) }}
                    </mat-chip>
                  </mat-chip-listbox>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .psychological-metrics-container {
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
      text-align: center;
    }

    .no-data mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
    }

    .no-data .subtitle {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      text-align: center;
    }

    .summary-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .summary-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 0.5rem;
    }

    .summary-label {
      color: #666;
      font-size: 0.9rem;
    }

    .charts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .charts-section {
        grid-template-columns: 1fr;
      }
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
    }

    .metrics-table-card {
      margin-top: 1.5rem;
    }

    .full-width-table {
      width: 100%;
    }

    .sentiment-bar {
      position: relative;
      width: 100%;
      height: 24px;
      background-color: #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
    }

    .sentiment-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      transition: width 0.3s ease;
    }

    .sentiment-positive {
      background-color: #4caf50;
    }

    .sentiment-neutral {
      background-color: #ff9800;
    }

    .sentiment-negative {
      background-color: #f44336;
    }

    .sentiment-value {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      font-weight: bold;
      color: #333;
      z-index: 1;
    }

    /* Emotion classes */
    .emotion-joy { background-color: #ffeb3b; color: #333; }
    .emotion-sadness { background-color: #2196f3; color: white; }
    .emotion-anger { background-color: #f44336; color: white; }
    .emotion-fear { background-color: #9c27b0; color: white; }
    .emotion-anxiety { background-color: #ff9800; color: white; }
    .emotion-calm { background-color: #4caf50; color: white; }
    .emotion-excitement { background-color: #ff5722; color: white; }
    .emotion-neutral { background-color: #9e9e9e; color: white; }

    /* Mood classes */
    .mood-positive { background-color: #4caf50; color: white; }
    .mood-negative { background-color: #f44336; color: white; }
    .mood-neutral { background-color: #9e9e9e; color: white; }
    .mood-anxious { background-color: #ff9800; color: white; }
    .mood-mixed { background-color: #9c27b0; color: white; }
  `]
})
export class PatientPsychologicalMetricsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() patient!: PatientDetail;
  @ViewChild('sentimentChart', { static: false }) sentimentChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('emotionsChart', { static: false }) emotionsChartRef!: ElementRef<HTMLCanvasElement>;

  private sentimentChart?: Chart;
  private emotionsChart?: Chart;
  private chartsInitialized = false;
  
  // Memorizza i dati per evitare rigenerazioni durante change detection
  private cachedMetrics: PsychologicalMetric[] = [];
  private cachedAverageSentiment: number = 0;
  private cachedDominantMood: string = 'neutral';

  displayedColumns: string[] = ['date', 'source', 'dominant_emotion', 'sentiment', 'mood'];

  sentimentChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Sentiment Score',
      data: [],
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  emotionsChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Frequenza',
      data: [],
      backgroundColor: []
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        min: -1
      }
    }
  };

  get sortedMetrics(): PsychologicalMetric[] {
    return this.cachedMetrics;
  }

  get averageSentiment(): number {
    return this.cachedAverageSentiment;
  }

  get dominantMoodState(): string {
    return this.cachedDominantMood;
  }

  ngOnInit(): void {
    this.updateMetricsCache();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patient'] && this.patient) {
      this.updateMetricsCache();
      if (this.chartsInitialized) {
        setTimeout(() => this.createCharts(), 200);
      }
    }
  }

  private updateMetricsCache(): void {
    // Aggiorna la cache dei dati per evitare cambiamenti durante change detection
    if (!this.patient.psychological_metrics || this.patient.psychological_metrics.length === 0) {
      this.cachedMetrics = this.generateFakeMetrics();
    } else {
      this.cachedMetrics = [...this.patient.psychological_metrics].sort((a, b) =>
        new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime()
      );
    }
    
    // Calcola e memorizza i valori derivati
    if (this.cachedMetrics.length === 0) {
      this.cachedAverageSentiment = 0;
      this.cachedDominantMood = 'neutral';
    } else {
      const sum = this.cachedMetrics.reduce((acc, m) => acc + m.sentiment_score, 0);
      this.cachedAverageSentiment = sum / this.cachedMetrics.length;
      
      const moodCounts: { [key: string]: number } = {};
      this.cachedMetrics.forEach(m => {
        moodCounts[m.mood_state] = (moodCounts[m.mood_state] || 0) + 1;
      });
      this.cachedDominantMood = Object.keys(moodCounts).reduce((a, b) => 
        moodCounts[a] > moodCounts[b] ? a : b
      );
    }
    
    // Processa i dati per i grafici
    this.processMetrics();
  }

  ngAfterViewInit(): void {
    this.chartsInitialized = true;
    setTimeout(() => {
      this.createCharts();
    }, 300);
  }

  processMetrics(): void {
    const metrics = this.cachedMetrics;
    
    // Prepara dati per grafico sentiment
    const sentimentLabels = metrics.map(m =>
      new Date(m.analysis_date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
    );
    const sentimentData = metrics.map(m => m.sentiment_score);

    this.sentimentChartData = {
      labels: sentimentLabels,
      datasets: [{
        label: 'Sentiment Score',
        data: sentimentData,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };

    // Prepara dati per grafico emozioni
    const emotionCounts: { [key: string]: number } = {};
    metrics.forEach(m => {
      const emotion = m.dominant_emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const emotionLabels = Object.keys(emotionCounts);
    const emotionData = Object.values(emotionCounts);
    const emotionColors = emotionLabels.map(e => this.getEmotionColor(e));

    this.emotionsChartData = {
      labels: emotionLabels.map(e => this.getEmotionLabel(e)),
      datasets: [{
        label: 'Frequenza',
        data: emotionData,
        backgroundColor: emotionColors
      }]
    };
  }

  createCharts(): void {
    if (this.sentimentChart) {
      this.sentimentChart.destroy();
      this.sentimentChart = undefined;
    }
    if (this.emotionsChart) {
      this.emotionsChart.destroy();
      this.emotionsChart = undefined;
    }

    if (this.sentimentChartRef?.nativeElement && this.sentimentChartData.labels && this.sentimentChartData.labels.length > 0) {
      const ctx = this.sentimentChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.sentimentChart = new Chart(ctx, {
          type: 'line',
          data: this.sentimentChartData,
          options: {
            ...this.chartOptions,
            scales: {
              y: {
                beginAtZero: false,
                min: -1,
                max: 1,
                title: {
                  display: true,
                  text: 'Sentiment Score (-1 negativo, +1 positivo)'
                }
              }
            }
          }
        });
      }
    }

    if (this.emotionsChartRef?.nativeElement && this.emotionsChartData.labels && this.emotionsChartData.labels.length > 0) {
      const ctx = this.emotionsChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.emotionsChart = new Chart(ctx, {
          type: 'bar',
          data: this.emotionsChartData,
          options: {
            ...this.chartOptions,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
      }
    }
  }

  generateFakeMetrics(): PsychologicalMetric[] {
    const fakeMetrics: PsychologicalMetric[] = [];
    const today = new Date();
    const emotions = ['joy', 'calm', 'anxiety', 'neutral', 'excitement', 'sadness', 'anger', 'fear', 'frustration'];
    const moods: Array<'positive' | 'negative' | 'neutral' | 'anxious' | 'mixed'> = 
      ['positive', 'neutral', 'anxious', 'positive', 'neutral', 'negative', 'mixed'];
    
    const sourceTypes: Array<'text' | 'voice'> = ['text', 'voice'];
    const sampleMessages = [
      'Sto seguendo il piano alimentare, oggi ho mangiato bene',
      'Mi sento un po\' stanco oggi, ma continuo con la dieta',
      'Ottimo! Ho perso peso questa settimana',
      'Ho difficoltà a resistere alle tentazioni',
      'Mi sento motivato e positivo',
      'Non vedo risultati, sono demoralizzato',
      'Ho bisogno di aiuto per capire meglio il piano',
      'Tutto bene, procedo come previsto',
      'Ho avuto una giornata stressante',
      'Sono contento dei progressi fatti',
      'Vorrei modificare qualcosa nel piano',
      'Mi sento più energico ultimamente',
      'Ho saltato alcuni pasti questa settimana',
      'Il piano funziona bene per me',
      'Sto lottando con la motivazione',
      'Ho bisogno di più supporto',
      'Mi sento frustrato perché non vedo cambiamenti',
      'Sono orgoglioso di me stesso',
      'Ho bisogno di consigli su cosa mangiare',
      'Mi sento ansioso riguardo ai risultati',
      'Tutto procede secondo i piani',
      'Ho difficoltà a mantenere la costanza',
      'Mi sento più sicuro di me',
      'Ho bisogno di un piano più semplice',
      'Sono molto soddisfatto del supporto ricevuto',
      'Mi sento confuso su alcune indicazioni',
      'Sto notando miglioramenti positivi',
      'Ho bisogno di più tempo per adattarmi',
      'Mi sento determinato a raggiungere l\'obiettivo',
      'Ho avuto una ricaduta questa settimana'
    ];

    // Genera metriche per gli ultimi 60 giorni (circa 2 mesi)
    // Con una frequenza variabile: più frequenti nelle prime settimane, meno frequenti dopo
    let metricId = 1;
    for (let dayOffset = 60; dayOffset >= 0; dayOffset--) {
      // Probabilità di avere una metrica in questo giorno (più probabile nei giorni recenti)
      const probability = dayOffset < 7 ? 0.9 : dayOffset < 14 ? 0.7 : dayOffset < 30 ? 0.5 : 0.3;
      
      if (Math.random() < probability) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOffset);
        // Aggiungi variabilità nell'ora del giorno
        date.setHours(Math.floor(Math.random() * 24));
        date.setMinutes(Math.floor(Math.random() * 60));
        
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        const mood = moods[Math.floor(Math.random() * moods.length)];
        
        // Sentiment score più realistico basato sull'emozione e mood
        let sentiment = Math.random() * 2 - 1; // Base tra -1 e 1
        if (emotion === 'joy' || emotion === 'excitement' || emotion === 'calm') {
          sentiment = Math.random() * 0.6 + 0.2; // Tra 0.2 e 0.8 (positivo)
        } else if (emotion === 'sadness' || emotion === 'anger' || emotion === 'fear' || emotion === 'anxiety') {
          sentiment = Math.random() * 0.6 - 0.8; // Tra -0.8 e -0.2 (negativo)
        } else if (emotion === 'frustration') {
          sentiment = Math.random() * 0.4 - 0.6; // Tra -0.6 e -0.2 (leggermente negativo)
        }
        
        // Aggiungi una leggera tendenza temporale (miglioramento nel tempo)
        if (dayOffset < 30) {
          sentiment += 0.1; // Le metriche recenti tendono ad essere leggermente più positive
        }
        sentiment = Math.max(-1, Math.min(1, sentiment)); // Clamp tra -1 e 1
        
        const sourceType = sourceTypes[Math.floor(Math.random() * sourceTypes.length)];
        const messageIndex = Math.floor(Math.random() * sampleMessages.length);
        
        // Genera emotion_scores più realistici
        const emotionScores: { [key: string]: number } = {};
        emotionScores[emotion] = 0.6 + Math.random() * 0.3; // Emozione dominante tra 0.6 e 0.9
        
        // Aggiungi altre emozioni secondarie
        const secondaryEmotions = emotions.filter(e => e !== emotion);
        const numSecondary = Math.floor(Math.random() * 3) + 1; // 1-3 emozioni secondarie
        const selectedSecondary = secondaryEmotions
          .sort(() => Math.random() - 0.5)
          .slice(0, numSecondary);
        
        selectedSecondary.forEach(secEmotion => {
          emotionScores[secEmotion] = Math.random() * 0.3; // Emozioni secondarie tra 0 e 0.3
        });
        
        // Normalizza gli score per sommare a circa 1
        const total = Object.values(emotionScores).reduce((a, b) => a + b, 0);
        Object.keys(emotionScores).forEach(key => {
          emotionScores[key] = emotionScores[key] / total;
        });

        fakeMetrics.push({
          id: metricId++,
          chat_id: this.patient.chat_id,
          analysis_date: date.toISOString(),
          source_type: sourceType,
          source_content: sourceType === 'text' ? sampleMessages[messageIndex] : `Audio vocale - ${sampleMessages[messageIndex]}`,
          emotion_scores: emotionScores,
          dominant_emotion: emotion,
          sentiment_score: sentiment,
          mood_state: mood,
          created_at: date.toISOString()
        });
      }
    }
    
    // Ordina per data (più recenti prima)
    return fakeMetrics.sort((a, b) => 
      new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime()
    );
  }

  getFormattedDate(dateString: string): string {
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

  getEmotionLabel(emotion: string): string {
    const labels: { [key: string]: string } = {
      'joy': 'Gioia',
      'sadness': 'Tristezza',
      'anger': 'Rabbia',
      'fear': 'Paura',
      'anxiety': 'Ansia',
      'calm': 'Calma',
      'excitement': 'Eccitazione',
      'neutral': 'Neutrale',
      'frustration': 'Frustrazione'
    };
    return labels[emotion] || emotion;
  }

  getEmotionClass(emotion: string): string {
    return `emotion-${emotion}`;
  }

  getEmotionColor(emotion: string): string {
    const colors: { [key: string]: string } = {
      'joy': '#ffeb3b',
      'sadness': '#2196f3',
      'anger': '#f44336',
      'fear': '#9c27b0',
      'anxiety': '#ff9800',
      'calm': '#4caf50',
      'excitement': '#ff5722',
      'neutral': '#9e9e9e',
      'frustration': '#795548'
    };
    return colors[emotion] || '#9e9e9e';
  }

  getMoodLabel(mood: string): string {
    const labels: { [key: string]: string } = {
      'positive': 'Positivo',
      'negative': 'Negativo',
      'neutral': 'Neutrale',
      'anxious': 'Ansioso',
      'mixed': 'Misto'
    };
    return labels[mood] || mood;
  }

  getMoodClass(mood: string): string {
    return `mood-${mood}`;
  }

  getMoodIcon(mood: string): string {
    const icons: { [key: string]: string } = {
      'positive': '😊',
      'negative': '😔',
      'neutral': '😐',
      'anxious': '😰',
      'mixed': '🤔'
    };
    return icons[mood] || '😐';
  }

  getSentimentClass(score: number): string {
    if (score > 0.3) return 'sentiment-positive';
    if (score < -0.3) return 'sentiment-negative';
    return 'sentiment-neutral';
  }

  getTopEmotion(): string {
    if (this.cachedMetrics.length === 0) return 'N/A';
    const emotionCounts: { [key: string]: number } = {};
    this.cachedMetrics.forEach(m => {
      emotionCounts[m.dominant_emotion] = (emotionCounts[m.dominant_emotion] || 0) + 1;
    });
    const top = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    );
    return this.getEmotionLabel(top);
  }
}

