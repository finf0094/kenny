import { data } from '../../generated/motion';
import { ComponentDoc } from '../core/doc-types';
import Demo from '../demos/motion/ripple.demo';

export default {
  slug: 'ripple',
  title: 'Ripple',
  entry: 'motion',
  apiClasses: ['KnRipple'],
  description:
    'Волна от точки нажатия. Встроена в кнопки, вкладки, пункты меню и списков, чипы и переключатели; включается токеном --kn-ripple-opacity, а не кодом.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'ripple',
      title: 'Один токен на всё',
      description:
        'По умолчанию токен равен нулю и волны нет. Задайте его в своём стиле, на блоке страницы или на одном компоненте. В стиле «Тональный» волна включена.',
      component: Demo,
    },
  ],
  a11y: [
    'Волна декоративна: её элемент скрыт через aria-hidden и не ловит указатель.',
    'Анимируются только transform и opacity. При prefers-reduced-motion волна не рисуется.',
    'Отключённые элементы на нажатие не отвечают.',
    'Цвет волны — цвет текста элемента; меняется переменной --kn-ripple-color.',
  ],
} satisfies ComponentDoc;
