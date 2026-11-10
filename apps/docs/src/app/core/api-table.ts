import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { KnBadge } from '@kenny/ui/badge';
import { ApiClass, ApiMember } from './doc-types';
import { DocsText } from './text';

const ORDER = ['input', 'model', 'output', 'property', 'method'];
const KIND_LABEL: Record<string, string> = {
  input: 'Входы',
  model: 'Двусторонние привязки',
  output: 'Выходы',
  property: 'Свойства',
  method: 'Методы',
};

/** API of one class, grouped by member kind. Data comes from the sources via tools/gen-docs.mjs. */
@Component({
  selector: 'docs-api-table',
  imports: [KnBadge, DocsText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <h3 [id]="api().name">{{ api().name }}</h3>
      @if (api().selector) {
        <code class="selector">{{ api().selector }}</code>
      }
      <kn-badge>{{ kind() }}</kn-badge>
    </div>
    @if (api().description) {
      <p class="description"><docs-text [text]="api().description" /></p>
    }
    @for (group of groups(); track group.kind) {
      <div
        class="scroll"
        tabindex="0"
        role="region"
        [attr.aria-label]="api().name + ': ' + group.label"
      >
        <table>
          <caption>
            {{
              group.label
            }}
          </caption>
          <thead>
            <tr>
              <th scope="col">Имя</th>
              <th scope="col">Тип</th>
              @if (group.kind === 'input' || group.kind === 'model') {
                <th scope="col">По умолчанию</th>
              }
              <th scope="col">Описание</th>
            </tr>
          </thead>
          <tbody>
            @for (member of group.members; track member.name) {
              <tr>
                <th scope="row">
                  <code>{{ display(member) }}</code>
                  @if (member.required) {
                    <span class="required" title="Обязательный">*</span>
                  }
                </th>
                <td>
                  <span class="type"
                    ><code>{{ member.type }}</code></span
                  >
                </td>
                @if (group.kind === 'input' || group.kind === 'model') {
                  <td>
                    @if (member.default !== undefined) {
                      <code>{{ member.default }}</code>
                    } @else {
                      <span class="none">—</span>
                    }
                  </td>
                }
                <td class="text"><docs-text [text]="member.description" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-3);
    }

    h3 {
      margin: 0;
      font-size: var(--kn-text-lg);
      letter-spacing: var(--kn-tracking-snug);
    }

    .selector {
      color: var(--kn-color-text-muted);
    }

    .description {
      margin: var(--kn-space-2) 0 0;
      color: var(--kn-color-text-muted);
      max-inline-size: 44rem;
    }

    .scroll {
      margin-block-start: var(--kn-space-4);
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

    caption {
      padding: var(--kn-space-3) var(--kn-space-4) var(--kn-space-1);
      text-align: start;
      font-weight: var(--kn-weight-semibold);
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
      white-space: nowrap;
    }

    tbody tr {
      box-shadow: inset 0 1px 0 0 var(--kn-color-border);
    }

    tbody th {
      font-weight: inherit;
      white-space: nowrap;
    }

    code {
      font-size: 0.92em;
    }

    tbody th code {
      color: var(--kn-color-accent-text);
      font-weight: var(--kn-weight-medium);
    }

    /* An inline block gives the column a floor: long unions wrap at spaces, short types never break */
    .type {
      display: inline-block;
      min-inline-size: 6.5rem;
      max-inline-size: 14rem;
    }

    .type code {
      color: var(--kn-color-text-muted);
      overflow-wrap: break-word;
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
    }

    .text {
      min-inline-size: 13rem;
      line-height: var(--kn-leading-normal);
    }

    .required {
      margin-inline-start: 2px;
      color: var(--kn-color-danger);
    }

    .none {
      color: var(--kn-color-text-subtle);
    }
  `,
})
export class DocsApiTable {
  readonly api = input.required<ApiClass>();

  protected readonly kind = computed(
    () =>
      ({ component: 'компонент', directive: 'директива', service: 'сервис', class: 'класс' })[
        this.api().kind
      ] ?? this.api().kind,
  );

  protected readonly groups = computed(() =>
    ORDER.map((kind) => ({
      kind,
      label: KIND_LABEL[kind],
      members: this.api().members.filter((member) => member.kind === kind),
    })).filter((group) => group.members.length > 0),
  );

  protected display(member: ApiMember): string {
    if (member.kind === 'model') return `[(${member.name})]`;
    if (member.kind === 'output') return `(${member.name})`;
    if (member.kind === 'method') return `${member.name}()`;
    return member.name;
  }
}
