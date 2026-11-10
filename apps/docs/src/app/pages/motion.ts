import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnCheckbox } from '@kenny/ui/checkbox';
import { KnCollapse } from '@kenny/ui/collapse';
import { KnSwitch } from '@kenny/ui/switch';
import { KnTab, KnTabs } from '@kenny/ui/tabs';
import { DocsCode } from '../core/code-block';

const CURVES = [
  { token: '--kn-ease-standard', name: 'standard', use: 'Наведение, смена цвета слоя, простые появления.' },
  { token: '--kn-ease-out', name: 'out', use: 'Раскрытие высоты, выезд панелей, каскад списков.' },
  { token: '--kn-ease-spring', name: 'spring', use: 'То, что пользователь двигает: переключатель, индикатор вкладок, окна.' },
  { token: '--kn-ease-spring-bouncy', name: 'spring-bouncy', use: 'Мелкие подтверждения: галочка, отметка шага.' },
];

const DURATIONS = [
  { token: '--kn-duration-instant', value: '80 мс', use: 'Отклик на нажатие.' },
  { token: '--kn-duration-fast', value: '140 мс', use: 'Наведение, закрытие оверлеев.' },
  { token: '--kn-duration-normal', value: '220 мс', use: 'Открытие меню и поповеров, смена панели.' },
  { token: '--kn-duration-slow', value: '360 мс', use: 'Пружины, диалоги, раскрытие высоты.' },
  { token: '--kn-duration-slower', value: '560 мс', use: 'Редкие крупные переходы.' },
];

@Component({
  imports: [DocsCode, KnButton, KnSwitch, KnCheckbox, KnTabs, KnTab, KnCollapse],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose">
      <h1>Motion</h1>
      <p class="lead">
        У движения в Kenny одна задача — показать, что изменилось и откуда оно взялось. Всё остальное
        вырезано.
      </p>

      <h2 id="rules">Правила</h2>
      <ul>
        <li>
          <strong>Только <code>transform</code> и <code>opacity</code>.</strong> Они не вызывают пересчёта
          раскладки и идут на композиторе. Наведение — это прозрачность отдельного слоя, а не перекраска
          заливки.
        </li>
        <li>
          <strong>Частое — быстро.</strong> Наведение и нажатие укладываются в 80–140 мс. Меню закрывается
          мгновенно: после выбора пункта ждать нечего.
        </li>
        <li>
          <strong>Выход короче входа.</strong> Поверхность появляется за 220–360 мс и уходит за 140: интерфейс
          не должен задерживать человека, который уже принял решение.
        </li>
        <li>
          <strong>Пружины — для прямого действия.</strong> Переключатель, индикатор вкладок, галочка
          подчиняются руке и слегка перелетают цель. Информационные переходы идут по обычным кривым.
        </li>
        <li>
          <strong>Одна система.</strong> Длительности и кривые — токены. Компоненты не содержат собственных
          чисел, поэтому характер движения меняется в одном месте.
        </li>
      </ul>

      <h2 id="curves">Кривые</h2>
      <p>Запустите и сравните: одинаковое расстояние, одинаковые 560 мс, разные кривые.</p>
      <div class="lab">
        <button kn-button size="sm" variant="soft" (click)="moved.set(!moved())">
          {{ moved() ? 'Вернуть' : 'Запустить' }}
        </button>
        @for (curve of curves; track curve.token) {
          <div class="lane">
            <code>{{ curve.name }}</code>
            <div class="track">
              <span class="ball" [class.moved]="moved()" [style.transition-timing-function]="'var(' + curve.token + ')'"></span>
            </div>
          </div>
        }
      </div>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Токен</th>
              <th scope="col">Где используется</th>
            </tr>
          </thead>
          <tbody>
            @for (curve of curves; track curve.token) {
              <tr>
                <th scope="row"><code>{{ curve.token }}</code></th>
                <td>{{ curve.use }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p>
        Пружины записаны функцией <code>linear()</code> — это отсчёты настоящего затухающего колебания
        (коэффициент затухания 0,62 и 0,45), а не приближение кривой Безье.
      </p>

      <h2 id="durations">Длительности</h2>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Токен</th>
              <th scope="col">Значение</th>
              <th scope="col">Где используется</th>
            </tr>
          </thead>
          <tbody>
            @for (duration of durations; track duration.token) {
              <tr>
                <th scope="row"><code>{{ duration.token }}</code></th>
                <td>{{ duration.value }}</td>
                <td>{{ duration.use }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <h2 id="micro">Микровзаимодействия</h2>
      <p>Нажмите на каждый элемент. Ползунок растягивается под пальцем, галочка появляется с перелётом, индикатор вкладок переезжает.</p>
      <div class="stage kn-wallpaper-sm">
        <kn-switch [checked]="true">Переключатель</kn-switch>
        <kn-checkbox [checked]="true">Флажок</kn-checkbox>
        <kn-tabs size="sm" aria-label="Пример вкладок" style="--kn-tabs-gap: var(--kn-space-2)">
          <kn-tab value="1" label="Один">Первая панель</kn-tab>
          <kn-tab value="2" label="Два">Вторая панель</kn-tab>
          <kn-tab value="3" label="Три">Третья панель</kn-tab>
        </kn-tabs>
        <button kn-button>Кнопка</button>
      </div>

      <h2 id="height">Высота</h2>
      <p>
        Высоту нельзя анимировать через <code>transform</code>, не исказив содержимое. Вместо измерений в
        JavaScript <code>&lt;kn-collapse&gt;</code> анимирует строку сетки от <code>0fr</code> до
        <code>1fr</code> — это единственное исключение из правила «только transform и opacity», и оно
        ограничено одним компонентом. На нём стоят Accordion, Panel и стопка Toast.
      </p>
      <div class="collapse-demo">
        <button kn-button size="sm" variant="soft" [attr.aria-expanded]="open()" (click)="open.set(!open())">
          {{ open() ? 'Свернуть' : 'Развернуть' }}
        </button>
        <kn-collapse [open]="open()">
          <p>
            Содержимое любой высоты. Пока блок свёрнут, оно помечено <code>inert</code>: до него нельзя
            дойти клавишей Tab, и скринридер его не читает.
          </p>
        </kn-collapse>
      </div>

      <h2 id="enter-exit">Вход и выход оверлеев</h2>
      <p>
        Вход — обычная CSS-анимация, которая играет при вставке элемента. Для выхода компонент ставит
        атрибут <code>data-kn-state="closing"</code>, дожидается окончания анимаций через Web Animations API
        и только потом удаляет элемент. Общие keyframes (<code>kn-pop-in</code>, <code>kn-rise-in</code>,
        <code>kn-slide-in</code> и парные <code>-out</code>) лежат в токенах.
      </p>
      <docs-code snippet="motion-usage.css" label="Использование токенов движения" />

      <h2 id="stagger">Каскад</h2>
      <p>
        Строки таблицы и пункты палитры появляются друг за другом с шагом <code>--kn-stagger</code> (28 мс).
        Каскад играет один раз — при появлении списка, а не при каждом обновлении.
      </p>
      <div class="stagger-demo">
        <button kn-button size="sm" variant="soft" (click)="replay()">Проиграть ещё раз</button>
        @if (listVisible()) {
          <ul>
            @for (item of items; track item; let i = $index) {
              <li [style.--kn-index]="i">{{ item }}</li>
            }
          </ul>
        }
      </div>
      <docs-code snippet="motion-stagger.html" label="Каскад в собственном списке" />

      <h2 id="reduced">Уменьшение движения</h2>
      <p>
        При <code>prefers-reduced-motion: reduce</code> токены длительности становятся практически нулевыми —
        и вместе с ними все переходы библиотеки и ваши собственные, если они используют токены. Остаются
        только индикаторы ожидания: Spinner и неопределённый Progress замедляются, но не останавливаются,
        потому что движение в них и есть сообщение.
      </p>
    </article>
  `,
  styles: `
    .lab {
      display: grid;
      gap: var(--kn-space-3);
      justify-items: start;
      padding: var(--kn-space-5);
      border-radius: var(--kn-radius-lg);
      background: var(--kn-color-surface-sunken);
    }

    .lane {
      display: grid;
      grid-template-columns: 8rem 1fr;
      align-items: center;
      gap: var(--kn-space-3);
      inline-size: 100%;
    }

    .track {
      --_ball: 1.5rem;
      container-type: inline-size;
      block-size: var(--_ball);
      border-radius: var(--kn-radius-full);
      background: var(--kn-color-border);
    }

    .ball {
      display: block;
      inline-size: var(--_ball);
      block-size: var(--_ball);
      border-radius: 50%;
      background: var(--kn-color-accent);
      transition: transform var(--kn-duration-slower);
    }

    .ball.moved {
      transform: translateX(calc((100cqi - var(--_ball)) * var(--kn-dir)));
    }

    .stage {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-8);
      padding: var(--kn-space-8);
      border-radius: var(--kn-radius-lg);
    }

    .collapse-demo,
    .stagger-demo {
      display: grid;
      gap: var(--kn-space-3);
      justify-items: start;
    }

    .collapse-demo p {
      margin: 0;
      padding: var(--kn-space-4);
      border-radius: var(--kn-radius-md);
      background: var(--kn-color-surface-sunken);
    }

    .stagger-demo ul {
      display: grid;
      gap: var(--kn-space-1);
      margin: 0;
      padding: 0;
      list-style: none;
      inline-size: min(100%, 20rem);
    }

    .stagger-demo li {
      padding: var(--kn-space-2) var(--kn-space-3);
      border-radius: var(--kn-radius-sm);
      background: var(--kn-color-surface-sunken);
      animation: kn-stagger-in var(--kn-duration-normal) var(--kn-ease-out) backwards;
      animation-delay: calc(var(--kn-index) * var(--kn-stagger));
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
  `,
})
export default class MotionPage {
  protected readonly curves = CURVES;
  protected readonly durations = DURATIONS;
  protected readonly moved = signal(false);
  protected readonly open = signal(false);
  protected readonly listVisible = signal(true);
  protected readonly items = ['Входящие', 'Черновики', 'Отправленные', 'Архив', 'Корзина'];

  protected replay(): void {
    this.listVisible.set(false);
    setTimeout(() => this.listVisible.set(true));
  }
}
