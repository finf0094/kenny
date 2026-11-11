import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnField } from '@kenny/ui/field';
import { KnFileUpload, KnRejectedFile } from '@kenny/ui/file-upload';
import { KnProgress } from '@kenny/ui/progress';

const REASONS = {
  type: 'не тот тип файла',
  size: 'больше 2 МБ',
  count: 'лишний: можно не больше трёх',
};

@Component({
  imports: [KnFileUpload, KnField, KnButton, KnProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Документы к заявке" [error]="problem()">
      <kn-file-upload
        multiple
        accept=".pdf,image/*"
        [maxSize]="2 * 1024 * 1024"
        [maxFiles]="3"
        [(value)]="files"
        (rejected)="explain($event)"
        (valueChange)="problem.set(null)"
      >
        PDF или изображения, до 2 МБ каждый, не больше трёх файлов
      </kn-file-upload>
    </kn-field>

    <div class="send">
      <button kn-button [disabled]="!files().length || sending()" (click)="send()">
        Отправить{{ files().length ? ' (' + files().length + ')' : '' }}
      </button>
      @if (sending()) {
        <kn-progress aria-label="Отправка файлов" [value]="progress()" />
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
      max-inline-size: 30rem;
    }

    .send {
      display: flex;
      align-items: center;
      gap: var(--kn-space-4);
    }

    kn-progress {
      flex: 1;
    }
  `,
})
export default class FileUploadBasicDemo {
  protected readonly files = signal<File[]>([]);
  protected readonly problem = signal<string | null>(null);
  protected readonly sending = signal(false);
  protected readonly progress = signal(0);

  protected explain(rejected: KnRejectedFile[]): void {
    this.problem.set(
      rejected.map(({ file, reason }) => `«${file.name}» — ${REASONS[reason]}`).join('; '),
    );
  }

  /** The component only collects files; sending them is the application's job. */
  protected send(): void {
    this.sending.set(true);
    this.progress.set(0);
    const timer = setInterval(() => {
      this.progress.update((value) => Math.min(100, value + 12));
      if (this.progress() < 100) return;
      clearInterval(timer);
      this.sending.set(false);
      this.files.set([]);
    }, 160);
  }
}
