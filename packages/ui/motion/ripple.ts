import { Directive } from '@angular/core';
import { useRipple } from '@kenny/ui/core';

/**
 * Волна от точки нажатия на вашем собственном элементе — та же, что у кнопок и пунктов
 * меню. Рисуется только там, где токен `--kn-ripple-opacity` больше нуля, поэтому
 * включается стилем, а не кодом.
 */
@Directive({ selector: '[knRipple]' })
export class KnRipple {
  constructor() {
    useRipple();
  }
}
