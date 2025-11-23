import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <div class="sidebar">
      <div class="logo">
        <div class="logo-icon">
          <div class="logo-square green"></div>
          <div class="logo-square blue"></div>
          <div class="logo-square orange"></div>
          <div class="logo-square dark-blue"></div>
        </div>
        <span class="logo-text">Foodworks</span>
      </div>
      <nav>
        <mat-list>
          <mat-list-item [routerLink]="['/dashboard']" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </mat-list-item>
          <mat-list-item [routerLink]="['/patients']" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Pazienti</span>
          </mat-list-item>
          <mat-list-item [routerLink]="['/agenda']" routerLinkActive="active">
            <mat-icon matListItemIcon>calendar_today</mat-icon>
            <span matListItemTitle>Agenda</span>
          </mat-list-item>
          <mat-list-item [routerLink]="['/nutrition']" routerLinkActive="active">
            <mat-icon matListItemIcon>restaurant</mat-icon>
            <span matListItemTitle>Nutrizione</span>
          </mat-list-item>
          <mat-list-item [routerLink]="['/analytics']" routerLinkActive="active">
            <mat-icon matListItemIcon>analytics</mat-icon>
            <span matListItemTitle>Analisi dati</span>
          </mat-list-item>
          <mat-list-item [routerLink]="['/settings']" routerLinkActive="active">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Impostazioni</span>
          </mat-list-item>
        </mat-list>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      background-color: #ffffff;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
    }

    .logo {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .logo-icon {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;
      width: 32px;
      height: 32px;
    }

    .logo-square {
      width: 14px;
      height: 14px;
      border-radius: 3px;
    }

    .logo-square.green { background-color: #4CAF50; }
    .logo-square.blue { background-color: #2196F3; }
    .logo-square.orange { background-color: #FF9800; }
    .logo-square.dark-blue { background-color: #1976D2; }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 500;
      color: #212121;
    }

    nav {
      flex: 1;
      overflow-y: auto;
    }

    mat-list {
      padding: 0;
    }

    mat-list-item {
      cursor: pointer;
      padding: 0.75rem 1.5rem;
    }

    mat-list-item:hover {
      background-color: #f5f5f5;
    }

    mat-list-item.active {
      background-color: #e3f2fd;
      border-left: 3px solid #2196F3;
    }

    mat-list-item.active mat-icon {
      color: #2196F3;
    }
  `]
})
export class SidebarComponent {}

