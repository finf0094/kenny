import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal, Type } from '@angular/core';
import { demos } from '../generated/demos';

/**
 * Песочница: каждый демо-файл документации в изоляции, рядом в светлой и тёмной теме.
 * Адрес: `/?demo=button/variants&theme=split|light|dark&dir=rtl`.
 */
@Component({
  selector: 'pg-root',
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Демо">
      <input
        type="search"
        placeholder="Фильтр"
        [value]="filter()"
        (input)="filter.set($any($event.target).value)"
      />
      @for (group of groups(); track group.name) {
        <h2>{{ group.name }}</h2>
        @for (demo of group.items; track demo.id) {
          <a
            [href]="'?demo=' + demo.id"
            [class.active]="demo.id === current()"
            (click)="select($event, demo.id)"
          >
            {{ demo.name }}
          </a>
        }
      }
    </nav>
    <main>
      <header>
        <strong>{{ current() }}</strong>
        <span class="spacer"></span>
        @for (mode of modes; track mode) {
          <button type="button" [class.active]="theme() === mode" (click)="theme.set(mode)">
            {{ mode }}
          </button>
        }
        <button
          type="button"
          [class.active]="dir() === 'rtl'"
          (click)="dir.set(dir() === 'rtl' ? 'ltr' : 'rtl')"
        >
          rtl
        </button>
      </header>
      <div class="stages" [attr.dir]="dir()">
        @for (t of themes(); track t) {
          <section class="stage kn-wallpaper-sm" [attr.data-theme]="t">
            @if (component(); as cmp) {
              <ng-container *ngComponentOutlet="cmp" />
            }
          </section>
        }
      </div>
    </main>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: 15rem 1fr;
      min-block-size: 100dvh;
    }

    nav {
      padding: var(--kn-space-4);
      border-inline-end: 1px solid var(--kn-color-border);
      overflow: auto;
      max-block-size: 100dvh;
      position: sticky;
      inset-block-start: 0;
    }

    nav input {
      inline-size: 100%;
      padding: var(--kn-space-2) var(--kn-space-3);
      border: 1px solid var(--kn-color-border-strong);
      border-radius: var(--kn-radius-sm);
      background: var(--kn-color-surface);
      color: inherit;
      font: inherit;
    }

    nav h2 {
      margin: var(--kn-space-4) 0 var(--kn-space-1);
      font-size: var(--kn-text-xs);
      color: var(--kn-color-text-subtle);
      font-weight: var(--kn-weight-semibold);
    }

    nav a {
      display: block;
      padding: var(--kn-space-1) var(--kn-space-2);
      border-radius: var(--kn-radius-xs);
      color: var(--kn-color-text-muted);
      text-decoration: none;
      font-size: var(--kn-text-sm);
    }

    nav a.active {
      background: var(--kn-color-accent-soft);
      color: var(--kn-color-accent-text);
    }

    header {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      padding: var(--kn-space-3) var(--kn-space-5);
      border-block-end: 1px solid var(--kn-color-border);
    }

    .spacer {
      flex: 1;
    }

    header button {
      padding: var(--kn-space-1) var(--kn-space-3);
      border: 1px solid var(--kn-color-border-strong);
      border-radius: var(--kn-radius-full);
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: var(--kn-text-sm);
      cursor: pointer;
    }

    header button.active {
      background: var(--kn-color-text);
      color: var(--kn-color-canvas);
    }

    .stages {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      min-block-size: calc(100dvh - 3.5rem);
    }

    .stage {
      padding: var(--kn-space-10) var(--kn-space-8);
      color: var(--kn-color-text);
      min-inline-size: 0;
    }
  `,
})
export class App {
  protected readonly modes = ['split', 'light', 'dark'] as const;
  private readonly params = new URLSearchParams(location.search);

  protected readonly filter = signal('');
  protected readonly current = signal(this.params.get('demo') ?? demos[0]?.id ?? '');
  protected readonly theme = signal<(typeof this.modes)[number]>(
    (this.params.get('theme') as 'split' | 'light' | 'dark' | null) ?? 'split',
  );
  protected readonly dir = signal<'ltr' | 'rtl'>(this.params.get('dir') === 'rtl' ? 'rtl' : 'ltr');
  protected readonly component = signal<Type<unknown> | null>(null);

  protected readonly themes = computed(() =>
    this.theme() === 'split' ? ['light', 'dark'] : [this.theme()],
  );

  protected readonly groups = computed(() => {
    const query = this.filter().toLowerCase();
    const map = new Map<string, { id: string; name: string }[]>();
    for (const demo of demos) {
      if (query && !demo.id.includes(query)) continue;
      const [group, name] = demo.id.split('/');
      map.set(group, [...(map.get(group) ?? []), { id: demo.id, name }]);
    }
    return [...map].map(([name, items]) => ({ name, items }));
  });

  constructor() {
    effect(() => {
      const id = this.current();
      this.component.set(null);
      void demos
        .find((d) => d.id === id)
        ?.load()
        .then((cmp) => this.current() === id && this.component.set(cmp));
    });
  }

  protected select(event: Event, id: string): void {
    event.preventDefault();
    this.current.set(id);
    history.replaceState(null, '', `?demo=${id}`);
  }
}
