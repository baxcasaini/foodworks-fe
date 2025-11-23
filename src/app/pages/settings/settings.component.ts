import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, MatCardModule],
  template: `
    <div class="settings-container">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-header subtitle="Impostazioni e preferenze"></app-header>
        <div class="content-area">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Impostazioni</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Funzionalità in sviluppo. Qui verranno visualizzate le impostazioni dell'account.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
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
  `]
})
export class SettingsComponent {}

