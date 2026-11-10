import { inject, Injectable, Injector, TemplateRef, Type } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { KnDialogConfig, KnDialogRef, KnDrawerSide, openSurface } from '@kenny/ui/dialog';

export interface KnDrawerConfig<D = unknown> extends Omit<KnDialogConfig<D>, 'width'> {
  /** Край экрана, от которого выезжает панель. `start`/`end` учитывают RTL. */
  side?: KnDrawerSide;
  /** Ширина (для `start`/`end`) или высота (для `top`/`bottom`). */
  size?: string;
}

/**
 * Открывает выезжающие панели. Это тот же модальный диалог (ловушка фокуса,
 * Escape, возврат фокуса), но прикреплённый к краю экрана.
 */
@Injectable({ providedIn: 'root' })
export class KnDrawer {
  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);

  /** Открывает панель и возвращает ссылку на неё. */
  open<R = unknown, D = unknown>(
    content: Type<unknown> | TemplateRef<unknown>,
    config: KnDrawerConfig<D> = {},
  ): KnDialogRef<R> {
    return openSurface<R, D>(this.dialog, this.injector, content, config, {
      kind: 'drawer',
      side: config.side ?? 'end',
      size: config.size,
    });
  }
}
