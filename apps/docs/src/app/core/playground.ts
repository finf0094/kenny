import { ChangeDetectionStrategy, Component, input, signal, WritableSignal } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnInput } from '@kenny/ui/input';
import { KnOption, KnSelect } from '@kenny/ui/select';
import { KnSlider } from '@kenny/ui/slider';
import { KnSwitch } from '@kenny/ui/switch';
import { DocsCode } from './code-block';

interface Base<K extends string, T> {
  kind: K;
  label: string;
  value: WritableSignal<T>;
}
export type ChoiceControl<T extends string> = Base<'choice', T> & { options: readonly T[] };
export type ToggleControl = Base<'toggle', boolean>;
export type TextControl = Base<'text', string>;
export type RangeControl = Base<'range', number> & { min: number; max: number; step: number };
export type PlaygroundControl = ChoiceControl<string> | ToggleControl | TextControl | RangeControl;

/** A control that picks one of several string values (variant, size, placement…). */
export function choice<const T extends string>(label: string, options: readonly T[], initial: T = options[0]): ChoiceControl<T> {
  return { kind: 'choice', label, options, value: signal<T>(initial) };
}

export function toggle(label: string, initial = false): ToggleControl {
  return { kind: 'toggle', label, value: signal(initial) };
}

export function text(label: string, initial = ''): TextControl {
  return { kind: 'text', label, value: signal(initial) };
}

export function range(label: string, initial: number, min: number, max: number, step = 1): RangeControl {
  return { kind: 'range', label, value: signal(initial), min, max, step };
}

/**
 * Formats the attributes of a tag for the playground's code output, leaving out
 * values that equal the component default.
 */
export function attrs(values: Record<string, [value: unknown, fallback?: unknown]>): string {
  return Object.entries(values)
    .map(([name, [value, fallback]]) => {
      if (value === fallback || value === '' || value === false || value == null) return '';
      if (value === true) return ` ${name}`;
      return typeof value === 'number' ? ` [${name}]="${value}"` : ` ${name}="${value}"`;
    })
    .join('');
}

/** Interactive playground: the preview is projected, the controls are built from the library itself. */
@Component({
  selector: 'docs-playground',
  imports: [KnField, KnInput, KnSelect, KnOption, KnSwitch, KnSlider, DocsCode],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="frame">
      <div class="stage kn-wallpaper-sm"><ng-content /></div>
      <form class="controls" aria-label="Настройки примера" (submit)="$event.preventDefault()">
        @for (control of controls(); track control.label) {
          @switch (control.kind) {
            @case ('choice') {
              <kn-field [label]="control.label">
                <kn-select size="sm" [value]="control.value()" (valueChange)="control.value.set($any($event))">
                  @for (option of control.options; track option) {
                    <kn-option [value]="option">{{ option }}</kn-option>
                  }
                </kn-select>
              </kn-field>
            }
            @case ('toggle') {
              <kn-switch size="sm" [checked]="control.value()" (checkedChange)="control.value.set($event)">
                {{ control.label }}
              </kn-switch>
            }
            @case ('text') {
              <kn-field [label]="control.label">
                <input knInput knSize="sm" [value]="control.value()" (input)="control.value.set($any($event.target).value)" />
              </kn-field>
            }
            @case ('range') {
              <kn-field [label]="control.label + ': ' + control.value()">
                <kn-slider
                  size="sm"
                  [min]="control.min"
                  [max]="control.max"
                  [step]="control.step"
                  [value]="control.value()"
                  (valueChange)="control.value.set($event)"
                />
              </kn-field>
            }
          }
        }
      </form>
    </div>
    @if (code()) {
      <docs-code [code]="code()" label="Код с текущими настройками" />
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--kn-space-3);
    }

    .frame {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 15rem;
      border-radius: var(--kn-radius-lg);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
      overflow: hidden;
    }

    .stage {
      display: grid;
      place-items: center;
      min-block-size: 16rem;
      padding: var(--kn-space-8);
      overflow: auto;
    }

    .controls {
      display: grid;
      align-content: start;
      gap: var(--kn-space-4);
      padding: var(--kn-space-5);
      background: var(--kn-color-surface-sunken);
      border-inline-start: 1px solid var(--kn-color-border);
    }

    @media (max-width: 52rem) {
      .frame {
        grid-template-columns: minmax(0, 1fr);
      }

      .controls {
        border-inline-start: 0;
        border-block-start: 1px solid var(--kn-color-border);
        grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
      }
    }
  `,
})
export class DocsPlayground {
  readonly controls = input.required<readonly PlaygroundControl[]>();
  /** Markup that reflects the current control values. */
  readonly code = input<string>('');
}
