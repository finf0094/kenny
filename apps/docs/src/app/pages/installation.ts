import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../core/code-block';

@Component({
  imports: [RouterLink, DocsCode],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose">
      <h1>Установка</h1>
      <p class="lead">
        Два пакета Kenny и Angular CDK. Никаких схем и генераторов: импортируйте и используйте.
      </p>

      <h2 id="requirements">Требования</h2>
      <ul>
        <li>Angular 22.2 или новее и <code>&#64;angular/cdk</code> той же мажорной версии.</li>
        <li><code>&#64;angular/forms</code> — он нужен полям ввода.</li>
        <li>
          Браузеры 2024 года и новее: Chrome и Edge 123, Firefox 121, Safari 17.5. Библиотека
          опирается на
          <code>light-dark()</code>, <code>linear()</code>, <code>:has()</code> и единицы
          контейнера.
        </li>
      </ul>

      <h2 id="packages">Пакеты</h2>
      <docs-code snippet="install.sh" label="Установка" />
      <ul>
        <li>
          <code>&#64;kenny/ui</code> — компоненты. Каждый лежит в своей точке входа:
          <code>&#64;kenny/ui/button</code>.
        </li>
        <li>
          <code>&#64;kenny/tokens</code> — CSS-переменные, keyframes и базовые стили. Без
          JavaScript.
        </li>
      </ul>

      <h2 id="styles">Стили</h2>
      <p>Подключите токены один раз — в глобальном CSS или в <code>angular.json</code>.</p>
      <docs-code snippet="styles.css" label="Через CSS" />
      <docs-code snippet="angular-styles.json" label="Через angular.json" />
      <p>
        <code>kenny.css</code> — это <code>tokens.css</code> (переменные и keyframes) плюс
        <code>base.css</code> (фон и шрифт страницы, кольцо фокуса, подложка модальных окон). Если
        базовые стили у вас свои, возьмите только <code>tokens.css</code> и перенесите из
        <code>base.css</code> класс <code>.kn-overlay-scrim</code>.
      </p>
      <p>
        По умолчанию компоненты выглядят стеклянными. Другой характер — непрозрачные листы с
        рамками, тональные поверхности или плотный интерфейс — включается пресетом из того же
        пакета: см. <a routerLink="/docs/presets">Стили</a>.
      </p>

      <h2 id="font">Шрифт</h2>
      <p>
        Токен <code>--kn-font-sans</code> начинается с Onest, затем идёт системный стек. Сам шрифт
        библиотека не поставляет: подключите его любым способом (например,
        <code>&#64;fontsource-variable/onest</code>) или переопределите токен на свой.
      </p>

      <h2 id="providers">Иконки и сервисы</h2>
      <p>
        Иконки, нужные самим компонентам (галочка, шевроны, крестик, календарь), встроены. Остальные
        экспортируются поштучно и регистрируются по имени.
      </p>
      <docs-code snippet="app-config.ts" label="app.config.ts" />

      <h2 id="ssr">SSR и zoneless</h2>
      <ul>
        <li>
          Компоненты рендерятся на сервере: обращения к DOM отложены до
          <code>afterNextRender</code>, идентификаторы стабильны между сервером и клиентом. Этот
          сайт целиком пререндерится.
        </li>
        <li>
          Все компоненты — <code>OnPush</code> и обновляются через сигналы, поэтому работают без
          zone.js.
        </li>
        <li>
          Оверлеи (диалоги, меню, тосты) создаются только в браузере — по действию пользователя.
        </li>
      </ul>

      <h2 id="rtl">RTL</h2>
      <p>
        Раскладка написана логическими свойствами (<code>inline-start</code>,
        <code>margin-inline</code>), а направление анимаций и стрелок клавиатуры зависит от
        <code>dir</code>. Достаточно поставить <code>dir="rtl"</code> на
        <code>&lt;html&gt;</code> или на часть страницы.
      </p>
    </article>
  `,
})
export default class InstallationPage {}
