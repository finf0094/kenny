import { data } from '../../generated/motion';
import { ComponentDoc } from '../core/doc-types';
import Demo from '../demos/motion/reveal.demo';

export default {
  slug: 'reveal',
  title: 'Reveal',
  entry: 'motion',
  apiClasses: ['KnReveal'],
  description:
    'Появление содержимого, когда оно попадает в окно просмотра: подъём, проявление, масштаб или сдвиг. Срабатывает один раз.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'reveal',
      title: 'Карточки в прокручиваемой области',
      description:
        'knRevealIndex сдвигает появление соседних элементов на шаг — получается каскад. То, что видно сразу после загрузки, директива не трогает.',
      component: Demo,
    },
  ],
  a11y: [
    'Содержимое остаётся в DOM и в дереве доступности: скрыта только отрисовка до появления.',
    'Без JavaScript и до гидратации всё видно сразу — директива прячет лишь то, что ещё ниже края экрана.',
    'При prefers-reduced-motion директива ничего не делает.',
    'Используйте умеренно: один каскад на экран запоминается, появление каждого блока утомляет.',
  ],
} satisfies ComponentDoc;
