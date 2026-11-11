import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KnStyleLoader } from './style-loader';

/**
 * The look of a field — the "well" of an input, a select, a combobox or a date picker.
 * It is defined once, as the global class `kn-control`, so that every field reacts to the
 * same tokens and a style preset can restyle all of them with one selector.
 *
 * Tokens: `--kn-color-field`, `--kn-color-field-border`, `--kn-color-field-border-hover`,
 * `--kn-color-field-underline`, `--kn-field-border-width`, `--kn-field-underline-width`,
 * `--kn-field-underline-focus-width`, `--kn-field-focus-width`, `--kn-field-halo-width`,
 * `--kn-field-shadow`, `--kn-radius-field`,
 * `--kn-radius-field-sm`, `--kn-size-sm|md|lg`. Set a token on one field to change only it.
 *
 * States are written with `:where()`: zero specificity, so any rule of yours wins.
 */
const controlStyles = `
  .kn-control {
    --_h: var(--kn-size-md);
    --_r: var(--kn-radius-field);
    --_line: var(--kn-color-field-border);
    --_underline: var(--kn-color-field-underline);
    --_underline-w: var(--kn-field-underline-width);
    --_focus: var(--kn-color-focus);

    box-sizing: border-box;
    min-inline-size: 0;
    block-size: var(--_h);
    border: 0;
    border-radius: var(--_r);
    background: var(--kn-color-field);
    box-shadow:
      inset 0 0 0 var(--kn-field-border-width) var(--_line),
      inset 0 calc(var(--_underline-w) * -1) 0 0 var(--_underline),
      var(--_halo, 0 0 0 0 transparent),
      var(--kn-field-shadow);
    color: var(--kn-color-text);
    font: inherit;
    font-size: var(--kn-text-md);
  }

  .kn-control:where([data-size='sm']) {
    --_h: var(--kn-size-sm);
    --_r: var(--kn-radius-field-sm);
    font-size: var(--kn-text-sm);
  }

  .kn-control:where([data-size='lg']) {
    --_h: var(--kn-size-lg);
    font-size: var(--kn-text-lg);
  }

  @media (hover: hover) {
    .kn-control:where(:hover:not(:disabled)) {
      --_line: var(--kn-color-field-border-hover);
      --_underline: var(--kn-color-field-border-hover);
    }
  }

  /* Focus: on the field itself, or on the text input inside a composite field */
  .kn-control:where(
    :focus-visible,
    [aria-expanded='true'],
    :has(:is(input, textarea):focus-visible)
  ) {
    --_underline: var(--_focus);
    --_underline-w: var(--kn-field-underline-focus-width);
    --_halo: 0 0 0 var(--kn-field-halo-width)
      color-mix(in srgb, var(--_focus) 20%, transparent);
    outline: var(--kn-field-focus-width) solid var(--_focus);
    outline-offset: -1px;
  }

  .kn-control:where(
    [aria-invalid='true'],
    [data-invalid],
    .ng-invalid.ng-touched,
    :has(> [aria-invalid='true'], > .ng-invalid.ng-touched)
  ) {
    --_line: var(--kn-color-danger);
    --_underline: var(--kn-color-danger);
    --_focus: var(--kn-color-danger);
    background: var(--kn-color-danger-soft);
  }

  .kn-control:where(:disabled, :has(> :is(input, textarea):disabled)) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* A field inside a composite field: the outer one draws the well */
  .kn-control .kn-control {
    flex: 1;
    block-size: 100%;
    padding: 0;
    border-radius: 0;
    background: none;
    box-shadow: none;
    outline: none;
    opacity: 1;
  }
`;

/** @internal Carries the global field styles; never rendered. */
@Component({
  selector: 'kn-control-styles',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: controlStyles,
})
export class KnControlStyles {}

/** Makes sure the `kn-control` styles are in the document. Call from an injection context. */
export function useControlStyles(): void {
  inject(KnStyleLoader).load(KnControlStyles);
}
