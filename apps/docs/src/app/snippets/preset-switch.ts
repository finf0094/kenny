import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

export type StylePreset = 'default' | 'glass' | 'tonal' | 'crisp' | 'soft';

/** Стиль — это атрибут на <html>. Токены реагируют сами, пересборка не нужна. */
@Injectable({ providedIn: 'root' })
export class StyleService {
  private readonly root = inject(DOCUMENT).documentElement;
  readonly preset = signal<StylePreset>('default');

  constructor() {
    effect(() => {
      const preset = this.preset();
      if (preset === 'default') this.root.removeAttribute('data-kn-preset');
      else this.root.setAttribute('data-kn-preset', preset);
    });
  }
}
