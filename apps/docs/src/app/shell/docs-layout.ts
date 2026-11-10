import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  viewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KnSidebar } from '@kenny/ui/sidebar';
import { DocsToc, TocService } from '../core/toc';
import { DocsNav } from './docs-nav';

/** Three columns: navigation, article on a glass sheet, table of contents. */
@Component({
  selector: 'docs-layout',
  imports: [RouterOutlet, KnSidebar, DocsNav, DocsToc],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-sidebar class="sidebar" aria-label="Документация"><docs-nav /></kn-sidebar>
    <main #content class="content" id="content">
      <router-outlet (activate)="rescan()" />
    </main>
    <docs-toc class="toc" />
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: 15rem minmax(0, 1fr) 14rem;
      align-items: start;
      gap: var(--kn-space-6);
      max-inline-size: 90rem;
      margin-inline: auto;
      padding: var(--kn-space-4) var(--kn-space-6) var(--kn-space-16);
    }

    .sidebar,
    .toc {
      position: sticky;
      inset-block-start: 5.5rem;
      max-block-size: calc(100dvh - 7rem);
    }

    .sidebar {
      --kn-sidebar-width: 100%;
    }

    .toc {
      overflow-y: auto;
      border-radius: var(--kn-radius-lg);
    }

    .content {
      min-inline-size: 0;
      padding: clamp(var(--kn-space-5), 4vw, var(--kn-space-12));
      border-radius: var(--kn-radius-xl);
      background: var(--kn-color-surface-raised);
      backdrop-filter: var(--kn-surface-filter-raised);
      -webkit-backdrop-filter: var(--kn-surface-filter-raised);
      box-shadow: var(--kn-elevation-card);
    }

    @media (max-width: 78rem) {
      :host {
        grid-template-columns: 15rem minmax(0, 1fr);
      }

      .toc {
        display: none;
      }
    }

    @media (max-width: 56rem) {
      :host {
        grid-template-columns: minmax(0, 1fr);
        padding-inline: var(--kn-space-3);
      }

      .sidebar {
        display: none;
      }
    }
  `,
})
export class DocsLayout {
  private readonly toc = inject(TocService);
  private readonly injector = inject(Injector);
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  protected rescan(): void {
    afterNextRender(() => this.toc.scan(this.content().nativeElement), { injector: this.injector });
  }
}
