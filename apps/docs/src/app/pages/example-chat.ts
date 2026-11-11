import { Clipboard } from '@angular/cdk/clipboard';
import { NgTemplateOutlet } from '@angular/common';
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
import { KnAvatar } from '@kenny/ui/avatar';
import { KnBadge } from '@kenny/ui/badge';
import { KnButton } from '@kenny/ui/button';
import { KnCard } from '@kenny/ui/card';
import { KnChip } from '@kenny/ui/chip';
import { KnCollapse } from '@kenny/ui/collapse';
import { KnIcon } from '@kenny/ui/icon';
import { KnTextarea } from '@kenny/ui/input';
import { KnMenu, KnMenuGroup, KnMenuItem, KnMenuItemRadio, KnMenuTrigger } from '@kenny/ui/menu';
import { KnOption, KnSelect } from '@kenny/ui/select';
import { KnSidebar, KnSidebarItem } from '@kenny/ui/sidebar';
import { KnSpinner } from '@kenny/ui/spinner';
import { KnToaster } from '@kenny/ui/toast';
import { KnTooltip } from '@kenny/ui/tooltip';

/** A run of text: plain, **bold** or `code`. */
interface Span {
  text: string;
  bold?: boolean;
  code?: boolean;
}

type Block =
  { kind: 'p'; spans: Span[] } | { kind: 'h'; spans: Span[] } | { kind: 'ul'; items: Span[][] };

interface Artifact {
  name: string;
  type: string;
}

interface Message {
  id: number;
  role: 'user' | 'agent';
  text: string;
  time?: string;
  attached?: string[];
  blocks?: Block[];
  /** Blocks revealed so far. */
  shown?: number;
  steps?: string[];
  /** Steps finished so far. */
  stepsDone?: number;
  work?: string;
  artifacts?: Artifact[];
  state?: 'working' | 'writing' | 'done' | 'stopped';
  script?: number;
}

type GroupId = 'today' | 'yesterday' | 'week';

interface Conversation {
  id: number;
  title: string;
  group: GroupId;
  messages: Message[];
}

interface Script {
  match: RegExp;
  steps: string[];
  work: string;
  blocks: Block[];
  artifacts: Artifact[];
}

const AGENT = 'Кенни';
const MODELS = ['kenny-large', 'kenny-fast'];
const EFFORTS = ['Низкая', 'Средняя', 'Высокая'];

/** `**bold**` and `` `code` `` inside a line of text. */
function spans(text: string): Span[] {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('**')
        ? { text: part.slice(2, -2), bold: true }
        : part.startsWith('`')
          ? { text: part.slice(1, -1), code: true }
          : { text: part },
    );
}
const p = (text: string): Block => ({ kind: 'p', spans: spans(text) });
const h = (text: string): Block => ({ kind: 'h', spans: spans(text) });
const ul = (...items: string[]): Block => ({ kind: 'ul', items: items.map(spans) });

/** The agent is scripted: this screen shows the interface, not a model. */
const SCRIPTS: Script[] = [
  {
    match: /сч[её]т|просроч|долг|отч[её]т/i,
    steps: [
      'Прочитал выписку банка за октябрь',
      'Сверил 23 счёта с платежами',
      'Собрал отчёт и письма клиентам',
    ],
    work: 'Работал 4 мин 12 с · 9 инструментов',
    blocks: [
      p(
        'Я сверил счета за октябрь с выпиской банка и подготовил три файла. Они открываются по карточкам под этим сообщением. Итог: просрочено три счёта на **589 600 ₽**, один из них, возможно, уже оплачен.',
      ),
      h('1. Отчёт по просрочке (`просрочка-октябрь.xlsx`)'),
      ul(
        '**Гринфилд** — счёт `INV-1057` на 259 300 ₽, просрочка 34 дня. Это самый старый долг.',
        '**Фабрика идей** — `INV-1051` на 35 500 ₽, 26 дней. Раньше платили вовремя.',
        '**Северный мост** — `INV-1044` на 294 800 ₽. В выписке есть платёж на ту же сумму без номера счёта: его нужно проверить вручную.',
      ),
      h('2. Письма клиентам (`напоминания.docx`)'),
      ul(
        'Два напоминания: «Гринфилду» и «Фабрике идей». Тон нейтральный, без пеней — по договору они начисляются после 45 дней.',
        '«Северному мосту» письма нет, пока не подтвердится платёж.',
      ),
      p(
        '**Что я не проверял.** Акты сверки и переписку с клиентами: у меня нет к ним доступа. Если «Северный мост» присылал платёжное поручение, вопрос закрывается без письма.',
      ),
    ],
    artifacts: [
      { name: 'просрочка-октябрь.xlsx', type: 'Таблица' },
      { name: 'напоминания.docx', type: 'Документ' },
      { name: 'сверка-с-банком.csv', type: 'Данные' },
    ],
  },
  {
    match: /письм|напомин|напиш/i,
    steps: ['Взял шаблон напоминания', 'Подставил реквизиты и сумму'],
    work: 'Работал 48 с · 3 инструмента',
    blocks: [
      p(
        'Подготовил напоминание для «Гринфилда» по счёту `INV-1057`. Письмо лежит в файле под сообщением, отправлять его я не стал.',
      ),
      ul(
        '**Тон** нейтральный: напоминание, а не претензия.',
        '**Пени** не упоминаются — до 45 дней просрочки договор их не предусматривает.',
        '**Подпись** — ваша, из профиля.',
      ),
      p('Если нужно жёстче или короче, скажите — перепишу.'),
    ],
    artifacts: [{ name: 'напоминание-гринфилд.docx', type: 'Документ' }],
  },
  {
    match: /./,
    steps: ['Разобрал вопрос', 'Посмотрел данные кабинета'],
    work: 'Работал 21 с · 2 инструмента',
    blocks: [
      p('Вот с чего я бы начал. Скажите, какой шаг сделать первым, или уточните задачу.'),
      ul(
        '**Сверить платежи** за последнюю неделю с выставленными счетами.',
        '**Отметить клиентов**, у которых просрочка больше 30 дней.',
        '**Подготовить напоминания** и показать их вам перед отправкой.',
      ),
    ],
    artifacts: [],
  },
];

function answered(id: number, script: number, time: string): Message {
  const { steps, work, blocks, artifacts } = SCRIPTS[script];
  return {
    id,
    role: 'agent',
    text: '',
    time,
    blocks,
    shown: blocks.length,
    steps,
    stepsDone: steps.length,
    work,
    artifacts,
    state: 'done',
    script,
  };
}

const chat = (id: number, group: GroupId, title: string, script?: number): Conversation => ({
  id,
  group,
  title,
  messages:
    script === undefined
      ? []
      : [{ id: id * 10, role: 'user', text: title }, answered(id * 10 + 1, script, '14:32')],
});

const INITIAL: Conversation[] = [
  chat(1, 'today', 'Сверь счета за октябрь с выпиской банка и подготовь отчёт по просрочке', 0),
  chat(2, 'today', 'Напиши напоминание «Гринфилду»', 1),
  chat(3, 'today', 'С чего начать закрытие месяца?', 2),
  chat(4, 'yesterday', 'Какие клиенты платят с опозданием?', 2),
  chat(5, 'yesterday', 'Отчёт по выручке за третий квартал', 0),
  chat(6, 'week', 'Письмо «Орбите» о новом тарифе', 1),
];

const GROUPS: { id: GroupId; label: string }[] = [
  { id: 'today', label: 'Сегодня' },
  { id: 'yesterday', label: 'Вчера' },
  { id: 'week', label: 'На этой неделе' },
];

@Component({
  imports: [
    NgTemplateOutlet,
    RouterLink,
    KnSidebar,
    KnSidebarItem,
    KnButton,
    KnIcon,
    KnBadge,
    KnAvatar,
    KnCard,
    KnChip,
    KnCollapse,
    KnSpinner,
    KnTextarea,
    KnSelect,
    KnOption,
    KnMenu,
    KnMenuGroup,
    KnMenuItem,
    KnMenuItemRadio,
    KnMenuTrigger,
    KnTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell" [class.collapsed]="collapsed()">
      <!-- The header and footer of the sidebar sit outside its <nav>: the aside keeps them in a landmark -->
      <aside class="rail" aria-label="Боковая панель">
        <kn-sidebar class="side" aria-label="Разделы и чаты" [(collapsed)]="collapsed">
          <div knSidebarHeader class="brand">
            <span class="mark" aria-hidden="true"><kn-icon name="zap" [size]="16" /></span>
            <span class="brand-name">Рабочее место</span>
            <button
              kn-icon-button
              size="sm"
              variant="ghost"
              tone="neutral"
              [attr.aria-label]="collapsed() ? 'Развернуть меню' : 'Свернуть меню'"
              [attr.aria-expanded]="!collapsed()"
              (click)="collapsed.set(!collapsed())"
            >
              <kn-icon name="panel-left" />
            </button>
          </div>

          <button kn-sidebar-item type="button" (click)="start()">
            <span knSidebarIcon class="new" aria-hidden="true"
              ><kn-icon name="plus" [size]="14"
            /></span>
            Новый чат
          </button>
          <button kn-sidebar-item type="button" [knMenuTrigger]="artifactsMenu">
            <kn-icon knSidebarIcon name="folder" /> Артефакты
          </button>
          <button kn-sidebar-item type="button" (click)="soon('База знаний')">
            <kn-icon knSidebarIcon name="book" /> База знаний
          </button>
          <button kn-sidebar-item type="button" (click)="soon('Студия агентов')">
            <kn-icon knSidebarIcon name="cpu" /> Студия агентов
          </button>
          <a kn-sidebar-item routerLink="/examples">
            <kn-icon knSidebarIcon name="arrow-left" /> Все примеры
          </a>

          <label class="search">
            <kn-icon name="search" [size]="18" />
            <input
              type="search"
              placeholder="Поиск по чатам"
              aria-label="Поиск по чатам"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
            />
          </label>

          @for (group of groups(); track group.id) {
            @let foldable = group.id !== 'today' && !query();
            @let unfolded = !foldable || open().has(group.id);
            <section class="chats" [attr.aria-label]="group.label">
              @if (foldable) {
                <button
                  class="fold"
                  type="button"
                  [attr.aria-expanded]="unfolded"
                  (click)="toggleGroup(group.id)"
                >
                  {{ group.label }} <kn-icon name="chevron-right" [size]="14" />
                </button>
              } @else {
                <div class="group-label" aria-hidden="true">{{ group.label }}</div>
              }
              <kn-collapse [open]="unfolded">
                <div class="list">
                  @for (item of group.items; track item.id) {
                    <button
                      kn-sidebar-item
                      type="button"
                      [active]="item.id === activeId()"
                      (click)="select(item.id)"
                    >
                      <kn-icon knSidebarIcon name="chat" /> {{ item.title }}
                    </button>
                  }
                </div>
              </kn-collapse>
            </section>
          } @empty {
            <p class="none">Ничего не нашлось</p>
          }

          <button knSidebarFooter kn-sidebar-item type="button" (click)="report()">
            <kn-icon knSidebarIcon name="flag" /> Сообщить об ошибке
          </button>
        </kn-sidebar>
      </aside>

      <main id="content" class="main">
        <header class="top">
          <h1>{{ active().title }}</h1>
          <!-- Narrow screens have no room for the list: the same chats live in a select -->
          <kn-select
            class="switch"
            size="sm"
            aria-label="Чат"
            [value]="activeId()"
            (valueChange)="select($event)"
          >
            @for (item of conversations(); track item.id) {
              <kn-option [value]="item.id">{{ item.title }}</kn-option>
            }
          </kn-select>
          <button
            class="pill"
            kn-button
            size="sm"
            variant="outline"
            tone="neutral"
            [knMenuTrigger]="artifactsMenu"
          >
            <kn-icon name="folder" /> <span class="pill-text">Артефакты</span>
            <kn-badge variant="solid" tone="accent">{{ artifacts().length }}</kn-badge>
          </button>
          <button
            kn-icon-button
            size="sm"
            variant="ghost"
            tone="neutral"
            aria-label="Уведомления"
            knTooltip="Уведомления"
            (click)="soon('Уведомления')"
          >
            <kn-icon name="bell" />
          </button>
          <span class="user">
            <kn-avatar size="sm" name="Анна Орлова" />
            <span class="user-name">Анна Орлова</span>
          </span>
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
                @if (message.attached?.length) {
                  <div class="row">
                    @for (file of message.attached; track file) {
                      <kn-chip size="sm"><kn-icon name="file" [size]="14" /> {{ file }}</kn-chip>
                    }
                  </div>
                }
              </article>
            } @else {
              @let working = message.state === 'working';
              @let expanded = working || opened().has(message.id);
              <article class="message agent" [attr.aria-label]="agent">
                <div class="who">
                  <span class="mark" aria-hidden="true"><kn-icon name="zap" [size]="14" /></span>
                  <strong>{{ agent }}</strong>
                  <time>{{ message.time }}</time>
                </div>

                <div class="work">
                  <button
                    class="work-toggle"
                    type="button"
                    [attr.aria-expanded]="expanded"
                    (click)="toggleWork(message.id)"
                  >
                    @if (working) {
                      <kn-spinner size="sm" decorative />
                      <span class="work-text">Работает…</span>
                    } @else {
                      <span class="work-text">{{ message.work }}</span>
                    }
                    <kn-icon class="chevron" name="chevron-down" [size]="18" />
                  </button>
                  <kn-collapse [open]="expanded">
                    <ol>
                      @for (step of message.steps; track step; let i = $index) {
                        @if (i <= (message.stepsDone ?? 0)) {
                          <li>
                            @if (i < (message.stepsDone ?? 0)) {
                              <kn-icon name="check" [size]="14" />
                            } @else {
                              <kn-spinner size="sm" decorative />
                            }
                            {{ step }}
                          </li>
                        }
                      }
                    </ol>
                  </kn-collapse>
                </div>

                <div class="prose">
                  @for (block of visible(message); track $index) {
                    @switch (block.kind) {
                      @case ('p') {
                        <p>
                          <ng-container
                            *ngTemplateOutlet="inline; context: { $implicit: block.spans }"
                          />
                        </p>
                      }
                      @case ('h') {
                        <h2>
                          <ng-container
                            *ngTemplateOutlet="inline; context: { $implicit: block.spans }"
                          />
                        </h2>
                      }
                      @case ('ul') {
                        <ul>
                          @for (item of block.items; track $index) {
                            <li>
                              <ng-container
                                *ngTemplateOutlet="inline; context: { $implicit: item }"
                              />
                            </li>
                          }
                        </ul>
                      }
                    }
                  }
                </div>

                @if (message.state === 'done' && message.artifacts?.length) {
                  <section class="files" aria-label="Файлы ответа">
                    <div class="files-head">
                      <span
                        >Файлы ответа <b>{{ message.artifacts.length }}</b></span
                      >
                      <button class="all" type="button" [knMenuTrigger]="artifactsMenu">
                        Все артефакты <kn-icon name="arrow-right" [size]="14" />
                      </button>
                    </div>
                    <div class="cards">
                      @for (file of message.artifacts; track file.name) {
                        <button
                          kn-card
                          interactive
                          variant="outline"
                          padding="none"
                          type="button"
                          (click)="openFile(file)"
                        >
                          <span knCardMedia class="thumb" aria-hidden="true">
                            <i></i><i></i><i></i><i></i>
                          </span>
                          <span class="file-name">{{ file.name }}</span>
                          <span class="file-meta">{{ file.type }} <em>Новый</em></span>
                        </button>
                      }
                    </div>
                  </section>
                }

                @if (message.state === 'stopped') {
                  <p class="note">Ответ остановлен.</p>
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
              <div class="row center">
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
            <div class="row">
              @for (file of files(); track file) {
                <kn-chip size="sm" removable (removed)="detach(file)">{{ file }}</kn-chip>
              }
            </div>
          }
          <div class="box">
            <textarea
              #input
              knTextarea
              autosize
              class="field"
              aria-label="Сообщение агенту"
              placeholder="Напишите сообщение…"
              [minRows]="1"
              [maxRows]="8"
              [value]="draft()"
              (input)="draft.set(input.value)"
              (keydown.enter)="onEnter($event)"
            ></textarea>
            @if (busy()) {
              <button
                kn-icon-button
                type="button"
                size="sm"
                variant="soft"
                tone="neutral"
                aria-label="Остановить ответ"
                knTooltip="Остановить"
                (click)="stop()"
              >
                <span class="stop" aria-hidden="true"></span>
              </button>
            } @else {
              <button
                kn-icon-button
                type="submit"
                size="sm"
                [variant]="draft().trim() ? 'solid' : 'ghost'"
                [tone]="draft().trim() ? 'accent' : 'neutral'"
                aria-label="Отправить"
                [disabled]="!draft().trim()"
              >
                <kn-icon name="arrow-up" />
              </button>
            }
          </div>

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
            <button
              kn-icon-button
              type="button"
              size="sm"
              variant="ghost"
              tone="neutral"
              aria-label="Инструменты агента"
              knTooltip="Инструменты"
              (click)="soon('Инструменты агента')"
            >
              <kn-icon name="sliders" />
            </button>
            <button
              class="folder"
              kn-button
              type="button"
              size="sm"
              variant="ghost"
              tone="neutral"
              (click)="soon('Рабочая папка')"
            >
              <kn-icon name="folder" /> Рабочая папка
            </button>
            <span class="grow"></span>
            <span class="context">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" />
                <circle class="used" cx="10" cy="10" r="7.5" pathLength="100" />
              </svg>
              <span>13%</span>
              <span class="sr">контекста занято</span>
            </span>
            <button
              class="model"
              kn-button
              type="button"
              size="sm"
              variant="ghost"
              tone="neutral"
              [knMenuTrigger]="modelMenu"
            >
              {{ model() }} <span class="effort">{{ effort() }}</span>
              <kn-icon name="chevron-down" />
            </button>
            <button
              class="auto"
              kn-button
              type="button"
              size="sm"
              variant="ghost"
              tone="neutral"
              knTooltip="Агент сам подтверждает свои действия"
              [attr.aria-pressed]="auto()"
              (click)="auto.set(!auto())"
            >
              Авто
            </button>
          </div>
        </form>
      </main>
    </div>

    <ng-template #inline let-parts>
      @for (part of parts; track $index) {
        @if (part.code) {
          <code>{{ part.text }}</code>
        } @else if (part.bold) {
          <strong>{{ part.text }}</strong>
        } @else {
          <span>{{ part.text }}</span>
        }
      }
    </ng-template>

    <ng-template #artifactsMenu>
      <kn-menu>
        <kn-menu-group label="Артефакты чата">
          @for (file of artifacts(); track file.name) {
            <button kn-menu-item (triggered)="openFile(file)">
              <kn-icon name="file" [size]="16" /> {{ file.name }}
            </button>
          } @empty {
            <button kn-menu-item disabled>В этом чате пока нет файлов</button>
          }
        </kn-menu-group>
      </kn-menu>
    </ng-template>

    <ng-template #modelMenu>
      <kn-menu>
        <kn-menu-group label="Модель">
          @for (item of models; track item) {
            <button kn-menu-item-radio [checked]="item === model()" (triggered)="model.set(item)">
              {{ item }}
            </button>
          }
        </kn-menu-group>
        <kn-menu-group label="Глубина рассуждений">
          @for (item of efforts; track item) {
            <button kn-menu-item-radio [checked]="item === effort()" (triggered)="effort.set(item)">
              {{ item }}
            </button>
          }
        </kn-menu-group>
      </kn-menu>
    </ng-template>
  `,
  styles: `
    /* The whole screen is one window: a rail of navigation and the chat next to it */
    .shell {
      display: flex;
      max-inline-size: 96rem;
      block-size: calc(100dvh - 6.5rem);
      min-block-size: 32rem;
      margin: 0 auto var(--kn-space-4);
      inline-size: calc(100% - 2 * var(--kn-space-6));
      border-radius: var(--kn-radius-xl);
      background: var(--kn-color-surface);
      backdrop-filter: var(--kn-surface-filter);
      -webkit-backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-elevation-card);
      overflow: hidden;
    }

    /* The rail is the same sidebar component, flattened with its own variables */
    .rail {
      display: flex;
      flex: none;
    }

    .side {
      --kn-sidebar-width: 17.5rem;
      --kn-sidebar-radius: 0;
      --kn-sidebar-bg: var(--kn-color-surface-subtle);
      --kn-sidebar-shadow: inset -1px 0 0 0 var(--kn-color-border);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      padding: var(--kn-space-1) var(--kn-space-1) var(--kn-space-3);
      font-weight: var(--kn-weight-semibold);
    }

    .brand-name {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mark {
      flex: none;
      display: grid;
      place-items: center;
      inline-size: 1.75rem;
      block-size: 1.75rem;
      border-radius: var(--kn-radius-md);
      background: var(--kn-color-accent);
      color: var(--kn-color-on-accent);
    }

    .mark.large {
      inline-size: 3rem;
      block-size: 3rem;
      border-radius: var(--kn-radius-lg);
    }

    .new {
      display: grid;
      place-items: center;
      inline-size: 1.25rem;
      block-size: 1.25rem;
      border-radius: 50%;
      background: var(--kn-color-accent);
      color: var(--kn-color-on-accent);
    }

    .search {
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
      margin-block: var(--kn-space-3) var(--kn-space-2);
      padding: var(--kn-space-2) var(--kn-space-3);
      border-radius: var(--kn-radius-control);
      color: var(--kn-color-text-muted);
    }

    .search:focus-within {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
    }

    .search input {
      flex: 1;
      min-inline-size: 0;
      padding: 0;
      border: 0;
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      outline: none;
    }

    .search input::placeholder {
      color: var(--kn-color-text-muted);
      opacity: 1;
    }

    .chats {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      margin-block-start: var(--kn-space-3);
    }

    /* "Yesterday" and "This week" fold: the heading itself is the button */
    .group-label,
    .fold {
      display: flex;
      align-items: center;
      gap: var(--kn-space-1);
      justify-self: start;
      min-block-size: 1.75rem;
      padding: 0 var(--kn-space-3);
      border: 0;
      border-radius: var(--kn-radius-sm);
      background: none;
      color: var(--kn-color-text-muted);
      font: inherit;
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-medium);
    }

    .fold {
      cursor: pointer;
    }

    .fold:hover {
      color: var(--kn-color-text);
    }

    .fold kn-icon {
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .fold[aria-expanded='true'] kn-icon {
      transform: rotate(90deg);
    }

    .fold:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
    }

    .list {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--kn-space-0-5);
    }

    .none {
      margin: var(--kn-space-2) var(--kn-space-3);
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    /* Collapsed to icons: everything that is only text steps aside */
    .collapsed .brand-name,
    .collapsed .brand .mark,
    .collapsed .search,
    .collapsed .chats,
    .collapsed .none {
      display: none;
    }

    .collapsed .brand {
      justify-content: center;
      padding-inline: 0;
    }

    .main {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-inline-size: 0;
    }

    .top {
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
      padding: var(--kn-space-3) var(--kn-space-5);
    }

    h1 {
      flex: 1;
      min-inline-size: 0;
      margin: 0;
      font-size: var(--kn-text-md);
      font-weight: var(--kn-weight-semibold);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .switch {
      display: none;
      flex: 1;
      min-inline-size: 0;
    }

    .pill {
      --kn-button-radius: 999px;
    }

    .user {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-medium);
      white-space: nowrap;
    }

    /* The thread is the only part that scrolls; the composer stays where the hands are */
    .thread {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--kn-space-8);
      min-block-size: 0;
      padding: var(--kn-space-4) var(--kn-space-5) var(--kn-space-8);
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    .thread:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
    }

    .message,
    .composer {
      box-sizing: border-box;
      inline-size: 100%;
      max-inline-size: 52rem;
      margin-inline: auto;
    }

    .message {
      display: grid;
      gap: var(--kn-space-3);
      line-height: var(--kn-leading-normal);
      animation: kn-stagger-in var(--kn-duration-normal) var(--kn-ease-out);
    }

    .message p {
      margin: 0;
      overflow-wrap: anywhere;
    }

    /* The person's words sit in a bubble on the trailing side; the agent's are plain text */
    .message.user {
      justify-items: end;
    }

    .message.user p {
      max-inline-size: min(36rem, 88%);
      padding: var(--kn-space-3) var(--kn-space-5);
      border-radius: var(--kn-radius-2xl);
      background: var(--kn-color-surface-sunken);
      white-space: pre-line;
    }

    .who {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
    }

    .who .mark {
      inline-size: 1.5rem;
      block-size: 1.5rem;
      border-radius: var(--kn-radius-sm);
    }

    .who time {
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    /* "Worked for 4 min, 9 tools": one quiet line that opens the list of steps */
    .work {
      border-block-end: 1px solid var(--kn-color-border);
    }

    .work-toggle {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      inline-size: 100%;
      padding: var(--kn-space-1) 0 var(--kn-space-3);
      border: 0;
      border-radius: var(--kn-radius-sm);
      background: none;
      color: var(--kn-color-text-muted);
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    .work-text {
      flex: 1;
    }

    .work-toggle:focus-visible,
    .all:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: 2px;
    }

    .chevron {
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .work-toggle[aria-expanded='true'] .chevron {
      transform: rotate(180deg);
    }

    .work ol {
      display: grid;
      gap: var(--kn-space-2);
      margin: 0;
      padding: 0 0 var(--kn-space-4);
      list-style: none;
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    .work li {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      animation: kn-stagger-in var(--kn-duration-normal) var(--kn-ease-out);
    }

    .work li kn-icon {
      color: var(--kn-color-success);
    }

    .prose {
      display: grid;
      gap: var(--kn-space-3);
    }

    .prose > * {
      animation: kn-stagger-in var(--kn-duration-slow) var(--kn-ease-out);
    }

    .prose h2 {
      margin: var(--kn-space-1) 0 0;
      font-size: inherit;
      font-weight: var(--kn-weight-semibold);
    }

    .prose ul {
      display: grid;
      gap: var(--kn-space-2);
      margin: 0;
      padding-inline-start: var(--kn-space-6);
    }

    .prose li::marker {
      color: var(--kn-color-accent);
    }

    .prose code {
      padding: 0.1em 0.4em;
      border-radius: var(--kn-radius-xs);
      background: var(--kn-color-surface-sunken);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
      font-family: var(--kn-font-mono);
      font-size: 0.875em;
      font-weight: var(--kn-weight-regular);
    }

    .files {
      display: grid;
      gap: var(--kn-space-3);
      margin-block-start: var(--kn-space-2);
      animation: kn-stagger-in var(--kn-duration-slow) var(--kn-ease-out);
    }

    .files-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--kn-space-3);
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    .files-head b {
      margin-inline-start: var(--kn-space-1);
      font-weight: var(--kn-weight-medium);
    }

    .all {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-1);
      padding: 0;
      border: 0;
      border-radius: var(--kn-radius-xs);
      background: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    .all:hover {
      color: var(--kn-color-text);
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
      gap: var(--kn-space-3);
    }

    .cards button {
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    /* A file has no real preview here: the thumbnail is a few bars of its "content" */
    .thumb {
      box-sizing: border-box;
      padding: 1.375rem var(--kn-space-4);
      background: var(--kn-color-accent-soft);
    }

    .thumb i {
      display: block;
      block-size: 0.375rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--kn-color-accent) 30%, transparent);
    }

    .thumb i + i {
      margin-block-start: 0.375rem;
    }

    .thumb i:nth-child(1) {
      inline-size: 46%;
      background: var(--kn-color-accent);
    }

    .thumb i:nth-child(3) {
      inline-size: 82%;
    }

    .thumb i:nth-child(4) {
      inline-size: 64%;
    }

    .file-name,
    .file-meta {
      display: block;
      padding-inline: var(--kn-space-3);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-name {
      padding-block-start: var(--kn-space-2);
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-medium);
    }

    .file-meta {
      padding-block-end: var(--kn-space-3);
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-xs);
    }

    .file-meta em {
      margin-inline-start: var(--kn-space-1);
      color: var(--kn-color-success-text, var(--kn-color-success));
      font-style: normal;
      font-weight: var(--kn-weight-medium);
    }

    .file-meta em::before {
      content: '';
      display: inline-block;
      inline-size: 0.375rem;
      block-size: 0.375rem;
      margin-inline-end: var(--kn-space-1);
      border-radius: 50%;
      background: var(--kn-color-success);
      vertical-align: middle;
    }

    .note {
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    .actions {
      display: flex;
      gap: var(--kn-space-1);
    }

    .welcome {
      display: grid;
      justify-items: center;
      gap: var(--kn-space-4);
      margin: auto;
      padding: var(--kn-space-6);
      text-align: center;
    }

    .welcome h2 {
      margin: 0;
      font-size: var(--kn-text-2xl);
      font-weight: 650;
      letter-spacing: var(--kn-tracking-tight);
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-2);
    }

    .row.center {
      justify-content: center;
    }

    .composer {
      display: grid;
      gap: var(--kn-space-2);
      padding: 0 var(--kn-space-5) var(--kn-space-3);
    }

    /* The field is the textarea and the send button in one outline */
    .box {
      display: flex;
      align-items: flex-end;
      gap: var(--kn-space-2);
      padding: var(--kn-space-2) var(--kn-space-2) var(--kn-space-2) var(--kn-space-4);
      border-radius: var(--kn-radius-lg);
      background: var(--kn-color-field);
      box-shadow:
        inset 0 0 0 1px var(--kn-color-control-border),
        var(--kn-shadow-sm);
    }

    .box:has(.field:focus-visible) {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
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
      --kn-field-padding: 0;
      flex: 1;
      min-block-size: 0;
    }

    .stop {
      inline-size: 0.625rem;
      block-size: 0.625rem;
      border-radius: 2px;
      background: currentColor;
    }

    .tools {
      display: flex;
      align-items: center;
      gap: var(--kn-space-1);
      min-inline-size: 0;
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    .picker,
    .sr {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .grow {
      flex: 1;
    }

    .context {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-1-5);
      padding-inline: var(--kn-space-2);
    }

    .context svg {
      inline-size: 1.125rem;
      block-size: 1.125rem;
      transform: rotate(-90deg);
    }

    .context circle {
      fill: none;
      stroke: var(--kn-color-track);
      stroke-width: 2.5;
    }

    .context .used {
      stroke: var(--kn-color-accent);
      stroke-dasharray: 13 100;
      stroke-linecap: round;
    }

    .effort {
      color: var(--kn-color-text-muted);
      font-weight: var(--kn-weight-regular);
    }

    .auto[aria-pressed='true'] {
      --kn-button-color: var(--kn-color-success-text, var(--kn-color-success));
    }

    @media (max-width: 60rem) {
      .shell {
        inline-size: calc(100% - 2 * var(--kn-space-3));
      }

      .rail,
      h1,
      .user-name,
      .pill-text,
      .folder,
      .effort {
        display: none;
      }

      .switch {
        display: block;
      }

      .top,
      .thread,
      .composer {
        padding-inline: var(--kn-space-3);
      }

      .cards {
        grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
      }
    }
  `,
})
export default class ChatExample {
  private readonly toaster = inject(KnToaster);
  private readonly clipboard = inject(Clipboard);
  private readonly thread = viewChild.required<ElementRef<HTMLElement>>('thread');
  private readonly input = viewChild.required<ElementRef<HTMLTextAreaElement>>('input');

  protected readonly agent = AGENT;
  protected readonly models = MODELS;
  protected readonly efforts = EFFORTS;
  protected readonly suggestions = [
    'Сверь счета за октябрь с выпиской банка',
    'Напиши напоминание «Гринфилду»',
    'С чего начать закрытие месяца?',
  ];

  protected readonly conversations = signal<Conversation[]>(INITIAL);
  protected readonly activeId = signal(1);
  protected readonly collapsed = signal(false);
  protected readonly query = signal('');
  protected readonly draft = signal('');
  protected readonly files = signal<string[]>([]);
  protected readonly busy = signal(false);
  protected readonly model = signal(MODELS[0]);
  protected readonly effort = signal(EFFORTS[1]);
  protected readonly auto = signal(true);
  /** Folded groups of chats that are open, and answers whose steps are open. */
  protected readonly open = signal(new Set<GroupId>());
  protected readonly opened = signal(new Set<number>());

  protected readonly active = computed(
    () =>
      this.conversations().find((item) => item.id === this.activeId()) ?? this.conversations()[0],
  );
  protected readonly groups = computed(() => {
    const query = this.query().trim().toLowerCase();
    return GROUPS.map((group) => ({
      ...group,
      items: this.conversations().filter(
        (item) => item.group === group.id && item.title.toLowerCase().includes(query),
      ),
    })).filter((group) => group.items.length);
  });
  /** Every file the agent has produced in this chat. */
  protected readonly artifacts = computed(() =>
    this.active().messages.flatMap((message) =>
      message.state === 'done' ? (message.artifacts ?? []) : [],
    ),
  );

  private nextId = 1000;
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

  protected visible(message: Message): Block[] {
    return (message.blocks ?? []).slice(0, message.shown ?? 0);
  }

  protected select(id: unknown): void {
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
        { id, title: 'Новый чат', group: 'today', messages: [] },
        ...list,
      ]);
      this.activeId.set(id);
    }
    this.query.set('');
    this.input().nativeElement.focus();
  }

  protected toggleGroup(id: GroupId): void {
    this.open.update((current) => flip(current, id));
  }

  protected toggleWork(id: number): void {
    this.opened.update((current) => flip(current, id));
  }

  protected onEnter(event: Event): void {
    if ((event as KeyboardEvent).shiftKey) return;
    event.preventDefault();
    this.send(this.draft());
  }

  protected send(raw: string): void {
    const text = raw.trim();
    if (!text || this.busy()) return;
    const attached = this.files();
    const conversation = this.active();
    this.patch(conversation.id, (item) => ({
      ...item,
      // A new chat is named after its first question
      title: item.messages.length ? item.title : text,
      messages: [
        ...item.messages,
        { id: this.nextId++, role: 'user', text, attached: attached.length ? attached : undefined },
      ],
    }));
    this.draft.set('');
    this.input().nativeElement.value = '';
    this.files.set([]);
    this.pinned = true;
    this.answer(
      conversation.id,
      SCRIPTS.findIndex((item) => item.match.test(text)),
    );
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
        ? { ...message, state: 'stopped', work: 'Остановлен' }
        : message,
    );
  }

  protected copy(message: Message): void {
    const text = (message.blocks ?? [])
      .map((block) =>
        block.kind === 'ul'
          ? block.items.map((item) => `• ${plain(item)}`).join('\n')
          : plain(block.spans),
      )
      .join('\n\n');
    if (this.clipboard.copy(text)) this.toaster.success('Ответ скопирован');
  }

  protected openFile(file: Artifact): void {
    this.toaster.show({
      title: file.name,
      description: 'В настоящем приложении здесь открылся бы файл.',
    });
  }

  protected soon(title: string): void {
    this.toaster.show({ title, description: 'Этот раздел в примере не оживлён.' });
  }

  protected report(): void {
    this.toaster.success('Спасибо, сообщение отправлено');
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

  /** Plays a scripted answer: the steps tick off, then the answer arrives block by block. */
  private answer(conversationId: number, script: number): void {
    const { steps, work, blocks, artifacts } = SCRIPTS[script];
    const id = this.nextId++;
    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const time = new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' }).format(
      new Date(),
    );
    const set = (change: Partial<Message>): void =>
      this.update(conversationId, (message) =>
        message.id === id ? { ...message, ...change } : message,
      );

    this.busy.set(true);
    this.patch(conversationId, (item) => ({
      ...item,
      messages: [
        ...item.messages,
        {
          id,
          role: 'agent',
          text: '',
          time,
          blocks,
          shown: 0,
          steps,
          stepsDone: 0,
          work,
          artifacts,
          script,
          state: 'working',
        },
      ],
    }));

    let at = 0;
    const later = (delay: number, run: () => void): void => {
      at += reduced ? 0 : delay;
      this.timers.push(setTimeout(run, at));
    };
    steps.forEach((_, index) => later(800, () => set({ stepsDone: index + 1 })));
    later(200, () => set({ state: 'writing' }));
    // With reduced motion the timers all fire at once: the answer appears whole
    blocks.forEach((_, index) => later(260, () => set({ shown: index + 1 })));
    later(200, () => {
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

const plain = (parts: Span[]): string => parts.map((part) => part.text).join('');

function flip<T>(current: Set<T>, value: T): Set<T> {
  const next = new Set(current);
  if (!next.delete(value)) next.add(value);
  return next;
}
