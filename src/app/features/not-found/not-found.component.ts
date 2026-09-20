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

      <div class="content">
        <mat-icon class="warning-icon">sentiment_dissatisfied</mat-icon>

        <h1 class="gradient-text">404</h1>

        <h2>Lost in the void?</h2>

        <p>
          The page you're searching for vanished into thin air or never
          existed at all.
        </p>

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
      display: block;
      width: 100%;
      height: 100%;
    }

    .not-found-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      padding: 24px;
      overflow: hidden;
      background: var(--cg-background);
      color: var(--cg-text-primary);
      text-align: center;
    }

    .content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 460px;
    }

    .warning-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      color: var(--cg-accent);
      font-size: 48px;
    }

    .gradient-text {
      margin: 0;
      background: linear-gradient(
        135deg,
        var(--cg-primary) 25%,
        var(--cg-accent) 85%
      );
      background-clip: text;
      color: transparent;
      font-size: 112px;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -2px;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    h2 {
      margin: 16px 0 8px;
      color: var(--cg-text-primary);
      font-size: 28px;
      font-weight: 700;
    }

    p {
      margin: 0 0 32px;
      color: var(--cg-text-secondary);
      font-size: 16px;
      line-height: 1.6;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .btn-primary,
.btn-secondary {
  border-radius: 9999px !important;
  padding: 8px 24px !important;
  font-weight: 600;
}

.btn-primary {
  background: var(--cg-primary) !important;

  .mdc-button__label,
  mat-icon {
    color: #fff !important;
  }

  &:hover {
    background: var(--cg-primary-hover) !important;
  }
}

.btn-secondary {
  border-color: var(--cg-accent) !important;

  .mdc-button__label,
  mat-icon {
    color: var(--cg-accent) !important;
  }

  &:hover {
    background: var(--cg-accent-light) !important;
  }
}

    mat-icon {
      margin-right: 4px;
      vertical-align: middle;
    }

    @media (max-width: 600px) {
      .not-found-container {
        padding: 16px;
      }

      .gradient-text {
        font-size: 80px;
      }

      h2 {
        font-size: 24px;
      }

      .action-buttons {
        flex-direction: column;
        width: 100%;

        a {
          width: 100%;
        }
      }
    }
  `]
})
export class NotFoundComponent {}