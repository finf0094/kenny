import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DocsApiTable } from './api-table';
import { DocsCode } from './code-block';
import { DocsDemo } from './demo-block';
import { ComponentDoc } from './doc-types';
import { DocsText } from './text';

/** Renders any component page from its `ComponentDoc`. */
@Component({
  selector: 'docs-component-page',
  imports: [NgComponentOutlet, DocsDemo, DocsCode, DocsApiTable, DocsText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose">
      <h1>{{ doc().title }}</h1>
      <p class="lead"><docs-text [text]="doc().description" /></p>
      <docs-code [code]="importLine()" label="Импорт" />

      <h2 id="examples">Примеры</h2>
      @for (demo of doc().demos; track demo.source) {
        <section class="demo">
          <h3 [id]="'demo-' + demo.source">{{ demo.title }}</h3>
          @if (demo.description) {
            <p><docs-text [text]="demo.description" /></p>
          }
          <docs-demo [demo]="demo" [source]="doc().sources[demo.source]" />
        </section>
      }

      @if (doc().playground; as playground) {
        <h2 id="playground">Playground</h2>
        <p>Меняйте входы справа — пример и код под ним обновляются сразу.</p>
        <ng-container *ngComponentOutlet="playground" />
      }

      <h2 id="api">API</h2>
      @for (cls of classes(); track cls.name) {
        <docs-api-table class="api" [api]="cls" />
      }

      @if (doc().slots; as slots) {
        <h3 id="slots">Слоты</h3>
        <div class="scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Слот</th>
                <th scope="col">Назначение</th>
              </tr>
            </thead>
            <tbody>
              @for (slot of slots; track slot.name) {
                <tr>
                  <th scope="row">
                    <code>{{ slot.name }}</code>
                  </th>
                  <td><docs-text [text]="slot.description" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (cssVars().length) {
        <h3 id="css-variables">CSS-переменные</h3>
        <p>
          Задайте переменную на компоненте или любом его предке. Значение по умолчанию — справа.
        </p>
        <div class="scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Переменная</th>
                <th scope="col">По умолчанию</th>
              </tr>
            </thead>
            <tbody>
              @for (variable of cssVars(); track variable.name) {
                <tr>
                  <th scope="row">
                    <code>{{ variable.name }}</code>
                  </th>
                  <td>
                    <code class="muted">{{ variable.fallback }}</code>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <h2 id="accessibility">Клавиатура и доступность</h2>
      @if (doc().keyboard; as keyboard) {
        <div class="scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Клавиши</th>
                <th scope="col">Действие</th>
              </tr>
            </thead>
            <tbody>
              @for (row of keyboard; track $index) {
                <tr>
                  <th scope="row" class="keys">
                    @for (key of row.keys; track key) {
                      <kbd>{{ key }}</kbd>
                    }
                  </th>
                  <td><docs-text [text]="row.action" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      @if (doc().a11y; as notes) {
        <ul>
          @for (note of notes; track $index) {
            <li><docs-text [text]="note" /></li>
          }
        </ul>
      }
    </article>
  `,
  styles: `
    .demo + .demo {
      margin-block-start: var(--kn-space-8);
    }

    .demo h3 {
      margin-block-start: 0;
    }

    .demo docs-demo {
      margin-block-start: var(--kn-space-3);
    }

    .api + .api {
      margin-block-start: var(--kn-space-10);
    }

    .scroll {
      overflow-x: auto;
      border-radius: var(--kn-radius-md);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
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
      vertical-align: top;
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

    .keys {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-1);
    }

    .muted {
      color: var(--kn-color-text-muted);
    }
  `,
})
export class ComponentPage {
  readonly doc = input.required<ComponentDoc>();

  protected readonly classes = computed(() => {
    const only = this.doc().apiClasses;
    const all = this.doc().api.classes;
    return only ? only.flatMap((name) => all.filter((cls) => cls.name === name)) : all;
  });

  protected readonly cssVars = computed(() => {
    const prefix = this.doc().cssPrefix;
    const vars = this.doc().api.cssVars;
    return prefix ? vars.filter((v) => v.name.startsWith(prefix)) : vars;
  });

  protected readonly importLine = computed(() => {
    const names = (this.doc().imports ?? this.classes().map((cls) => cls.name)).join(', ');
    return `import { ${names} } from '@kenny/ui/${this.doc().entry}';`;
  });
}
