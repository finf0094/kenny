import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';

interface Heading {
  id: string;
  text: string;
  level: number;
}

/** Collects the headings of the current article and tracks which one is in view. */
@Injectable({ providedIn: 'root' })
export class TocService {
  private readonly document = inject(DOCUMENT);
  private observer: IntersectionObserver | null = null;
  readonly headings = signal<Heading[]>([]);
  readonly active = signal<string>('');
  /** Path of the scanned page: in-page links need it because of `<base href>`. */
  readonly path = signal('');

  /** Re-reads headings from `root`. Call after the article has rendered. */
  scan(root: HTMLElement): void {
    this.observer?.disconnect();
    const elements = Array.from(root.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
    this.headings.set(
      elements.map((el) => ({
        id: el.id,
        text: el.textContent?.trim() ?? '',
        level: el.tagName === 'H2' ? 2 : 3,
      })),
    );
    this.active.set(elements[0]?.id ?? '');
    this.path.set(this.document.location?.pathname ?? '');
    const view = this.document.defaultView;
    if (!view || !('IntersectionObserver' in view)) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) this.active.set(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -65% 0px' },
    );
    elements.forEach((el) => this.observer?.observe(el));
  }

  clear(): void {
    this.observer?.disconnect();
    this.headings.set([]);
  }
}

/** "On this page" list. */
@Component({
  selector: 'docs-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toc.headings().length > 1) {
      <nav aria-label="На этой странице">
        <div class="title">На этой странице</div>
        <ul>
          @for (heading of toc.headings(); track heading.id) {
            <li [attr.data-level]="heading.level">
              <a
                [href]="toc.path() + '#' + heading.id"
                [attr.aria-current]="toc.active() === heading.id ? 'location' : null"
              >
                {{ heading.text }}
              </a>
            </li>
          }
        </ul>
      </nav>
    }
  `,
  styles: `
    /* The list sits on its own pane: the wallpaper behind it is too loud for bare text. */
    nav {
      padding: var(--kn-space-4);
      border-radius: var(--kn-radius-lg);
      background: var(--kn-glass-bg-strong);
      backdrop-filter: var(--kn-glass-filter-strong);
      -webkit-backdrop-filter: var(--kn-glass-filter-strong);
      box-shadow: var(--kn-shadow-glass-sm);
    }

    .title {
      margin-block-end: var(--kn-space-3);
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-semibold);
    }

    ul {
      display: grid;
      gap: 2px;
      margin: 0;
      padding: 0;
      list-style: none;
      border-inline-start: 1px solid var(--kn-color-border-strong);
    }

    li[data-level='3'] a {
      padding-inline-start: var(--kn-space-6);
    }

    a {
      display: block;
      margin-inline-start: -1px;
      padding: var(--kn-space-1) var(--kn-space-3);
      border-inline-start: 2px solid transparent;
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
      line-height: var(--kn-leading-snug);
      text-decoration: none;
    }

    a:hover {
      color: var(--kn-color-text);
    }

    a[aria-current] {
      border-inline-start-color: var(--kn-color-accent);
      color: var(--kn-color-accent-text);
      font-weight: var(--kn-weight-medium);
    }

    a:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
      border-radius: var(--kn-radius-xs);
    }
  `,
})
export class DocsToc {
  protected readonly toc = inject(TocService);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.toc.clear());
  }
}
