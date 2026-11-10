import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../core/code-block';

@Component({
  imports: [DocsCode, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose">
      <h1>Начало работы</h1>
      <p class="lead">
        Kenny — библиотека компонентов для Angular 22. Она даёт готовые доступные контролы,
        стеклянный материал и одну систему движения на всё приложение. Единственная зависимость —
        Angular CDK.
      </p>

      <h2 id="principles">На чём она стоит</h2>
      <ul>
        <li>
          <strong>Нативные элементы там, где они есть.</strong> Кнопка — это
          <code>&lt;button&gt;</code>, флажок, переключатель и ползунок — настоящие
          <code>&lt;input&gt;</code>. Клавиатура, формы и скринридеры работают как в браузере, а не
          «почти так же».
        </li>
        <li>
          <strong>Signals везде.</strong> Входы, выходы и двусторонние привязки —
          <code>input()</code>, <code>output()</code> и <code>model()</code>. Приложение может
          работать без zone.js.
        </li>
        <li>
          <strong>Тема — это CSS.</strong> Все цвета, радиусы и длительности — custom properties.
          Тёмная тема, другой акцент или вложенная тема не требуют пересборки.
        </li>
        <li>
          <strong>Движение объясняет.</strong> Анимируются только <code>transform</code> и
          <code>opacity</code>; частые действия быстрые, а
          <code>prefers-reduced-motion</code> отключает всё одним блоком токенов.
        </li>
      </ul>

      <h2 id="quick-start">Три шага до первой кнопки</h2>
      <h3 id="step-install">1. Установите пакеты</h3>
      <docs-code snippet="install.sh" label="Установка" />
      <h3 id="step-styles">2. Подключите токены</h3>
      <p>Один файл содержит переменные обеих тем, keyframes и базовые стили страницы.</p>
      <docs-code snippet="styles.css" label="Подключение стилей" />
      <h3 id="step-component">3. Импортируйте компонент</h3>
      <p>
        У каждого компонента своя точка входа, поэтому в сборку попадает только то, что вы
        импортировали.
      </p>
      <docs-code snippet="first-component.ts" label="Первый компонент" />

      <h2 id="forms">Формы</h2>
      <p>
        Поля ввода работают тремя способами: с Reactive Forms, с signal forms и просто с сигналом
        через двустороннюю привязку. Реализация одна — <code>ControlValueAccessor</code> плюс
        <code>model()</code>.
      </p>
      <docs-code snippet="forms.ts" label="Три способа связать поле" />

      <h2 id="next">Куда дальше</h2>
      <ul>
        <li>
          <a routerLink="/docs/installation">Установка</a> — шрифт, иконки, SSR, поддержка
          браузеров.
        </li>
        <li>
          <a routerLink="/docs/theming">Темизация</a> — тёмная тема, свой акцент, переменные
          компонентов.
        </li>
        <li>
          <a routerLink="/components/button">Компоненты</a> — живые примеры, API и клавиатура
          каждого.
        </li>
        <li>
          <a routerLink="/examples">Примеры</a> — три экрана, целиком собранные из библиотеки.
        </li>
      </ul>
    </article>
  `,
})
export default class GettingStartedPage {}
