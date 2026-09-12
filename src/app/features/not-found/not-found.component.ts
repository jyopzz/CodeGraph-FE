import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <div class="card-glow"></div>
      <div class="content">
        <mat-icon class="warning-icon">sentiment_dissatisfied</mat-icon>
        <h1 class="gradient-text">404</h1>
        <h2>Lost in the void?</h2>
        <p>The page you're searching for vanished into thin air or never existed at all.</p>
        
        <div class="action-buttons">
          <a mat-flat-button class="btn-primary" routerLink="/">
            <mat-icon>home</mat-icon>
            Back to Home
          </a>
          <a mat-stroked-button class="btn-secondary" routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --cyan-accent: #00b4d8;
      --orange-accent: #ff6b35;
      --text-main: #1e293b;
      --text-muted: #64748b;
    }

    .not-found-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      text-align: center;
      padding: 2rem;
      overflow: hidden;
    }

    .card-glow {
      position: absolute;
      width: 320px;
      height: 320px;
      filter: blur(60px);
      z-index: 0;
      pointer-events: none;
    }

    .content {
      position: relative;
      z-index: 1;
      max-width: 460px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .warning-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--orange-accent);
      margin-bottom: 0.5rem;
    }

    .gradient-text {
      font-size: 7rem;
      font-weight: 900;
      line-height: 1;
      margin: 0;
      letter-spacing: -2px;
      background: linear-gradient(135deg, var(--cyan-accent) 25%, var(--orange-accent) 85%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 1rem 0 0.5rem;
    }

    p {
      font-size: 1rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0 0 2rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn-primary {
      background-color: var(--cyan-accent) !important;
      color: #ffffff !important;
      font-weight: 600;
      border-radius: 9999px !important;
      padding: 0.5rem 1.5rem !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 180, 216, 0.3);
    }

    .btn-secondary {
      color: var(--orange-accent) !important;
      border-color: var(--orange-accent) !important;
      font-weight: 600;
      border-radius: 9999px !important;
      padding: 0.5rem 1.5rem !important;
      transition: background-color 0.2s ease;
    }

    .btn-secondary:hover {
      background-color: rgba(255, 107, 53, 0.05) !important;
    }

    mat-icon {
      margin-right: 4px;
      vertical-align: middle;
    }
  `]
})
export class NotFoundComponent {}