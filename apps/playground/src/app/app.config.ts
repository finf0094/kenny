import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { docsIcons } from '../../../docs/src/app/core/icons';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), docsIcons, { provide: LOCALE_ID, useValue: 'ru' }],
};
