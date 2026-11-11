import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnAlert } from '@kenny/ui/alert';

@Component({
  imports: [KnAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-alert tone="accent" heading="Доступна версия 2.4">
      В ней — экспорт отчётов в XLSX и новые фильтры по датам.
    </kn-alert>
    <kn-alert tone="success">Реквизиты сохранены.</kn-alert>
    <kn-alert tone="warning" heading="Пробный период заканчивается через 3 дня">
      После этого проекты останутся доступны только для чтения.
    </kn-alert>
    <kn-alert tone="danger" heading="Оплата не прошла">
      Банк отклонил списание. Проверьте лимит по карте или привяжите другую.
    </kn-alert>
    <kn-alert>Изменения в тарифе вступят в силу со следующего расчётного периода.</kn-alert>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-3);
      max-inline-size: 36rem;
    }
  `,
})
export default class AlertBasicDemo {}
