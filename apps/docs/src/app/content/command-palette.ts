import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnCommandPalette } from '@kenny/ui/command-palette';
import { data } from '../../generated/command-palette';
import { ComponentDoc } from '../core/doc-types';
import { DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/command-palette/basic.demo';

@Component({
  imports: [DocsPlayground, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <button kn-button variant="outline" tone="neutral" (click)="palette.open()">
        Открыть палитру
      </button>
    </docs-playground>
  `,
})
class Playground {
  protected readonly palette = inject(KnCommandPalette);
  protected readonly placeholder = text('placeholder', 'Поиск по документации');
  protected readonly hotkey = toggle('hotkey', true);
  protected readonly controls = [this.placeholder, this.hotkey];
  protected readonly code = computed(
    () =>
      `provideKnCommandPalette({\n  placeholder: '${this.placeholder.value()}',${this.hotkey.value() ? '' : '\n  hotkey: false,'}\n  commands: [\n    { id: 'new', label: 'Новый документ', group: 'Действия', run: () => createDocument() },\n  ],\n})`,
  );

  constructor() {
    // The placeholder is live; the hotkey is bound once at startup, so the toggle only changes the snippet.
    effect(() => this.palette.placeholder.set(this.placeholder.value()));
  }
}

export default {
  slug: 'command-palette',
  title: 'Command Palette',
  entry: 'command-palette',
  description:
    'Поиск по действиям и разделам приложения с клавиатуры. Открывается по Ctrl+K или ⌘K. Поиск на этом сайте — та же палитра: нажмите сочетание прямо сейчас.',
  api: data.api,
  sources: data.sources,
  imports: ['KnCommandPalette', 'provideKnCommandPalette'],
  demos: [
    {
      source: 'basic',
      title: 'Команды, которые живут вместе с компонентом',
      description:
        'register() возвращает функцию отмены: команды страницы исчезают из палитры, когда пользователь с неё уходит.',
      component: Basic,
    },
  ],
  playground: Playground,
  keyboard: [
    { keys: ['Ctrl', 'K'], action: 'Открывает и закрывает палитру (⌘K на macOS).' },
    { keys: ['Буквы'], action: 'Фильтруют команды по названию, группе и ключевым словам.' },
    { keys: ['↓', '↑'], action: 'Следующая и предыдущая команда, по кругу.' },
    { keys: ['Enter'], action: 'Закрывает палитру и выполняет команду.' },
    { keys: ['Esc'], action: 'Закрывает палитру.' },
  ],
  a11y: [
    'Модальный диалог с полем role="combobox" и списком role="listbox"; активная команда передаётся через aria-activedescendant.',
    'Группы команд — role="group" с именем заголовка; подсказки о клавишах скрыты от скринридера.',
    'Команда выполняется после закрытия окна, поэтому фокус успевает вернуться на прежний элемент.',
    'Пункты появляются каскадом только при открытии; при наборе текста список обновляется без анимации.',
    'Горячая клавиша подключается через provideKnCommandPalette(); hotkey: false оставляет открытие за приложением.',
  ],
} satisfies ComponentDoc;
