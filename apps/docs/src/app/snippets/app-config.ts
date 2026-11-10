import { ApplicationConfig } from '@angular/core';
import { provideKnCommandPalette } from '@kenny/ui/command-palette';
import { knIconMoon, knIconSun, provideKnIcons } from '@kenny/ui/icon';
import { provideKnToaster } from '@kenny/ui/toast';

export const appConfig: ApplicationConfig = {
  providers: [
    // Иконки, которые используют сами компоненты, уже зарегистрированы.
    // Остальные подключаются поимённо — в сборку попадает только то, что импортировано.
    provideKnIcons({ sun: knIconSun, moon: knIconMoon }),

    // Необязательно: положение уведомлений и горячая клавиша палитры.
    provideKnToaster({ position: 'bottom-end' }),
    provideKnCommandPalette(),
  ],
};
