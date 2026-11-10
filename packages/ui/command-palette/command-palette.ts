import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  EnvironmentProviders,
  inject,
  Injectable,
  Injector,
  linkedSignal,
  makeEnvironmentProviders,
  provideAppInitializer,
  signal,
  viewChild,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Dialog } from '@angular/cdk/dialog';
import { KnDialogRef, openSurface } from '@kenny/ui/dialog';
import { KnIcon } from '@kenny/ui/icon';

export interface KnCommand {
  /** Уникальный идентификатор. */
  id: string;
  /** Название команды в списке. */
  label: string;
  /** Группа, под заголовком которой показывается команда. */
  group?: string;
  /** Имя иконки. */
  icon?: string;
  /** Дополнительные слова для поиска. */
  keywords?: string[];
  /** Подсказка о горячей клавише, например `['⌘', 'S']`. */
  shortcut?: string[];
  /** Действие. Палитра закрывается перед его выполнением. */
  run: () => void;
}

export interface KnCommandPaletteConfig {
  /** Команды, доступные с самого старта приложения. */
  commands?: KnCommand[];
  /** Открывать палитру по Ctrl+K / ⌘K. По умолчанию `true`. */
  hotkey?: boolean;
  /** Подсказка в поле поиска. */
  placeholder?: string;
}

/**
 * Командная палитра: поиск по действиям и разделам с клавиатуры.
 * Команды регистрируются откуда угодно и снимаются функцией, которую возвращает `register`.
 */
@Injectable({ providedIn: 'root' })
export class KnCommandPalette {
  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private ref: KnDialogRef | null = null;
  private hotkeyBound = false;

  /** Все зарегистрированные команды. */
  readonly commands = signal<KnCommand[]>([]);
  /** Подсказка в поле поиска. */
  readonly placeholder = signal('Поиск команд и разделов');

  /** Добавляет команды. Возвращает функцию, которая их убирает. */
  register(commands: KnCommand[]): () => void {
    const ids = new Set(commands.map((command) => command.id));
    this.commands.update((all) => [...all.filter((c) => !ids.has(c.id)), ...commands]);
    return () => this.commands.update((all) => all.filter((command) => !commands.includes(command)));
  }

  /** Открывает палитру. */
  open(): void {
    if (this.ref) return;
    this.ref = openSurface(
      this.dialog,
      this.injector,
      KnCommandPaletteView,
      { ariaLabel: 'Командная палитра', autoFocus: 'input' },
      { kind: 'dialog', size: '38rem', top: 'min(18vh, 10rem)' },
    );
    this.ref.closed.subscribe(() => (this.ref = null));
  }

  /** Закрывает палитру. */
  close(): void {
    void this.ref?.close();
  }

  /** Открывает или закрывает палитру. */
  toggle(): void {
    if (this.ref) this.close();
    else this.open();
  }

  /** Включает Ctrl+K / ⌘K для всего документа. Повторные вызовы безопасны. */
  bindHotkey(): void {
    if (this.hotkeyBound || !this.document.defaultView) return;
    this.hotkeyBound = true;
    this.document.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        this.toggle();
      }
    });
  }
}

/** Регистрирует команды и горячую клавишу при старте приложения. */
export function provideKnCommandPalette(config: KnCommandPaletteConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const palette = inject(KnCommandPalette);
      if (config.commands) palette.register(config.commands);
      if (config.placeholder) palette.placeholder.set(config.placeholder);
      if (config.hotkey !== false) palette.bindHotkey();
    }),
  ]);
}

interface Group {
  id: string;
  label: string;
  commands: KnCommand[];
}

/** @internal Combobox + grouped listbox, per the APG combobox pattern. */
@Component({
  selector: 'kn-command-palette-view',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search">
      <kn-icon name="search" />
      <input
        #input
        class="input"
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-autocomplete="list"
        autocomplete="off"
        spellcheck="false"
        [attr.aria-label]="palette.placeholder()"
        [attr.aria-controls]="listId"
        [attr.aria-activedescendant]="activeId()"
        [placeholder]="palette.placeholder()"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
        (keydown)="onKeydown($event)"
      />
      <kbd>Esc</kbd>
    </div>
    <div #list class="list" role="listbox" aria-label="Команды" [id]="listId" [attr.data-fresh]="query() ? null : ''">
      @for (group of groups(); track group.id) {
        <div class="group" role="group" [attr.aria-labelledby]="group.label ? listId + group.id : null">
          @if (group.label) {
            <div class="group-label" [id]="listId + group.id">{{ group.label }}</div>
          }
          @for (command of group.commands; track command.id) {
            <div
              class="option"
              role="option"
              [id]="optionId(command)"
              [attr.aria-selected]="command === active()"
              [style.--kn-index]="flat().indexOf(command)"
              (click)="run(command)"
              (pointermove)="active.set(command)"
            >
              @if (command.icon) {
                <kn-icon class="option-icon" [name]="command.icon" />
              }
              <span class="option-label">{{ command.label }}</span>
              @if (command.shortcut) {
                <span class="shortcut" aria-hidden="true">
                  @for (key of command.shortcut; track $index) {
                    <kbd>{{ key }}</kbd>
                  }
                </span>
              }
            </div>
          }
        </div>
      } @empty {
        <div class="empty" role="presentation">Ничего не нашлось по запросу «{{ query() }}»</div>
      }
    </div>
    <div class="footer" aria-hidden="true">
      <span><kbd>↑</kbd><kbd>↓</kbd> выбрать</span>
      <span><kbd>↵</kbd> выполнить</span>
      <span class="count">{{ flat().length }}</span>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-block-size: 0;
      max-block-size: min(30rem, calc(100dvh - 12rem));
    }

    .search {
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
      padding: var(--kn-space-4) var(--kn-space-5);
      box-shadow: inset 0 -1px 0 0 var(--kn-color-border);
      color: var(--kn-color-text-subtle);
    }

    .input {
      flex: 1;
      min-inline-size: 0;
      padding: 0;
      border: 0;
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      font-size: var(--kn-text-lg);
      outline: none;
    }

    .input::placeholder {
      color: var(--kn-color-text-subtle);
      opacity: 1;
    }

    kbd {
      display: inline-grid;
      place-items: center;
      min-inline-size: 1.375rem;
      block-size: 1.375rem;
      box-sizing: border-box;
      padding: 0 var(--kn-space-1);
      border-radius: var(--kn-radius-xs);
      background: var(--kn-color-surface-sunken);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
      color: var(--kn-color-text-muted);
      font-family: var(--kn-font-sans);
      font-size: var(--kn-text-xs);
      font-weight: var(--kn-weight-medium);
    }

    .list {
      flex: 1;
      min-block-size: 0;
      padding: var(--kn-space-2);
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    .group + .group {
      margin-block-start: var(--kn-space-2);
    }

    .group-label {
      padding: var(--kn-space-1-5) var(--kn-space-3);
      font-size: var(--kn-text-xs);
      font-weight: var(--kn-weight-semibold);
      color: var(--kn-color-text-subtle);
    }

    .option {
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
      min-block-size: 2.5rem;
      padding: 0 var(--kn-space-3);
      border-radius: var(--kn-radius-sm);
      cursor: pointer;
      scroll-margin: var(--kn-space-2);
    }

    /* Items arrive one after another when the palette opens, not on every keystroke */
    .list[data-fresh] .option {
      animation: kn-stagger-in var(--kn-duration-normal) var(--kn-ease-out) backwards;
      animation-delay: calc(min(var(--kn-index, 0), 10) * var(--kn-stagger));
    }

    .option[aria-selected='true'] {
      background: var(--kn-color-accent);
      color: var(--kn-color-on-accent);
    }

    .option-icon {
      --kn-icon-size: 1.125rem;
      opacity: 0.75;
    }

    .option-label {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .shortcut {
      display: inline-flex;
      gap: var(--kn-space-1);
    }

    .option[aria-selected='true'] kbd {
      background: rgb(255 255 255 / 0.18);
      box-shadow: none;
      color: inherit;
    }

    .empty {
      padding: var(--kn-space-8) var(--kn-space-4);
      text-align: center;
      color: var(--kn-color-text-muted);
    }

    .footer {
      display: flex;
      align-items: center;
      gap: var(--kn-space-4);
      padding: var(--kn-space-2) var(--kn-space-5);
      box-shadow: inset 0 1px 0 0 var(--kn-color-border);
      font-size: var(--kn-text-xs);
      color: var(--kn-color-text-subtle);
    }

    .footer span {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-1);
    }

    .count {
      margin-inline-start: auto;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class KnCommandPaletteView {
  protected readonly palette = inject(KnCommandPalette);
  private readonly ref = inject(KnDialogRef);
  private readonly injector = inject(Injector);
  protected readonly listId = inject(_IdGenerator).getId('kn-command-list-');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');

  protected readonly query = signal('');

  /** Matches every word of the query; commands whose label starts with the query come first. */
  protected readonly flat = computed(() => {
    const words = this.query().toLowerCase().split(/\s+/).filter(Boolean);
    const commands = this.palette.commands();
    if (words.length === 0) return this.grouped(commands);
    const scored = commands
      .map((command) => {
        const label = command.label.toLowerCase();
        const haystack = [label, command.group ?? '', ...(command.keywords ?? [])].join(' ').toLowerCase();
        if (!words.every((word) => haystack.includes(word))) return null;
        return { command, score: label.startsWith(words[0]) ? 0 : label.includes(words[0]) ? 1 : 2 };
      })
      .filter((entry) => entry !== null)
      .sort((a, b) => a.score - b.score);
    return this.grouped(scored.map((entry) => entry.command));
  });

  protected readonly groups = computed(() => {
    const groups: Group[] = [];
    for (const command of this.flat()) {
      const label = command.group ?? '';
      let group = groups.find((g) => g.label === label);
      if (!group) {
        group = { id: `-g${groups.length}`, label, commands: [] };
        groups.push(group);
      }
      group.commands.push(command);
    }
    return groups;
  });

  /** Highlighted command; resets to the first result whenever the results change. */
  protected readonly active = linkedSignal<KnCommand | undefined>(() => this.flat()[0]);
  protected readonly activeId = computed(() => {
    const active = this.active();
    return active ? this.optionId(active) : null;
  });

  protected optionId(command: KnCommand): string {
    return `${this.listId}-${this.palette.commands().indexOf(command)}`;
  }

  protected run(command: KnCommand): void {
    void this.ref.close().then(() => command.run());
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.flat();
    const index = items.indexOf(this.active() as KnCommand);
    let next: KnCommand | undefined;
    switch (event.key) {
      case 'ArrowDown':
        next = items[(index + 1) % items.length];
        break;
      case 'ArrowUp':
        next = items[(index - 1 + items.length) % items.length];
        break;
      case 'Enter': {
        const active = this.active();
        if (active) {
          event.preventDefault();
          this.run(active);
        }
        return;
      }
    }
    if (!next) return;
    event.preventDefault();
    this.active.set(next);
    afterNextRender(
      () =>
        this.list()
          .nativeElement.querySelector('[aria-selected="true"]')
          ?.scrollIntoView?.({ block: 'nearest' }),
      { injector: this.injector },
    );
  }

  /** Keeps commands of the same group together, preserving first-appearance order. */
  private grouped(commands: KnCommand[]): KnCommand[] {
    const order = [...new Set(commands.map((command) => command.group ?? ''))];
    return order.flatMap((group) => commands.filter((command) => (command.group ?? '') === group));
  }
}
