import { Injectable, inject } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject } from 'rxjs';

export type ThemePreference = 'system' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private overlayContainer = inject(OverlayContainer);
  private readonly THEME_KEY = 'codegraph-theme-preference';
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  // Tracks the active UI state (true = dark, false = light)
  private isDarkSubject = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkSubject.asObservable();

  // Tracks the user's setting selection ('system', 'light', or 'dark')
  private preferenceSubject = new BehaviorSubject<ThemePreference>('system');
  preference$ = this.preferenceSubject.asObservable();

  constructor() {
    this.init();
  }

  private init(): void {
    const saved = (localStorage.getItem(this.THEME_KEY) as ThemePreference) || 'system';
    this.preferenceSubject.next(saved);

    // Initial render
    this.computeAndApply(saved);

    // Listen to OS/browser theme shifts in real-time
    this.mediaQuery.addEventListener('change', (e: MediaQueryListEvent) => {
      if (this.preferenceSubject.value === 'system') {
        this.renderDom(e.matches);
      }
    });
  }

  /** Set explicitly to 'system', 'light', or 'dark' */
  setPreference(preference: ThemePreference): void {
    this.preferenceSubject.next(preference);
    localStorage.setItem(this.THEME_KEY, preference);
    this.computeAndApply(preference);
  }

  /** Quick cycle: system -> light -> dark -> system */
  cycleTheme(): void {
    const map: Record<ThemePreference, ThemePreference> = {
      system: 'dark',
      dark: 'light',
      light: 'system'
    };
    this.setPreference(map[this.preferenceSubject.value]);
  }

  private computeAndApply(preference: ThemePreference): void {
    const shouldBeDark =
      preference === 'system' ? this.mediaQuery.matches : preference === 'dark';
    this.renderDom(shouldBeDark);
  }

  private renderDom(isDark: boolean): void {
    this.isDarkSubject.next(isDark);

    const bodyClasses = document.body.classList;
    const overlayClasses = this.overlayContainer.getContainerElement().classList;

    if (isDark) {
      bodyClasses.add('dark-theme');
      overlayClasses.add('dark-theme');
    } else {
      bodyClasses.remove('dark-theme');
      overlayClasses.remove('dark-theme');
    }
  }
}