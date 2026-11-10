import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KnIcon } from '@kenny/ui/icon';
import { examples } from '../core/nav';

@Component({
  imports: [RouterLink, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="content" class="page">
      <h1>Примеры</h1>
      <p class="lead">
        Три рабочих экрана, собранных только из компонентов Kenny и токенов. Данные вымышленные, поведение
        настоящее: сортировка, формы с проверкой, перетаскивание.
      </p>
      <ul>
        @for (example of examples; track example.path) {
          <li>
            <a [routerLink]="example.path">
              <span class="icon"><kn-icon [name]="example.icon ?? 'file'" [size]="26" /></span>
              <span class="text">
                <strong>{{ example.title }}</strong>
                <span>{{ example.description }}</span>
              </span>
              <kn-icon class="arrow" name="chevron-right" />
            </a>
          </li>
        }
      </ul>
    </main>
  `,
  styles: `
    .page {
      max-inline-size: 52rem;
      margin-inline: auto;
      padding: var(--kn-space-8) var(--kn-space-6) var(--kn-space-16);
    }

    h1 {
      margin: 0;
      font-size: clamp(var(--kn-text-3xl), 5vw, var(--kn-text-5xl));
      font-weight: 680;
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .lead {
      margin: var(--kn-space-5) 0 var(--kn-space-10);
      max-inline-size: 38rem;
      font-size: var(--kn-text-lg);
      line-height: var(--kn-leading-relaxed);
      color: var(--kn-color-text-muted);
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      border-radius: var(--kn-radius-xl);
      background: var(--kn-glass-bg);
      backdrop-filter: var(--kn-glass-filter);
      -webkit-backdrop-filter: var(--kn-glass-filter);
      box-shadow: var(--kn-shadow-glass-md);
      overflow: hidden;
    }

    li + li {
      border-block-start: 1px solid var(--kn-color-border);
    }

    a {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--kn-space-5);
      padding: var(--kn-space-6);
      color: var(--kn-color-text);
      text-decoration: none;
    }

    a::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--kn-color-hover);
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    a:hover::before {
      opacity: 1;
    }

    a:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -3px;
      border-radius: var(--kn-radius-xl);
    }

    .icon {
      position: relative;
      display: grid;
      place-items: center;
      flex: none;
      inline-size: 3.5rem;
      block-size: 3.5rem;
      border-radius: var(--kn-radius-lg);
      background: var(--kn-color-accent);
      color: var(--kn-color-on-accent);
      box-shadow: inset 0 1px 0 0 rgb(255 255 255 / 0.25);
    }

    .text {
      position: relative;
      display: grid;
      gap: var(--kn-space-1);
      flex: 1;
    }

    strong {
      font-size: var(--kn-text-xl);
      letter-spacing: var(--kn-tracking-snug);
    }

    .text span {
      color: var(--kn-color-text-muted);
    }

    .arrow {
      position: relative;
      color: var(--kn-color-text-subtle);
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    a:hover .arrow {
      transform: translateX(calc(4px * var(--kn-dir)));
    }

    :host-context([dir='rtl']) .arrow {
      scale: -1 1;
    }
  `,
})
export default class ExamplesPage {
  protected readonly examples = examples;
}
