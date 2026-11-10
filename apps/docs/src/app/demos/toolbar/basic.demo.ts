import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnIcon } from '@kenny/ui/icon';
import { KnToolbar, KnToolbarSeparator, KnToolbarSpacer } from '@kenny/ui/toolbar';

type Mark = 'bold' | 'italic' | 'underline';

@Component({
  imports: [KnToolbar, KnToolbarSeparator, KnToolbarSpacer, KnButton, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-toolbar aria-label="Форматирование текста">
      @for (mark of marks; track mark.id) {
        <button
          kn-icon-button
          size="sm"
          tone="neutral"
          [variant]="active().has(mark.id) ? 'soft' : 'ghost'"
          [attr.aria-label]="mark.label"
          [attr.aria-pressed]="active().has(mark.id)"
          (click)="toggle(mark.id)"
        >
          <kn-icon [name]="mark.id" />
        </button>
      }
      <kn-toolbar-separator />
      @for (option of aligns; track option.id) {
        <button
          kn-icon-button
          size="sm"
          tone="neutral"
          [variant]="align() === option.id ? 'soft' : 'ghost'"
          [attr.aria-label]="option.label"
          [attr.aria-pressed]="align() === option.id"
          (click)="align.set(option.id)"
        >
          <kn-icon [name]="'align-' + option.id" />
        </button>
      }
      <kn-toolbar-separator />
      <button kn-button size="sm" variant="ghost" tone="neutral"><kn-icon name="link" /> Ссылка</button>
      <kn-toolbar-spacer />
      <button kn-button size="sm">Опубликовать</button>
    </kn-toolbar>

    <p
      [style.font-weight]="active().has('bold') ? 700 : 400"
      [style.font-style]="active().has('italic') ? 'italic' : 'normal'"
      [style.text-decoration]="active().has('underline') ? 'underline' : 'none'"
      [style.text-align]="align()"
    >
      Один Tab — и вы в панели. Дальше стрелки, Home и End.
    </p>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
      max-inline-size: 34rem;
    }

    kn-toolbar {
      display: flex;
    }

    p {
      margin: 0;
    }
  `,
})
export default class ToolbarBasicDemo {
  protected readonly marks: { id: Mark; label: string }[] = [
    { id: 'bold', label: 'Жирный' },
    { id: 'italic', label: 'Курсив' },
    { id: 'underline', label: 'Подчёркнутый' },
  ];
  protected readonly aligns = [
    { id: 'left', label: 'По левому краю' },
    { id: 'center', label: 'По центру' },
    { id: 'right', label: 'По правому краю' },
  ];
  protected readonly active = signal(new Set<Mark>(['bold']));
  protected readonly align = signal('left');

  protected toggle(mark: Mark): void {
    this.active.update((set) => {
      const next = new Set(set);
      if (!next.delete(mark)) next.add(mark);
      return next;
    });
  }
}
