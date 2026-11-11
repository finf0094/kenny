import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { knLabelsRu, provideKnLabels } from '@kenny/ui/core';
import { docsIcons } from '../../../docs/src/app/core/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    docsIcons,
    provideKnLabels(knLabelsRu),
    { provide: LOCALE_ID, useValue: 'ru' },
  ],
};
