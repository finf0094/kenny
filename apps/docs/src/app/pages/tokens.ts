import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnIcon } from '@kenny/ui/icon';
import { KnInput, KnInputGroup } from '@kenny/ui/input';
import { tokens } from '../../generated/tokens';
import { TokenDoc } from '../core/doc-types';

const GROUPS: { id: string; title: string; text: string }[] = [
  {
    id: 'color',
    title: 'Цвет',
    text: 'Палитры (accent, ink) — сырьё; семантические токены (--kn-color-*, --kn-glass-*) — то, что читают компоненты. Переопределяйте палитру, чтобы перекрасить всё, или отдельный семантический токен, чтобы изменить одну роль.',
  },
  {
    id: 'typography',
    title: 'Типографика',
    text: 'Шкала построена от основного текста 15 px. Заголовки используют тесный трекинг, цифры в таблицах — tabular-nums.',
  },
  {
    id: 'layout',
    title: 'Отступы, размеры, радиусы',
    text: 'Сетка 4 px. Три высоты контролов общие для кнопок, полей и вкладок. Радиусы концентрические: вложенный меньше внешнего на величину отступа.',
  },
  {
    id: 'elevation',
    title: 'Тени и стекло',
    text: 'Тени тонированы кобальтом. Тени со словом glass включают блик и контур стеклянной кромки.',
  },
  {
    id: 'motion',
    title: 'Движение',
    text: 'Длительности и кривые. При prefers-reduced-motion все длительности обнуляются в одном месте.',
  },
];

type Preview = 'color' | 'space' | 'radius' | 'shadow' | 'text' | 'none';

@Component({
  imports: [KnInput, KnInputGroup, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose">
      <h1>Токены</h1>
      <p class="lead">
        Все {{ total }} токенов пакета <code>&#64;kenny/tokens</code>. Таблицы собраны из исходных CSS-файлов,
        образцы показывают значение в текущей теме.
      </p>
      <kn-input-group class="search">
        <kn-icon knPrefix name="search" />
        <input knInput type="search" aria-label="Фильтр токенов" placeholder="Фильтр: glass, radius, duration…" (input)="query.set($any($event.target).value)" />
      </kn-input-group>

      @for (group of groups(); track group.id) {
        <h2 [id]="group.id">{{ group.title }}</h2>
        <p>{{ group.text }}</p>
        <div class="scroll" tabindex="0" role="region" [attr.aria-label]="'Токены: ' + group.title">
          <table>
            <thead>
              <tr>
                <th scope="col" class="preview-col"><span class="sr">Образец</span></th>
                <th scope="col">Токен</th>
                <th scope="col">Значение</th>
              </tr>
            </thead>
            <tbody>
              @for (token of group.tokens; track token.name) {
                <tr>
                  <td>
                    @switch (preview(token)) {
                      @case ('color') {
                        <span class="chip color" [style.background]="'var(' + token.name + ')'"></span>
                      }
                      @case ('space') {
                        <span class="chip space" [style.inline-size]="'var(' + token.name + ')'"></span>
                      }
                      @case ('radius') {
                        <span class="chip radius" [style.border-radius]="'var(' + token.name + ')'"></span>
                      }
                      @case ('shadow') {
                        <span class="chip shadow" [style.box-shadow]="'var(' + token.name + ')'"></span>
                      }
                      @case ('text') {
                        <span class="chip text" [style.font-size]="'var(' + token.name + ')'">Аа</span>
                      }
                    }
                  </td>
                  <th scope="row">
                    <code>{{ token.name }}</code>
                    @if (token.comment) {
                      <span class="comment">{{ token.comment }}</span>
                    }
                  </th>
                  <td><code class="value">{{ token.value }}</code></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @empty {
        <p>Ни один токен не содержит «{{ query() }}».</p>
      }
    </article>
  `,
  styles: `
    .search {
      max-inline-size: 26rem;
      margin-block-start: var(--kn-space-6);
    }

    .scroll {
      overflow-x: auto;
      border-radius: var(--kn-radius-md);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
    }

    .scroll:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: 2px;
    }

    table {
      inline-size: 100%;
      border-collapse: collapse;
      font-size: var(--kn-text-sm);
    }

    th,
    td {
      padding: var(--kn-space-2) var(--kn-space-4);
      text-align: start;
      vertical-align: middle;
    }

    thead th {
      font-weight: var(--kn-weight-medium);
      color: var(--kn-color-text-subtle);
    }

    tbody tr {
      box-shadow: inset 0 1px 0 0 var(--kn-color-border);
    }

    tbody th {
      font-weight: inherit;
      white-space: nowrap;
    }

    tbody th code {
      color: var(--kn-color-accent-text);
    }

    .preview-col {
      position: relative;
      inline-size: 4.5rem;
    }

    .comment {
      margin-inline-start: var(--kn-space-2);
      color: var(--kn-color-text-subtle);
    }

    .value {
      color: var(--kn-color-text-muted);
      overflow-wrap: anywhere;
    }

    .chip {
      display: block;
    }

    .color {
      inline-size: 2.5rem;
      block-size: 1.5rem;
      border-radius: var(--kn-radius-xs);
      box-shadow: inset 0 0 0 1px var(--kn-color-border-strong);
    }

    .space {
      block-size: 0.75rem;
      max-inline-size: 4rem;
      border-radius: 2px;
      background: var(--kn-color-accent);
    }

    .radius {
      inline-size: 2.5rem;
      block-size: 2.5rem;
      background: var(--kn-color-accent-soft);
      box-shadow: inset 0 0 0 1.5px var(--kn-color-accent);
    }

    .shadow {
      inline-size: 2.5rem;
      block-size: 1.75rem;
      margin-block: var(--kn-space-2);
      border-radius: var(--kn-radius-xs);
      background: var(--kn-color-surface-raised);
    }

    .text {
      line-height: 1;
      max-block-size: 2.25rem;
      overflow: hidden;
    }

    .sr {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
  `,
})
export default class TokensPage {
  protected readonly total = tokens.length;
  protected readonly query = signal('');

  protected readonly groups = computed(() => {
    const query = this.query().trim().toLowerCase();
    return GROUPS.map((group) => ({
      ...group,
      tokens: tokens.filter(
        (token) => token.group === group.id && (!query || token.name.includes(query) || token.value.toLowerCase().includes(query)),
      ),
    })).filter((group) => group.tokens.length > 0);
  });

  protected preview(token: TokenDoc): Preview {
    const name = token.name;
    if (/^--kn-(accent|ink|color)-/.test(name) || /^--kn-glass-(bg|border|edge|specular)/.test(name) || name.startsWith('--kn-shadow-color')) return 'color';
    if (/^--kn-(space|size)-/.test(name)) return 'space';
    if (name.startsWith('--kn-radius-')) return 'radius';
    if (name.startsWith('--kn-shadow-') || name === '--kn-glass-rim') return 'shadow';
    if (name.startsWith('--kn-text-')) return 'text';
    return 'none';
  }
}
