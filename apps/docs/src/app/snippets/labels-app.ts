import { ApplicationConfig, LOCALE_ID } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // Подписи компонентов идут за локалью приложения: для ru — русские, иначе английские.
    // Даты и числа берут её же, так что язык задаётся в одном месте.
    { provide: LOCALE_ID, useValue: 'ru' },
  ],
};
