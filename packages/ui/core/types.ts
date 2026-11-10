/** Размеры, общие для всех интерактивных компонентов. */
export type KnSize = 'sm' | 'md' | 'lg';

/** Смысловая окраска для бейджей, тостов, прогресса и т. п. */
export type KnTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

/** Сторона, с которой оверлей прикрепляется к якорю. `start`/`end` учитывают RTL. */
export type KnSide = 'top' | 'bottom' | 'start' | 'end';

/** Положение оверлея: сторона и необязательное выравнивание вдоль неё. */
export type KnPlacement = KnSide | `${KnSide}-start` | `${KnSide}-end`;
