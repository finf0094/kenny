import { data } from '../../generated/tree';
import { ComponentDoc } from '../core/doc-types';
import Basic from '../demos/tree/basic.demo';

export default {
  slug: 'tree',
  title: 'Tree',
  entry: 'tree',
  description:
    'Иерархия с разворачиваемыми ветками: папки, разделы, структура. Данные — массив узлов; что раскрыто и что выбрано, хранит приложение.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Иконки, отключённые узлы и свой шаблон',
      description:
        'Нажатие выбирает узел и раскрывает ветку. Шаблон knTreeNode заменяет содержимое строки — например, чтобы добавить счётчик.',
      component: Basic,
    },
  ],
  slots: [
    {
      name: 'ng-template[knTreeNode]',
      description: 'Содержимое строки. Контекст: узел ($implicit), level и expanded.',
    },
  ],
  keyboard: [
    { keys: ['↓', '↑'], action: 'Следующий и предыдущий видимый узел; отключённые пропускаются.' },
    {
      keys: ['→'],
      action: 'Раскрывает ветку; на раскрытой — переходит к первому вложенному узлу.',
    },
    { keys: ['←'], action: 'Сворачивает ветку; на свёрнутой или на листе — переходит к родителю.' },
    { keys: ['Home', 'End'], action: 'Первый и последний видимый узел.' },
    { keys: ['Enter', 'Пробел'], action: 'Выбирает узел и раскрывает или сворачивает ветку.' },
    { keys: ['Буквы'], action: 'Переход к узлу, подпись которого начинается с набранного.' },
  ],
  a11y: [
    'Паттерн APG Tree View: role="tree" и role="treeitem" с aria-level, aria-posinset, aria-setsize, aria-expanded и aria-selected.',
    'Одна позиция табуляции на всё дерево; фокус перемещают стрелки. Перемещение фокуса ничего не выбирает.',
    'Дереву нужно имя: aria-label или aria-labelledby.',
    'В письме справа налево стрелки ← и → меняются местами, шеврон зеркалится.',
    'Отключённый узел виден и объявляется как недоступный, но не получает фокус.',
    'В своём шаблоне не размещайте интерактивные элементы: внутри treeitem до них не добраться с клавиатуры.',
  ],
} satisfies ComponentDoc;
