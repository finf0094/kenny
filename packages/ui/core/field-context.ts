import { InjectionToken, Signal } from '@angular/core';

/**
 * Contract between `<kn-field>` and the control projected into it.
 * The field owns the ids; the control applies them to its focusable element.
 */
export interface KnFieldContext {
  /** id for the focusable element, referenced by `<label for>`. */
  readonly controlId: string;
  /** id of the label element, for `aria-labelledby` on non-labelable controls. */
  readonly labelId: string;
  /** id of the hint or error text currently shown, if any. */
  readonly describedBy: Signal<string | null>;
  /** True while the field shows an error. */
  readonly invalid: Signal<boolean>;
}

export const KN_FIELD = new InjectionToken<KnFieldContext>('KN_FIELD');
