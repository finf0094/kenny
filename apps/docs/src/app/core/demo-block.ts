import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { KnTab, KnTabs } from '@kenny/ui/tabs';
import { DocsCode } from './code-block';
import { DemoDoc, DemoSource } from './doc-types';

/** A live demo on a wallpaper stage with a tab that shows the very file being rendered. */
@Component({
  selector: 'docs-demo',
  imports: [NgComponentOutlet, KnTabs, KnTab, DocsCode],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-tabs size="sm" [aria-label]="demo().title" [(value)]="tab">
      <kn-tab value="demo" label="Демо" icon="eye">
        <div class="stage kn-wallpaper-sm">
          <ng-container *ngComponentOutlet="demo().component" />
        </div>
      </kn-tab>
      <kn-tab value="code" label="Код" icon="code">
        @if (source(); as src) {
          <div class="file">{{ src.file }}</div>
          <docs-code [source]="src" [label]="'Код примера: ' + demo().title" />
        }
      </kn-tab>
    </kn-tabs>
  `,
  styles: `
    :host {
      display: block;
      --kn-tabs-gap: var(--kn-space-3);
    }

    .stage {
      padding: clamp(var(--kn-space-5), 4vw, var(--kn-space-10));
      border-radius: var(--kn-radius-lg);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
      overflow-x: auto;
    }

    .file {
      margin-block-end: var(--kn-space-2);
      font-family: var(--kn-font-mono);
      font-size: var(--kn-text-xs);
      color: var(--kn-color-text-subtle);
    }
  `,
})
export class DocsDemo {
  readonly demo = input.required<DemoDoc>();
  readonly source = input<DemoSource | undefined>(undefined);
  protected readonly tab = signal<string | undefined>('demo');
}
