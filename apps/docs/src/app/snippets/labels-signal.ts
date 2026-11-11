import { computed, inject, Injectable, signal } from '@angular/core';
import { knLabelsEn, knLabelsRu, provideKnLabels } from '@kenny/ui/core';

@Injectable({ providedIn: 'root' })
export class Language {
  readonly code = signal<'ru' | 'en'>('ru');
  readonly labels = computed(() => (this.code() === 'ru' ? knLabelsRu : knLabelsEn));
}

// Функция выполняется в контексте внедрения и может вернуть сигнал:
// при смене языка компоненты обновят подписи сами, без перезагрузки.
export const labels = provideKnLabels(() => inject(Language).labels);
