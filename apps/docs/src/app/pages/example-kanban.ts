import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { KnAvatar } from '@kenny/ui/avatar';
import { KnBadge } from '@kenny/ui/badge';
import { KnBreadcrumb, KnBreadcrumbs } from '@kenny/ui/breadcrumbs';
import { KnButton } from '@kenny/ui/button';
import { KnCombobox } from '@kenny/ui/combobox';
import { KnDatePicker } from '@kenny/ui/date-picker';
import {
  KnDialog,
  KnDialogBody,
  KnDialogFooter,
  KnDialogHeader,
  KnDialogRef,
} from '@kenny/ui/dialog';
import { KnDrawer, KnDrawerBody, KnDrawerHeader } from '@kenny/ui/drawer';
import { KnEmptyState } from '@kenny/ui/empty-state';
import { KnField } from '@kenny/ui/field';
import { KnIcon } from '@kenny/ui/icon';
import { KnInput } from '@kenny/ui/input';
import {
  KnContextMenuTrigger,
  KnMenu,
  KnMenuGroup,
  KnMenuItem,
  KnMenuItemRadio,
  KnMenuSeparator,
  KnMenuTrigger,
} from '@kenny/ui/menu';
import { KnRadio, KnRadioGroup } from '@kenny/ui/radio';
import { KnOption, KnSelect } from '@kenny/ui/select';
import { KnSplitter, KnSplitterHandle, KnSplitterPanel } from '@kenny/ui/splitter';
import { KnTextarea } from '@kenny/ui/textarea';
import { KnToaster } from '@kenny/ui/toast';
import { map } from 'rxjs';

type ColumnId = 'todo' | 'doing' | 'review' | 'done';
type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: number;
  title: string;
  column: ColumnId;
  assignee: string | null;
  priority: Priority;
  due: Date | null;
  notes: string;
}

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'К выполнению' },
  { id: 'doing', title: 'В работе' },
  { id: 'review', title: 'На ревью' },
  { id: 'done', title: 'Готово' },
];

const PEOPLE = ['Анна Орлова', 'Борис Ким', 'Вера Соколова', 'Глеб Назаров', 'Дина Ахметова'];
const PRIORITY: Record<Priority, { label: string; tone: 'neutral' | 'warning' | 'danger' }> = {
  low: { label: 'Низкий', tone: 'neutral' },
  medium: { label: 'Средний', tone: 'warning' },
  high: { label: 'Высокий', tone: 'danger' },
};

const TASKS: Task[] = [
  {
    id: 1,
    title: 'Собрать палитру тёмной темы',
    column: 'done',
    assignee: 'Зоя Мельникова',
    priority: 'medium',
    due: new Date(2026, 10, 4),
    notes: 'Кобальтовая ночь вместо чёрного.',
  },
  {
    id: 2,
    title: 'Пружина для индикатора вкладок',
    column: 'review',
    assignee: 'Борис Ким',
    priority: 'high',
    due: new Date(2026, 10, 11),
    notes: 'FLIP через WAAPI, только transform.',
  },
  {
    id: 3,
    title: 'Клавиатура для сплиттера',
    column: 'doing',
    assignee: 'Анна Орлова',
    priority: 'high',
    due: new Date(2026, 10, 13),
    notes: 'Стрелки, Home/End, шаг ×5 с Shift.',
  },
  {
    id: 4,
    title: 'Проверить контраст бейджей',
    column: 'doing',
    assignee: 'Вера Соколова',
    priority: 'medium',
    due: new Date(2026, 10, 14),
    notes: '',
  },
  {
    id: 5,
    title: 'Описать токены движения',
    column: 'todo',
    assignee: null,
    priority: 'low',
    due: null,
    notes: '',
  },
  {
    id: 6,
    title: 'RTL для календаря',
    column: 'todo',
    assignee: 'Глеб Назаров',
    priority: 'medium',
    due: new Date(2026, 10, 20),
    notes: 'Стрелки и анимация смены месяца.',
  },
  {
    id: 7,
    title: 'Каскад строк в таблице',
    column: 'todo',
    assignee: 'Дина Ахметова',
    priority: 'low',
    due: new Date(2026, 10, 24),
    notes: '',
  },
];

@Component({
  imports: [
    NgTemplateOutlet,
    RouterLink,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    KnBreadcrumbs,
    KnBreadcrumb,
    KnButton,
    KnIcon,
    KnAvatar,
    KnBadge,
    KnSplitter,
    KnSplitterPanel,
    KnSplitterHandle,
    KnField,
    KnInput,
    KnTextarea,
    KnSelect,
    KnOption,
    KnCombobox,
    KnDatePicker,
    KnRadioGroup,
    KnRadio,
    KnMenu,
    KnMenuItem,
    KnMenuItemRadio,
    KnMenuGroup,
    KnMenuSeparator,
    KnMenuTrigger,
    KnContextMenuTrigger,
    KnEmptyState,
    KnDialogHeader,
    KnDialogBody,
    KnDialogFooter,
    KnDrawerHeader,
    KnDrawerBody,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The drag preview is moved to <body> by the CDK, so its styles cannot be scoped to the component.
  encapsulation: ViewEncapsulation.None,
  template: `
    <main id="content" class="kb">
      <header class="kb-head">
        <div>
          <kn-breadcrumbs>
            <kn-breadcrumb><a routerLink="/examples">Примеры</a></kn-breadcrumb>
            <kn-breadcrumb current>Канбан</kn-breadcrumb>
          </kn-breadcrumbs>
          <h1>Релиз 0.1</h1>
        </div>
        <button kn-button (click)="openCreate()"><kn-icon name="plus" /> Новая задача</button>
      </header>

      @if (compact()) {
        <!-- One column: the board takes the screen, the task opens in a bottom sheet -->
        <div class="kb-frame"><ng-container [ngTemplateOutlet]="board" /></div>
      } @else {
        <kn-splitter class="kb-frame">
          <kn-splitter-panel [min]="45"
            ><ng-container [ngTemplateOutlet]="board"
          /></kn-splitter-panel>
          <kn-splitter-handle aria-label="Ширина панели задачи" />
          <kn-splitter-panel [min]="22" [max]="50" [(size)]="detailsSize">
            <ng-container [ngTemplateOutlet]="details" />
          </kn-splitter-panel>
        </kn-splitter>
      }
      <p class="kb-hint">
        Карточки перетаскиваются между колонками. С клавиатуры то же самое делает меню карточки
        (кнопка «⋯» или Shift + F10) — пункт «Переместить».
      </p>
    </main>

    <ng-template #board>
      <div class="kb-board" cdkDropListGroup>
        @for (column of columns; track column.id) {
          <section class="kb-column" [attr.aria-labelledby]="'kb-' + column.id">
            <h2 [id]="'kb-' + column.id">
              {{ column.title }} <kn-badge>{{ tasksOf(column.id).length }}</kn-badge>
            </h2>
            <div
              class="kb-list"
              cdkDropList
              [cdkDropListData]="column.id"
              (cdkDropListDropped)="drop($event)"
            >
              @for (task of tasksOf(column.id); track task.id) {
                <article
                  class="kb-card"
                  cdkDrag
                  [cdkDragData]="task"
                  [attr.data-selected]="task.id === selectedId() ? '' : null"
                  [knContextMenu]="taskMenu"
                  [knContextMenuData]="{ $implicit: task }"
                >
                  <div class="kb-card-top">
                    <button
                      class="kb-card-open"
                      type="button"
                      [attr.aria-pressed]="task.id === selectedId()"
                      (click)="open(task)"
                    >
                      {{ task.title }}
                    </button>
                    <button
                      kn-icon-button
                      size="sm"
                      variant="ghost"
                      tone="neutral"
                      [attr.aria-label]="'Действия: ' + task.title"
                      [knMenuTrigger]="taskMenu"
                      [knMenuData]="{ $implicit: task }"
                    >
                      <kn-icon name="more" />
                    </button>
                  </div>
                  <div class="kb-card-meta">
                    <kn-badge [tone]="priority[task.priority].tone">{{
                      priority[task.priority].label
                    }}</kn-badge>
                    @if (task.due) {
                      <span class="kb-due"
                        ><kn-icon name="calendar" [size]="14" /> {{ date.format(task.due) }}</span
                      >
                    }
                    @if (task.assignee) {
                      <kn-avatar class="kb-assignee" size="sm" [name]="task.assignee" />
                    }
                  </div>
                </article>
              } @empty {
                <p class="kb-empty">Перетащите задачу сюда</p>
              }
            </div>
          </section>
        }
      </div>
    </ng-template>

    <ng-template #details>
      <aside class="kb-details" aria-label="Задача">
        @if (selected(); as task) {
          <div class="kb-details-head">
            <kn-badge tone="accent">{{ columnTitle(task.column) }}</kn-badge>
            @if (!compact()) {
              <button
                kn-icon-button
                size="sm"
                variant="ghost"
                tone="neutral"
                aria-label="Закрыть задачу"
                (click)="selectedId.set(null)"
              >
                <kn-icon name="x" />
              </button>
            }
          </div>
          <kn-field label="Название">
            <input
              knInput
              [value]="task.title"
              (input)="patch(task.id, { title: $any($event.target).value })"
            />
          </kn-field>
          <kn-field label="Колонка">
            <kn-select [value]="task.column" (valueChange)="move(task, $any($event))">
              @for (column of columns; track column.id) {
                <kn-option [value]="column.id">{{ column.title }}</kn-option>
              }
            </kn-select>
          </kn-field>
          <kn-field label="Исполнитель">
            <kn-combobox
              clearable
              placeholder="Не назначен"
              [value]="task.assignee"
              (valueChange)="patch(task.id, { assignee: $any($event) })"
            >
              @for (person of people; track person) {
                <kn-option [value]="person">{{ person }}</kn-option>
              }
            </kn-combobox>
          </kn-field>
          <kn-field label="Срок">
            <kn-date-picker [value]="task.due" (valueChange)="patch(task.id, { due: $event })" />
          </kn-field>
          <kn-field label="Приоритет">
            <kn-radio-group
              orientation="horizontal"
              [value]="task.priority"
              (valueChange)="patch(task.id, { priority: $any($event) })"
            >
              <kn-radio value="low">Низкий</kn-radio>
              <kn-radio value="medium">Средний</kn-radio>
              <kn-radio value="high">Высокий</kn-radio>
            </kn-radio-group>
          </kn-field>
          <kn-field label="Заметки">
            <textarea
              knTextarea
              [minRows]="3"
              [value]="task.notes"
              (input)="patch(task.id, { notes: $any($event.target).value })"
            ></textarea>
          </kn-field>
          <button kn-button variant="soft" tone="danger" (click)="remove(task)">
            <kn-icon name="trash" /> Удалить задачу
          </button>
        } @else {
          <kn-empty-state
            icon="columns"
            heading="Задача не выбрана"
            description="Нажмите на карточку, чтобы увидеть и изменить детали."
          />
        }
      </aside>
    </ng-template>

    <ng-template #sheet>
      <kn-drawer-header [heading]="selected()?.title ?? 'Задача'" />
      <kn-drawer-body><ng-container [ngTemplateOutlet]="details" /></kn-drawer-body>
    </ng-template>

    <ng-template #taskMenu let-task>
      <kn-menu>
        <button kn-menu-item (triggered)="open(task)">
          <kn-icon name="edit" [size]="16" /> Открыть
        </button>
        <kn-menu-separator />
        <kn-menu-group label="Переместить">
          @for (column of columns; track column.id) {
            <button
              kn-menu-item-radio
              [checked]="task.column === column.id"
              (triggered)="move(task, column.id)"
            >
              {{ column.title }}
            </button>
          }
        </kn-menu-group>
        <kn-menu-separator />
        <button kn-menu-item tone="danger" (triggered)="remove(task)">
          <kn-icon name="trash" [size]="16" /> Удалить
        </button>
      </kn-menu>
    </ng-template>

    <ng-template #createDialog let-ref>
      <kn-dialog-header heading="Новая задача" />
      <kn-dialog-body>
        <form id="kb-create" class="kb-form" (submit)="$event.preventDefault(); create(ref)">
          <kn-field label="Название" [error]="draftError()">
            <input
              knInput
              placeholder="Что нужно сделать"
              [value]="draftTitle()"
              (input)="draftTitle.set($any($event.target).value); draftError.set(null)"
            />
          </kn-field>
          <kn-field label="Колонка">
            <kn-select [(value)]="draftColumn">
              @for (column of columns; track column.id) {
                <kn-option [value]="column.id">{{ column.title }}</kn-option>
              }
            </kn-select>
          </kn-field>
        </form>
      </kn-dialog-body>
      <kn-dialog-footer>
        <button kn-button variant="ghost" tone="neutral" (click)="ref.close()">Отмена</button>
        <button kn-button type="submit" form="kb-create">Создать</button>
      </kn-dialog-footer>
    </ng-template>
  `,
  styles: `
    .kb {
      max-inline-size: 87rem;
      margin-inline: auto;
      padding: 0 var(--kn-space-6) var(--kn-space-8);
    }

    .kb-head {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--kn-space-4);
      padding: var(--kn-space-2);
    }

    .kb-head h1 {
      margin: var(--kn-space-2) 0 0;
      font-size: var(--kn-text-3xl);
      font-weight: 650;
      letter-spacing: var(--kn-tracking-tight);
      line-height: var(--kn-leading-tight);
    }

    .kb-frame {
      block-size: max(34rem, calc(100dvh - 15rem));
      margin-block-start: var(--kn-space-3);
    }

    .kb-board {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(15.5rem, 1fr);
      gap: var(--kn-space-3);
      block-size: 100%;
      overflow-x: auto;
      padding: 2px;
      box-sizing: border-box;
    }

    .kb-column {
      display: flex;
      flex-direction: column;
      min-block-size: 0;
      padding: var(--kn-space-3);
      border-radius: var(--kn-radius-lg);
      background: var(--kn-color-surface-subtle);
      backdrop-filter: var(--kn-surface-filter);
      -webkit-backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-surface-rim);
    }

    .kb-column h2 {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      margin: 0 0 var(--kn-space-3);
      padding-inline: var(--kn-space-1);
      font-size: var(--kn-text-md);
      font-weight: var(--kn-weight-semibold);
    }

    .kb-list {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: var(--kn-space-2);
      min-block-size: 4rem;
      overflow-y: auto;
      border-radius: var(--kn-radius-md);
    }

    .kb-list.cdk-drop-list-dragging .kb-card:not(.cdk-drag-placeholder) {
      transition: transform var(--kn-duration-normal) var(--kn-ease-out);
    }

    .kb-list.cdk-drop-list-receiving,
    .kb-list.cdk-drop-list-dragging {
      outline: 2px dashed var(--kn-color-border-strong);
      outline-offset: 2px;
    }

    .kb-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--kn-space-2);
      padding: var(--kn-space-3);
      border-radius: var(--kn-radius-md);
      background: var(--kn-color-surface-raised);
      box-shadow: var(--kn-elevation-raised);
      cursor: grab;
      touch-action: none;
    }

    .kb-card[data-selected] {
      box-shadow:
        inset 0 0 0 2px var(--kn-color-accent),
        var(--kn-shadow-sm);
    }

    .kb-card-top {
      display: flex;
      align-items: flex-start;
      gap: var(--kn-space-1);
    }

    .kb-card-top > [kn-icon-button] {
      flex: none;
      margin-block-start: -0.25rem;
      margin-inline-end: -0.25rem;
    }

    .kb-card-open {
      flex: 1;
      min-inline-size: 0;
      overflow-wrap: anywhere;
      padding: 0;
      border: 0;
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      font-weight: var(--kn-weight-medium);
      line-height: var(--kn-leading-snug);
      text-align: start;
      cursor: pointer;
    }

    .kb-card-open:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
      border-radius: var(--kn-radius-xs);
    }

    .kb-card-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-2);
      min-block-size: 1.75rem;
    }

    .kb-assignee {
      margin-inline-start: auto;
    }

    .kb-due {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-1);
      font-size: var(--kn-text-xs);
      color: var(--kn-color-text-muted);
      white-space: nowrap;
    }

    .kb-empty {
      margin: auto;
      padding: var(--kn-space-4);
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-subtle);
      text-align: center;
    }

    /* CDK drag-and-drop states */
    .kb-card.cdk-drag-preview {
      box-shadow: var(--kn-elevation-modal);
      cursor: grabbing;
      rotate: 2deg;
    }

    .kb-card.cdk-drag-placeholder {
      opacity: 0.35;
    }

    .kb-card.cdk-drag-animating {
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .kb-details {
      display: grid;
      align-content: start;
      gap: var(--kn-space-4);
      box-sizing: border-box;
      min-block-size: 100%;
      padding: var(--kn-space-5);
      border-radius: var(--kn-radius-lg);
      background: var(--kn-color-surface-raised);
      backdrop-filter: var(--kn-surface-filter-raised);
      -webkit-backdrop-filter: var(--kn-surface-filter-raised);
      box-shadow: var(--kn-elevation-card);
    }

    /* Inside the bottom sheet the drawer is the surface */
    kn-drawer-body .kb-details {
      padding: 0;
      background: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      box-shadow: none;
    }

    .kb-details-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kb-details > button {
      justify-self: start;
    }

    .kb-form {
      display: grid;
      gap: var(--kn-space-4);
    }

    .kb-hint {
      margin: var(--kn-space-3) var(--kn-space-2) 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    @media (max-width: 56rem) {
      .kb {
        padding-inline: var(--kn-space-3);
      }

      .kb-frame {
        block-size: max(30rem, calc(100dvh - 17rem));
      }

      .kb-board {
        grid-auto-columns: minmax(17rem, 82vw);
        scroll-snap-type: x mandatory;
      }

      .kb-column {
        scroll-snap-align: start;
      }
    }
  `,
})
export default class KanbanExample {
  private readonly toaster = inject(KnToaster);
  private readonly dialog = inject(KnDialog);
  private readonly drawer = inject(KnDrawer);
  private readonly createDialog = viewChild.required<TemplateRef<unknown>>('createDialog');
  private readonly sheet = viewChild.required<TemplateRef<unknown>>('sheet');
  private sheetRef: KnDialogRef | null = null;

  /** Phones and narrow tablets: no room for two panes side by side. */
  protected readonly compact = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 56rem)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly columns = COLUMNS;
  protected readonly people = [...PEOPLE, 'Зоя Мельникова'];
  protected readonly priority = PRIORITY;
  protected readonly date = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' });

  protected readonly tasks = signal<Task[]>(TASKS);
  protected readonly selectedId = signal<number | null>(3);
  protected readonly detailsSize = signal<number | undefined>(30);
  protected readonly selected = computed(
    () => this.tasks().find((task) => task.id === this.selectedId()) ?? null,
  );

  protected readonly draftTitle = signal('');
  protected readonly draftColumn = signal<ColumnId | null>('todo');
  protected readonly draftError = signal<string | null>(null);
  private nextId = TASKS.length + 1;

  protected tasksOf(column: ColumnId): Task[] {
    return this.tasks().filter((task) => task.column === column);
  }

  protected columnTitle(id: ColumnId): string {
    return COLUMNS.find((column) => column.id === id)?.title ?? '';
  }

  protected open(task: Task): void {
    this.selectedId.set(task.id);
    if (!this.compact()) return;
    this.sheetRef = this.drawer.open(this.sheet(), { side: 'bottom', size: 'min(42rem, 88dvh)' });
  }

  protected patch(id: number, changes: Partial<Task>): void {
    this.tasks.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, ...changes } : task)),
    );
  }

  /** Reorders within a column or moves across columns, keeping the flat task list in column order. */
  protected drop(event: CdkDragDrop<ColumnId, ColumnId, Task>): void {
    const task = event.item.data;
    const target = event.container.data;
    const others = this.tasks().filter((t) => t.id !== task.id);
    const inTarget = others.filter((t) => t.column === target);
    const before = inTarget[event.currentIndex];
    const moved = { ...task, column: target };
    const index = before ? others.indexOf(before) : others.length;
    this.tasks.set([...others.slice(0, index), moved, ...others.slice(index)]);
  }

  protected move(task: Task, column: ColumnId | null): void {
    if (!column || column === task.column) return;
    this.patch(task.id, { column });
    this.toaster.show({ title: `«${task.title}» → ${this.columnTitle(column)}` });
  }

  protected remove(task: Task): void {
    const before = this.tasks();
    this.tasks.update((tasks) => tasks.filter((t) => t.id !== task.id));
    if (this.selectedId() === task.id) this.selectedId.set(null);
    void this.sheetRef?.close();
    this.toaster.show({
      title: 'Задача удалена',
      action: { label: 'Отменить', run: () => this.tasks.set(before) },
    });
  }

  protected openCreate(): void {
    this.draftTitle.set('');
    this.draftError.set(null);
    this.dialog.open(this.createDialog(), { width: '26rem' });
  }

  protected create(ref: KnDialogRef): void {
    const title = this.draftTitle().trim();
    if (!title) {
      this.draftError.set('Дайте задаче название');
      return;
    }
    const task: Task = {
      id: this.nextId++,
      title,
      column: this.draftColumn() ?? 'todo',
      assignee: null,
      priority: 'medium',
      due: null,
      notes: '',
    };
    this.tasks.update((tasks) => [...tasks, task]);
    this.selectedId.set(task.id);
    void ref.close();
  }
}
