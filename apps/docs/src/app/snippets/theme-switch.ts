import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

type Theme = 'system' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeSwitcher {
  private readonly root = inject(DOCUMENT).documentElement;
  readonly theme = signal<Theme>('system');

  set(theme: Theme): void {
    this.theme.set(theme);
    if (theme === 'system') this.root.removeAttribute('data-theme');
    else this.root.setAttribute('data-theme', theme);
  }
}
