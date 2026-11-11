import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideKnCommandPalette } from '@kenny/ui/command-palette';
import { knLabelsRu, provideKnLabels } from '@kenny/ui/core';
import { routes } from './app.routes';
import { docsIcons } from './core/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideClientHydration(withEventReplay()),
    provideKnCommandPalette({ placeholder: 'Поиск по документации' }),
    docsIcons,
    provideKnLabels(knLabelsRu),
    { provide: LOCALE_ID, useValue: 'ru' },
  ],
};
