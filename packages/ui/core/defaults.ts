import { inject, InjectionToken, Provider } from '@angular/core';
import {
  KnBadgeVariant,
  KnButtonVariant,
  KnCardVariant,
  KnSize,
  KnTabsVariant,
  KnToolbarVariant,
} from './types';

/**
 * Default values of component inputs. A style is not only CSS: one look wants underlined
 * tabs and soft buttons, another — segmented tabs and solid ones. Set them once here
 * instead of repeating `variant="…"` in every template.
 */
export interface KnDefaults {
  /** Size of every component that has one, unless its own entry says otherwise. */
  size?: KnSize;
  button?: { variant?: KnButtonVariant; size?: KnSize };
  card?: { variant?: KnCardVariant };
  tabs?: { variant?: KnTabsVariant; size?: KnSize };
  badge?: { variant?: KnBadgeVariant };
  toolbar?: { variant?: KnToolbarVariant };
}

export const KN_DEFAULTS = new InjectionToken<KnDefaults>('KN_DEFAULTS', {
  providedIn: 'root',
  factory: () => ({}),
});

/**
 * Sets default input values for the whole application, or — in the `providers` of a
 * component — for everything rendered inside it.
 *
 * ```ts
 * provideKnDefaults({ size: 'sm', button: { variant: 'soft' }, tabs: { variant: 'underline' } })
 * ```
 */
export function provideKnDefaults(defaults: KnDefaults): Provider {
  return { provide: KN_DEFAULTS, useValue: defaults };
}

/** Defaults of one component. Call in an injection context (a field initialiser). */
export function knDefaults<K extends Exclude<keyof KnDefaults, 'size'>>(
  component: K,
): NonNullable<KnDefaults[K]> {
  return inject(KN_DEFAULTS)[component] ?? {};
}

/** The default size: the component's own entry, then the global one, then medium. */
export function knDefaultSize(component?: 'button' | 'tabs'): KnSize {
  const defaults = inject(KN_DEFAULTS);
  return (component && defaults[component]?.size) ?? defaults.size ?? 'md';
}
