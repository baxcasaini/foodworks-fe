import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Foodworks Dashboard';

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    // Imposta la lingua di default
    const savedLang = localStorage.getItem('language') || 'en';
    this.translate.setDefaultLang('en');
    this.translate.use(savedLang);
  }
}

