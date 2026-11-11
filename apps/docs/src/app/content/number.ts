import { data } from '../../generated/motion';
import { ComponentDoc } from '../core/doc-types';
import Demo from '../demos/motion/number.demo';

export default {
  slug: 'number',
  title: 'Number',
  entry: 'motion',
  apiClasses: ['KnNumber'],
  description:
    'Число, которое докручивается до нового значения: суммы, счётчики, показатели. Форматирует через Intl.NumberFormat.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'number',
      title: 'Показатели',
      description:
        'Меняется значение — цифры доезжают до него за 0,9 секунды. Цифры моноширинные, поэтому соседний текст не дёргается.',
      component: Demo,
    },
  ],
  a11y: [
    'Скринридер получает итоговое значение сразу: промежуточные кадры скрыты через aria-hidden.',
    'При prefers-reduced-motion и на сервере выводится сразу итог.',
    'Первое появление не анимируется — страница не должна «проигрывать» себя при загрузке. Вход appear включает счёт от нуля там, где он уместен.',
    'Чтобы изменение объявлялось, оберните число в область с aria-live="polite".',
  ],
} satisfies ComponentDoc;
