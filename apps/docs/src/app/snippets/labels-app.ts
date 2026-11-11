import { ApplicationConfig } from '@angular/core';
import { knLabelsRu, provideKnLabels } from '@kenny/ui/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // Готовый набор: все встроенные тексты становятся русскими
    provideKnLabels(knLabelsRu),
  ],
};
