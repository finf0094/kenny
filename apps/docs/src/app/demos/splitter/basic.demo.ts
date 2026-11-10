import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnSplitter, KnSplitterHandle, KnSplitterPanel } from '@kenny/ui/splitter';

@Component({
  imports: [KnSplitter, KnSplitterPanel, KnSplitterHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-splitter class="frame">
      <kn-splitter-panel [(size)]="nav" [min]="15" [max]="40">
        <div class="pane">
          Навигация<br /><small>{{ nav() }}%</small>
        </div>
      </kn-splitter-panel>
      <kn-splitter-handle aria-label="Ширина навигации" />
      <kn-splitter-panel [min]="30">
        <kn-splitter orientation="vertical" class="inner">
          <kn-splitter-panel [min]="25">
            <div class="pane">Редактор</div>
          </kn-splitter-panel>
          <kn-splitter-handle aria-label="Высота терминала" />
          <kn-splitter-panel [(size)]="terminal" [min]="20" [max]="60">
            <div class="pane">
              Терминал<br /><small>{{ terminal() }}%</small>
            </div>
          </kn-splitter-panel>
        </kn-splitter>
      </kn-splitter-panel>
    </kn-splitter>
    <p>Тяните разделители, двигайте их стрелками или сбросьте двойным щелчком.</p>
  `,
  styles: `
    .frame {
      block-size: 20rem;
      padding: var(--kn-space-2);
      border-radius: var(--kn-radius-lg);
      background: var(--kn-color-surface-subtle);
      box-shadow: var(--kn-elevation-raised);
    }

    .inner {
      block-size: 100%;
    }

    .pane {
      display: grid;
      place-content: center;
      block-size: 100%;
      border-radius: var(--kn-radius-md);
      background: var(--kn-color-surface);
      backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-surface-rim);
      text-align: center;
      font-weight: var(--kn-weight-medium);
    }

    small {
      font-weight: var(--kn-weight-regular);
      color: var(--kn-color-text-muted);
      font-variant-numeric: tabular-nums;
    }

    p {
      margin: var(--kn-space-3) 0 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class SplitterBasicDemo {
  protected readonly nav = signal<number | undefined>(25);
  protected readonly terminal = signal<number | undefined>(35);
}
