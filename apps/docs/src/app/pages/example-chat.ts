import { Clipboard } from '@angular/cdk/clipboard';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { KnButton } from '@kenny/ui/button';
import { KnChip } from '@kenny/ui/chip';
import { KnCollapse } from '@kenny/ui/collapse';
import { KnIcon } from '@kenny/ui/icon';
import { KnTextarea } from '@kenny/ui/input';
import { KnOption, KnSelect } from '@kenny/ui/select';
import { KnSidebar, KnSidebarGroup, KnSidebarItem } from '@kenny/ui/sidebar';
import { KnSpinner } from '@kenny/ui/spinner';
import { KnColumn, KnTable } from '@kenny/ui/table';
import { KnToaster } from '@kenny/ui/toast';
import { KnTooltip } from '@kenny/ui/tooltip';

interface Step {
  label: string;
  done: boolean;
}

interface Overdue {
  number: string;
  client: string;
  due: string;
  amount: string;
}

/** What may follow the text of an answer. */
type Extra =
  | { kind: 'table'; rows: Overdue[] }
  | { kind: 'list'; items: string[] }
  | { kind: 'draft'; text: string };

interface Message {
  id: number;
  role: 'user' | 'agent';
  text: string;
  files?: string[];
  agent?: string;
  steps?: Step[];
  extra?: Extra;
  /** Words of the text revealed so far; the whole text when the answer is complete. */
  shown?: number;
  state?: 'working' | 'writing' | 'done' | 'stopped';
  script?: number;
}

interface Conversation {
  id: number;
  title: string;
  group: 'Сегодня' | 'Раньше';
  messages: Message[];
}

interface Script {
  match: RegExp;
  steps: string[];
  text: string;
  extra: Extra;
}

const AGENTS = [
  { id: 'analyst', name: 'Аналитик', hint: 'Счета, оплаты, отчёты' },
  { id: 'lawyer', name: 'Юрист', hint: 'Договоры и претензии' },
  { id: 'helper', name: 'Помощник', hint: 'Письма и напоминания' },
];

const OVERDUE: Overdue[] = [
  { number: 'INV-1057', client: 'Гринфилд', due: '8 окт.', amount: '259 300 ₽' },
  { number: 'INV-1051', client: 'Фабрика идей', due: '16 окт.', amount: '35 500 ₽' },
  { number: 'INV-1044', client: 'Северный мост', due: '21 окт.', amount: '294 800 ₽' },
];

/** The agent is scripted: this screen shows the interface, not a model. */
const SCRIPTS: Script[] = [
  {
    match: /сч[её]т|просроч|долг/i,
    steps: ['Ищу просроченные счета', 'Сверяю с выпиской банка', 'Собираю сводку'],
    text: 'Просрочено три счёта на 589 600 ₽. Самый старый — у «Гринфилда», 34 дня.\n\nПо «Северному мосту» оплата могла прийти вчера: в выписке есть платёж на ту же сумму, но без номера счёта. Его стоит проверить вручную, прежде чем писать клиенту.',
    extra: { kind: 'table', rows: OVERDUE },
  },
  {
    match: /письм|напомин|напиш/i,
    steps: ['Беру шаблон напоминания', 'Подставляю реквизиты и сумму'],
    text: 'Подготовил напоминание для «Гринфилда». Тон нейтральный, без упоминания пеней — по договору они начисляются только после 45 дней.',
    extra: {
      kind: 'draft',
      text: 'Добрый день!\n\nНапоминаем, что счёт INV-1057 на 259 300 ₽ со сроком оплаты 8 октября пока не оплачен. Если платёж уже отправлен, пришлите, пожалуйста, платёжное поручение — мы сверим его с выпиской.\n\nС уважением, Анна Орлова',
    },
  },
  {
    match: /./,
    steps: ['Разбираю вопрос', 'Ищу в данных кабинета'],
    text: 'Вот с чего я бы начал. Скажите, какой шаг сделать первым, — или уточните задачу, и я соберу план заново.',
    extra: {
      kind: 'list',
      items: [
        'Сверить платежи за последнюю неделю с выставленными счетами',
        'Отметить клиентов, у которых просрочка больше 30 дней',
        'Подготовить напоминания и показать их вам перед отправкой',
      ],
    },
  },
];

const SUGGESTIONS = [
  'Какие счета просрочены?',
  'Напиши напоминание «Гринфилду»',
  'С чего начать закрытие месяца?',
];

const words = (text: string): string[] => text.split(/(?<=\s)/);

function answered(id: number, script: number, agent: string): Message {
  const { text, steps, extra } = SCRIPTS[script];
  return {
    id,
    role: 'agent',
    agent,
    text,
    extra,
    script,
    state: 'done',
    shown: words(text).length,
    steps: steps.map((label) => ({ label, done: true })),
  };
}

const INITIAL: Conversation[] = [
  {
    id: 1,
    title: 'Просроченные счета',
    group: 'Сегодня',
    messages: [
      { id: 1, role: 'user', text: 'Какие счета просрочены на сегодня?' },
      answered(2, 0, 'Аналитик'),
    ],
  },
  {
    id: 2,
    title: 'Письмо «Гринфилду»',
    group: 'Сегодня',
    messages: [
      { id: 3, role: 'user', text: 'Напиши вежливое напоминание об оплате для «Гринфилда».' },
      answered(4, 1, 'Помощник'),
    ],
  },
  {
    id: 3,
    title: 'Закрытие октября',
    group: 'Раньше',
    messages: [
      {
        id: 5,
        role: 'user',
        text: 'С чего начать закрытие месяца?',
        files: ['выписка-октябрь.csv'],
      },
      answered(6, 2, 'Аналитик'),
    ],
  },
];

@Component({
  imports: [
    RouterLink,
    KnSidebar,
    KnSidebarGroup,
    KnSidebarItem,
    KnButton,
    KnIcon,
    KnTextarea,
    KnSelect,
    KnOption,
    KnChip,
    KnCollapse,
    KnSpinner,
    KnTable,
    KnTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app">
      <kn-sidebar class="side" aria-label="Диалоги">
        <button knSidebarHeader kn-button block variant="outline" tone="neutral" (click)="start()">
          <kn-icon name="plus" /> Новый диалог
        </button>
        @for (group of groups(); track group.label) {
          <kn-sidebar-group [label]="group.label">
            @for (item of group.items; track item.id) {
              <button
                kn-sidebar-item
                type="button"
                [active]="item.id === activeId()"
                (click)="open(item.id)"
              >
                {{ item.title }}
              </button>
            }
          </kn-sidebar-group>
        }
        <kn-sidebar-group label="Примеры">
          <a kn-sidebar-item routerLink="/examples"
            ><kn-icon knSidebarIcon name="arrow-left" /> Все примеры</a
          >
        </kn-sidebar-group>
      </kn-sidebar>

      <main id="content" class="chat">
        <header class="head">
          <h1>{{ active().title }}</h1>
          <!-- Narrow screens have no room for the list: the same dialogs live in a select -->
          <div class="switch">
            <kn-select
              size="sm"
              aria-label="Диалог"
              [value]="activeId()"
              (valueChange)="open($event)"
            >
              @for (item of conversations(); track item.id) {
                <kn-option [value]="item.id">{{ item.title }}</kn-option>
              }
            </kn-select>
            <button
              kn-icon-button
              size="sm"
              variant="outline"
              tone="neutral"
              aria-label="Новый диалог"
              (click)="start()"
            >
              <kn-icon name="plus" />
            </button>
          </div>
        </header>

        <div
          #thread
          class="thread"
          role="log"
          aria-label="Сообщения"
          tabindex="0"
          [attr.aria-busy]="busy()"
          (scroll)="onScroll()"
        >
          @for (message of active().messages; track message.id) {
            @if (message.role === 'user') {
              <article class="message user" aria-label="Вы">
                <p>{{ message.text }}</p>
                @if (message.files?.length) {
                  <div class="files">
                    @for (file of message.files; track file) {
                      <kn-chip size="sm"><kn-icon name="file" [size]="14" /> {{ file }}</kn-chip>
                    }
                  </div>
                }
              </article>
            } @else {
              <article class="message agent" [attr.aria-label]="message.agent">
                <div class="who">
                  <span class="mark" aria-hidden="true"><kn-icon name="zap" [size]="14" /></span>
                  {{ message.agent }}
                </div>

                @if (message.steps; as steps) {
                  @let open = expanded().has(message.id) || message.state === 'working';
                  <div class="steps">
                    <button
                      class="steps-toggle"
                      type="button"
                      [attr.aria-expanded]="open"
                      (click)="toggleSteps(message.id)"
                    >
                      @if (message.state === 'working') {
                        <kn-spinner size="sm" decorative /> Работаю…
                      } @else {
                        <kn-icon name="check-circle" [size]="16" /> Шагов: {{ steps.length }}
                      }
                      <kn-icon class="chevron" name="chevron-down" [size]="16" />
                    </button>
                    <kn-collapse [open]="open">
                      <ol>
                        @for (step of steps; track step.label) {
                          <li [attr.data-done]="step.done ? '' : null">
                            @if (step.done) {
                              <kn-icon name="check" [size]="14" />
                            } @else {
                              <kn-spinner size="sm" decorative />
                            }
                            {{ step.label }}
                          </li>
                        }
                      </ol>
                    </kn-collapse>
                  </div>
                }

                @for (paragraph of paragraphs(message); track $index) {
                  <p>{{ paragraph }}</p>
                }

                @if (message.state === 'done' && message.extra; as extra) {
                  @switch (extra.kind) {
                    @case ('table') {
                      <kn-table
                        class="result"
                        size="sm"
                        aria-label="Просроченные счета"
                        trackBy="number"
                        [data]="extra.rows"
                        [columns]="columns"
                      />
                    }
                    @case ('list') {
                      <ol class="plan">
                        @for (item of extra.items; track item) {
                          <li>{{ item }}</li>
                        }
                      </ol>
                    }
                    @case ('draft') {
                      <blockquote class="draft">{{ extra.text }}</blockquote>
                    }
                  }
                }

                @if (message.state === 'stopped') {
                  <p class="stopped">Ответ остановлен.</p>
                }

                @if (message.state === 'done' || message.state === 'stopped') {
                  <div class="actions">
                    <button
                      kn-icon-button
                      size="sm"
                      variant="ghost"
                      tone="neutral"
                      aria-label="Скопировать ответ"
                      knTooltip="Скопировать"
                      (click)="copy(message)"
                    >
                      <kn-icon name="copy" />
                    </button>
                    @if ($last) {
                      <button
                        kn-icon-button
                        size="sm"
                        variant="ghost"
                        tone="neutral"
                        aria-label="Ответить заново"
                        knTooltip="Ответить заново"
                        [disabled]="busy()"
                        (click)="retry(message)"
                      >
                        <kn-icon name="refresh" />
                      </button>
                    }
                  </div>
                }
              </article>
            }
          } @empty {
            <div class="welcome">
              <span class="mark large" aria-hidden="true"><kn-icon name="zap" [size]="22" /></span>
              <h2>Чем помочь?</h2>
              <p>Спросите о счетах и оплатах или выберите один из вопросов.</p>
              <div class="suggestions">
                @for (suggestion of suggestions; track suggestion) {
                  <button kn-button variant="outline" tone="neutral" (click)="send(suggestion)">
                    {{ suggestion }}
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <form class="composer" (submit)="$event.preventDefault(); send(draft())">
          @if (files().length) {
            <div class="files">
              @for (file of files(); track file) {
                <kn-chip size="sm" removable (removed)="detach(file)">{{ file }}</kn-chip>
              }
            </div>
          }
          <textarea
            #input
            knTextarea
            autosize
            [minRows]="1"
            [maxRows]="8"
            class="field"
            aria-label="Сообщение агенту"
            placeholder="Спросите что-нибудь…"
            [value]="draft()"
            (input)="draft.set(input.value)"
            (keydown.enter)="onEnter($event)"
          ></textarea>
          <div class="tools">
            <input
              #picker
              class="picker"
              type="file"
              multiple
              tabindex="-1"
              aria-hidden="true"
              (change)="attach(picker.files); picker.value = ''"
            />
            <button
              kn-icon-button
              type="button"
              size="sm"
              variant="ghost"
              tone="neutral"
              aria-label="Прикрепить файлы"
              knTooltip="Прикрепить файлы"
              (click)="picker.click()"
            >
              <kn-icon name="plus" />
            </button>
            <kn-select class="agent-select" size="sm" aria-label="Агент" [(value)]="agentId">
              @for (agent of agents; track agent.id) {
                <kn-option [value]="agent.id">{{ agent.name }}</kn-option>
              }
            </kn-select>
            <span class="grow"></span>
            <span class="hint">Enter — отправить, Shift + Enter — новая строка</span>
            @if (busy()) {
              <button
                kn-button
                type="button"
                size="sm"
                variant="soft"
                tone="neutral"
                (click)="stop()"
              >
                Остановить
              </button>
            } @else {
              <button
                kn-icon-button
                type="submit"
                size="sm"
                aria-label="Отправить"
                [disabled]="!draft().trim()"
              >
                <kn-icon name="arrow-up" />
              </button>
            }
          </div>
        </form>
        <p class="disclaimer">Агент здесь — сценарий: экран показывает интерфейс, а не модель.</p>
      </main>
    </div>
  `,
  styles: `
    .app {
      display: flex;
      gap: var(--kn-space-4);
      max-inline-size: 76rem;
      block-size: calc(100dvh - 6.5rem);
      min-block-size: 30rem;
      margin-inline: auto;
      padding: 0 var(--kn-space-6) var(--kn-space-4);
    }

    .side {
      flex: none;
      --kn-sidebar-width: 15rem;
    }

    .chat {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-inline-size: 0;
      min-block-size: 0;
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--kn-space-3);
      padding: var(--kn-space-2);
    }

    h1 {
      margin: 0;
      font-size: var(--kn-text-xl);
      font-weight: 650;
      letter-spacing: var(--kn-tracking-snug);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .switch {
      display: none;
      align-items: center;
      gap: var(--kn-space-2);
      min-inline-size: 0;
    }

    .switch kn-select {
      inline-size: 12rem;
      max-inline-size: 50vw;
    }

    /* The thread is the only part that scrolls; the composer stays where the hands are */
    .thread {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--kn-space-6);
      min-block-size: 0;
      padding: var(--kn-space-4) var(--kn-space-2) var(--kn-space-6);
      overflow-y: auto;
      overscroll-behavior: contain;
      border-radius: var(--kn-radius-md);
    }

    .thread:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
    }

    .message {
      display: grid;
      gap: var(--kn-space-3);
      max-inline-size: 44rem;
      inline-size: 100%;
      margin-inline: auto;
      line-height: var(--kn-leading-normal);
      animation: kn-stagger-in var(--kn-duration-normal) var(--kn-ease-out);
    }

    .message p {
      margin: 0;
      white-space: pre-line;
      overflow-wrap: anywhere;
    }

    /* The person's words sit in a bubble on the trailing side; the agent's are plain text */
    .message.user {
      justify-items: end;
    }

    .message.user p {
      max-inline-size: min(34rem, 88%);
      padding: var(--kn-space-3) var(--kn-space-4);
      border-radius: var(--kn-radius-xl);
      border-end-end-radius: var(--kn-radius-xs);
      background: var(--kn-color-surface);
      box-shadow: var(--kn-elevation-card);
    }

    .who {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-semibold);
    }

    .mark {
      display: grid;
      place-items: center;
      inline-size: 1.5rem;
      block-size: 1.5rem;
      border-radius: var(--kn-radius-sm);
      background: var(--kn-color-accent);
      color: var(--kn-color-on-accent);
    }

    .mark.large {
      inline-size: 2.75rem;
      block-size: 2.75rem;
      border-radius: var(--kn-radius-lg);
    }

    .steps {
      justify-self: start;
      max-inline-size: 100%;
      border-radius: var(--kn-radius-md);
      background: var(--kn-color-surface-sunken);
    }

    .steps-toggle {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      padding: var(--kn-space-1-5) var(--kn-space-3);
      border: 0;
      border-radius: inherit;
      background: none;
      color: var(--kn-color-text-muted);
      font: inherit;
      font-size: var(--kn-text-sm);
      cursor: pointer;
    }

    .steps-toggle:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
    }

    .chevron {
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .steps-toggle[aria-expanded='true'] .chevron {
      transform: rotate(180deg);
    }

    .steps ol {
      display: grid;
      gap: var(--kn-space-1-5);
      margin: 0;
      padding: 0 var(--kn-space-3) var(--kn-space-3);
      list-style: none;
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    .steps li {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      animation: kn-stagger-in var(--kn-duration-normal) var(--kn-ease-out);
    }

    .steps li[data-done] kn-icon {
      color: var(--kn-color-success);
    }

    .result,
    .plan,
    .draft {
      animation: kn-stagger-in var(--kn-duration-slow) var(--kn-ease-out);
    }

    .plan {
      display: grid;
      gap: var(--kn-space-2);
      margin: 0;
      padding-inline-start: var(--kn-space-5);
    }

    .draft {
      margin: 0;
      padding: var(--kn-space-4);
      border-radius: var(--kn-radius-lg);
      border-inline-start: 3px solid var(--kn-color-accent);
      background: var(--kn-color-surface);
      box-shadow: var(--kn-elevation-card);
      white-space: pre-line;
    }

    .stopped {
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    .actions {
      display: flex;
      gap: var(--kn-space-1);
      margin-block-start: calc(var(--kn-space-1) * -1);
    }

    .welcome {
      display: grid;
      justify-items: center;
      gap: var(--kn-space-3);
      margin: auto;
      padding: var(--kn-space-6);
      text-align: center;
    }

    .welcome h2 {
      margin: var(--kn-space-2) 0 0;
      font-size: var(--kn-text-2xl);
      font-weight: 650;
      letter-spacing: var(--kn-tracking-tight);
    }

    .welcome p {
      margin: 0;
      color: var(--kn-color-text-muted);
    }

    .suggestions,
    .files {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-2);
    }

    .suggestions {
      justify-content: center;
      margin-block-start: var(--kn-space-3);
    }

    /* The composer is one field made of several controls: it draws the edge and the focus */
    .composer {
      display: grid;
      gap: var(--kn-space-2);
      max-inline-size: 44rem;
      inline-size: 100%;
      margin-inline: auto;
      padding: var(--kn-space-3);
      border-radius: var(--kn-radius-xl);
      background: var(--kn-color-field);
      box-shadow:
        inset 0 0 0 1px var(--kn-color-control-border),
        var(--kn-shadow-sm);
      box-sizing: border-box;
    }

    .composer:has(.field:focus-visible) {
      outline: var(--kn-field-focus-width, 2px) solid var(--kn-color-focus);
      outline-offset: -1px;
    }

    /* The textarea inside gives up its own edge — with tokens, not with overrides */
    .field {
      --kn-color-field: transparent;
      --kn-field-border-width: 0px;
      --kn-field-underline-width: 0px;
      --kn-field-underline-focus-width: 0px;
      --kn-field-focus-width: 0px;
      --kn-field-halo-width: 0px;
      --kn-field-shadow: 0 0 0 0 transparent;
      --kn-field-padding: var(--kn-space-1);
      min-block-size: 0;
    }

    .tools {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      min-inline-size: 0;
    }

    .picker {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      opacity: 0;
      pointer-events: none;
    }

    .agent-select {
      inline-size: 9.5rem;
    }

    .grow {
      flex: 1;
    }

    .hint,
    .disclaimer {
      color: var(--kn-color-text-subtle);
      font-size: var(--kn-text-xs);
    }

    .disclaimer {
      margin: var(--kn-space-2) 0 0;
      text-align: center;
    }

    @media (max-width: 56rem) {
      .app {
        padding-inline: var(--kn-space-4);
      }

      .side,
      h1,
      .hint {
        display: none;
      }

      .switch {
        display: flex;
        flex: 1;
        justify-content: space-between;
      }
    }
  `,
})
export default class ChatExample {
  private readonly toaster = inject(KnToaster);
  private readonly clipboard = inject(Clipboard);
  private readonly thread = viewChild.required<ElementRef<HTMLElement>>('thread');
  private readonly input = viewChild.required<ElementRef<HTMLTextAreaElement>>('input');

  protected readonly agents = AGENTS;
  protected readonly suggestions = SUGGESTIONS;
  protected readonly columns: KnColumn<Overdue>[] = [
    { key: 'number', header: 'Счёт' },
    { key: 'client', header: 'Клиент' },
    { key: 'due', header: 'Срок' },
    { key: 'amount', header: 'Сумма', align: 'end' },
  ];

  protected readonly conversations = signal<Conversation[]>(INITIAL);
  protected readonly activeId = signal(1);
  protected readonly agentId = signal<string | null>('analyst');
  protected readonly draft = signal('');
  protected readonly files = signal<string[]>([]);
  protected readonly busy = signal(false);
  /** Answers whose list of steps is open. */
  protected readonly expanded = signal(new Set<number>());

  protected readonly active = computed(
    () =>
      this.conversations().find((item) => item.id === this.activeId()) ?? this.conversations()[0],
  );
  protected readonly groups = computed(() =>
    (['Сегодня', 'Раньше'] as const)
      .map((label) => ({
        label,
        items: this.conversations().filter((item) => item.group === label),
      }))
      .filter((group) => group.items.length),
  );

  private nextId = 100;
  private timers: ReturnType<typeof setTimeout>[] = [];
  /** Follow new text only while the reader is at the bottom of the thread. */
  private pinned = true;

  constructor() {
    afterRenderEffect(() => {
      this.active();
      const thread = this.thread().nativeElement;
      if (this.pinned) thread.scrollTop = thread.scrollHeight;
    });
    inject(DestroyRef).onDestroy(() => this.clearTimers());
  }

  /** The text revealed so far, as paragraphs. */
  protected paragraphs(message: Message): string[] {
    const text = words(message.text)
      .slice(0, message.shown ?? Infinity)
      .join('');
    return text ? text.split(/\n{2,}/) : [];
  }

  protected open(id: unknown): void {
    if (typeof id !== 'number' || id === this.activeId()) return;
    this.stop();
    this.pinned = true;
    this.activeId.set(id);
  }

  protected start(): void {
    this.stop();
    const empty = this.conversations().find((item) => !item.messages.length);
    if (empty) {
      this.activeId.set(empty.id);
    } else {
      const id = this.nextId++;
      this.conversations.update((list) => [
        { id, title: 'Новый диалог', group: 'Сегодня', messages: [] },
        ...list,
      ]);
      this.activeId.set(id);
    }
    this.input().nativeElement.focus();
  }

  protected onEnter(event: Event): void {
    if ((event as KeyboardEvent).shiftKey) return;
    event.preventDefault();
    this.send(this.draft());
  }

  protected send(raw: string): void {
    const text = raw.trim();
    if (!text || this.busy()) return;
    const files = this.files();
    const conversation = this.active();
    const script = SCRIPTS.findIndex((item) => item.match.test(text));
    this.patch(conversation.id, (item) => ({
      ...item,
      // A new dialog is named after its first question
      title: item.messages.length ? item.title : text.length > 34 ? `${text.slice(0, 32)}…` : text,
      messages: [
        ...item.messages,
        { id: this.nextId++, role: 'user', text, files: files.length ? files : undefined },
      ],
    }));
    this.draft.set('');
    this.input().nativeElement.value = '';
    this.files.set([]);
    this.pinned = true;
    this.answer(conversation.id, script);
  }

  protected retry(message: Message): void {
    const conversation = this.active();
    this.patch(conversation.id, (item) => ({
      ...item,
      messages: item.messages.filter((other) => other.id !== message.id),
    }));
    this.answer(conversation.id, message.script ?? SCRIPTS.length - 1);
  }

  protected stop(): void {
    if (!this.busy()) return;
    this.clearTimers();
    this.busy.set(false);
    this.update(this.activeId(), (message) =>
      message.state === 'working' || message.state === 'writing'
        ? { ...message, state: 'stopped', steps: message.steps?.filter((step) => step.done) }
        : message,
    );
  }

  protected toggleSteps(id: number): void {
    this.expanded.update((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  protected copy(message: Message): void {
    const extra = message.extra;
    const tail =
      extra?.kind === 'draft'
        ? `\n\n${extra.text}`
        : extra?.kind === 'list'
          ? `\n\n${extra.items.map((item, i) => `${i + 1}. ${item}`).join('\n')}`
          : extra?.kind === 'table'
            ? `\n\n${extra.rows.map((row) => `${row.number} · ${row.client} · ${row.due} · ${row.amount}`).join('\n')}`
            : '';
    if (this.clipboard.copy(message.text + tail)) this.toaster.success('Ответ скопирован');
  }

  protected attach(list: FileList | null): void {
    const names = Array.from(list ?? [], (file) => file.name);
    this.files.update((files) => [...new Set([...files, ...names])]);
    this.input().nativeElement.focus();
  }

  protected detach(name: string): void {
    this.files.update((files) => files.filter((file) => file !== name));
    this.input().nativeElement.focus();
  }

  protected onScroll(): void {
    const thread = this.thread().nativeElement;
    this.pinned = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 48;
  }

  /** Plays a scripted answer: the steps tick off one by one, then the text arrives in words. */
  private answer(conversationId: number, script: number): void {
    const { steps, text, extra } = SCRIPTS[script];
    const id = this.nextId++;
    const agent = AGENTS.find((item) => item.id === this.agentId())?.name ?? AGENTS[0].name;
    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = words(text).length;
    const set = (change: Partial<Message>): void =>
      this.update(conversationId, (message) =>
        message.id === id ? { ...message, ...change } : message,
      );

    this.busy.set(true);
    this.patch(conversationId, (item) => ({
      ...item,
      messages: [
        ...item.messages,
        { id, role: 'agent', agent, text, extra, script, state: 'working', shown: 0, steps: [] },
      ],
    }));

    let at = 0;
    const later = (delay: number, run: () => void): void => {
      at += delay;
      this.timers.push(setTimeout(run, at));
    };
    const shown: Step[] = [];
    for (const label of steps) {
      later(reduced ? 0 : 350, () => set({ steps: [...shown, { label, done: false }] }));
      later(reduced ? 0 : 650, () => {
        shown.push({ label, done: true });
        set({ steps: [...shown] });
      });
    }
    later(reduced ? 0 : 250, () => set({ state: 'writing' }));
    // With reduced motion the answer appears whole instead of word by word
    const chunk = reduced ? total : 2;
    for (let count = chunk; count < total + chunk; count += chunk) {
      later(reduced ? 0 : 45, () => set({ shown: Math.min(count, total) }));
    }
    later(reduced ? 0 : 120, () => {
      set({ state: 'done' });
      this.busy.set(false);
      this.timers = [];
    });
  }

  private patch(id: number, change: (conversation: Conversation) => Conversation): void {
    this.conversations.update((list) => list.map((item) => (item.id === id ? change(item) : item)));
  }

  private update(id: number, change: (message: Message) => Message): void {
    this.patch(id, (item) => ({ ...item, messages: item.messages.map(change) }));
  }

  private clearTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}
