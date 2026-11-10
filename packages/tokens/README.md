# @kenny/tokens

Дизайн-токены Kenny в виде CSS custom properties: цвет (светлая и тёмная темы), стекло,
типографика, отступы, радиусы, тени, z-index и motion.

```css
@import '@kenny/tokens/kenny.css'; /* токены + базовые стили страницы */
/* или по отдельности */
@import '@kenny/tokens/tokens.css';
@import '@kenny/tokens/base.css';
```

Тема выбирается атрибутом `data-theme="light" | "dark"` на любом элементе; без атрибута
используется системная. Перекрасить акцент можно, переопределив шкалу `--kn-accent-50 … 950`.

`tokens.json` содержит тот же список в машиночитаемом виде.
