import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnToaster } from '@kenny/ui/toast';

@Component({
  imports: [KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button kn-button variant="glass" tone="neutral" (click)="saved()">Сохранить</button>
    <button kn-button variant="glass" tone="neutral" (click)="archived()">В архив с отменой</button>
    <button kn-button variant="glass" tone="neutral" (click)="warn()">Предупреждение</button>
    <button kn-button variant="glass" tone="danger" (click)="failed()">Ошибка</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-3);
    }
  `,
})
export default class ToastBasicDemo {
  private readonly toaster = inject(KnToaster);

  protected saved(): void {
    this.toaster.success('Изменения сохранены');
  }

  protected archived(): void {
    this.toaster.show({
      title: 'Письмо перемещено в архив',
      action: {
        label: 'Отменить',
        run: () => this.toaster.show({ title: 'Письмо возвращено во входящие' }),
      },
    });
  }

  protected warn(): void {
    this.toaster.show({
      tone: 'warning',
      title: 'Хранилище почти заполнено',
      description: 'Занято 9,2 из 10 ГБ. Удалите ненужные файлы или смените тариф.',
      duration: 8000,
    });
  }

  protected failed(): void {
    this.toaster.error('Не удалось отправить письмо', 'Проверьте соединение и попробуйте ещё раз.');
  }
}
