import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    TranslateModule
  ],
  template: `
    <div class="header">
      <div class="header-content">
        <div class="greeting">
          <h1>{{ 'header.greeting' | translate: {name: nutritionistName} }}</h1>
          <p *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="language-selector">
            <mat-select [value]="currentLang" (selectionChange)="changeLanguage($event.value)">
              <mat-option value="it">🇮🇹 IT</mat-option>
              <mat-option value="en">🇬🇧 EN</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-icon-button (click)="logout()" [matTooltip]="'header.logout' | translate">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header {
      background-color: #ffffff;
      border-bottom: 1px solid #e0e0e0;
      padding: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .greeting h1 {
      font-size: 2rem;
      font-weight: 500;
      margin: 0;
      color: #212121;
    }

    .greeting p {
      margin: 0.5rem 0 0 0;
      color: #757575;
      font-size: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .language-selector {
      width: 100px;
      margin-right: 0.5rem;
    }

    .language-selector ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() subtitle = '';
  nutritionistName = 'Dr. Rossi';
  currentLang = 'en';

  constructor(
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.full_name) {
      this.nutritionistName = user.full_name;
    } else if (user?.username) {
      this.nutritionistName = `Dr. ${user.username}`;
    }
    
    // Carica la lingua salvata
    const savedLang = localStorage.getItem('language') || 'en';
    this.currentLang = savedLang;
    this.translate.use(savedLang);
  }

  changeLanguage(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  logout(): void {
    this.authService.logout();
  }
}

