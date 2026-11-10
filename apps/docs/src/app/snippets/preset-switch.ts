import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

export type StylePreset = 'glass' | 'classic' | 'tonal' | 'crisp';

/** Стиль — это атрибут на <html>. Токены реагируют сами, пересборка не нужна. */
@Injectable({ providedIn: 'root' })
export class StyleService {
  private readonly root = inject(DOCUMENT).documentElement;
  readonly preset = signal<StylePreset>('glass');

  constructor() {
    effect(() => {
      const preset = this.preset();
      if (preset === 'glass') this.root.removeAttribute('data-kn-preset');
      else this.root.setAttribute('data-kn-preset', preset);
    });
  }
}
