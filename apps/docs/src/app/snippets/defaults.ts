import { ApplicationConfig } from '@angular/core';
import { provideKnDefaults } from '@kenny/ui/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // Стиль — это не только CSS: одному подходят подчёркнутые вкладки и мягкие кнопки,
    // другому — сегменты и закрашенные. Задайте это один раз, а не в каждом шаблоне.
    provideKnDefaults({
      size: 'sm', // размер всех контролов, у которых он есть
      button: { variant: 'soft' },
      tabs: { variant: 'underline' },
      card: { variant: 'outline' },
    }),
  ],
};
