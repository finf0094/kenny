/** Размеры, общие для всех интерактивных компонентов. */
export type KnSize = 'sm' | 'md' | 'lg';

/** Смысловая окраска для бейджей, тостов, прогресса и т. п. */
export type KnTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

/** Сторона, с которой оверлей прикрепляется к якорю. `start`/`end` учитывают RTL. */
export type KnSide = 'top' | 'bottom' | 'start' | 'end';

/** Положение оверлея: сторона и необязательное выравнивание вдоль неё. */
export type KnPlacement = KnSide | `${KnSide}-start` | `${KnSide}-end`;

/** Варианты кнопки: закрашенная, мягкая, с контуром поверхности, без фона. */
export type KnButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';

/** Варианты карточки: поверхность, приподнятая поверхность, контур, без фона. */
export type KnCardVariant = 'surface' | 'raised' | 'outline' | 'plain';

/** Варианты вкладок: сегментированный переключатель или подчёркнутые вкладки. */
export type KnTabsVariant = 'segmented' | 'underline';

/** Варианты бейджа. */
export type KnBadgeVariant = 'soft' | 'solid' | 'outline';

/** Варианты панели инструментов: на поверхности или без фона. */
export type KnToolbarVariant = 'surface' | 'plain';
