import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  DoCheck,
  inject,
  input,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Subscription } from 'rxjs';
import { KN_FIELD } from './field-context';

/**
 * Base class for every Kenny form control.
 *
 * One implementation serves three ways of using a control:
 *  - standalone, through the two-way bindable model (`[(value)]` / `[(checked)]`);
 *  - Reactive and template-driven forms, through `ControlValueAccessor`;
 *  - signal forms: `[formField]` picks up the same accessor.
 *
 * The accessor is registered on the host `NgControl` directly rather than through
 * `NG_VALUE_ACCESSOR`, which lets the control read validity and reflect it as
 * `aria-invalid` without the consumer wiring anything.
 */
@Directive()
export abstract class KnFormControl<T> implements ControlValueAccessor, DoCheck {
  /** Отключает контрол. В формах состояние приходит из `FormControl`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Помечает контрол невалидным. В формах выставляется автоматически после touched. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Обязательное поле: добавляет `aria-required` / `required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Имя поля для нативной отправки формы. */
  readonly name = input<string>('');
  /** Доступное имя, если рядом нет видимой подписи. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  /** Пользователь закончил взаимодействие с контролом (потеря фокуса). */
  readonly touch = output<void>();

  /** The signal that holds the value; subclasses point it at their public model. */
  protected abstract readonly model: WritableSignal<T>;

  protected readonly ngControl = inject(NgControl, { self: true, optional: true });
  protected readonly field = inject(KN_FIELD, { optional: true });
  private readonly generatedId = inject(_IdGenerator).getId('kn-control-');

  private readonly formDisabled = signal(false);
  private readonly formInvalid = signal(false);

  /** Итоговое состояние disabled с учётом формы. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  /** Итоговое состояние invalid с учётом формы и `<kn-field>`. */
  readonly isInvalid = computed(
    () => this.invalid() || this.formInvalid() || (this.field?.invalid() ?? false),
  );

  /** id of the focusable element. */
  protected readonly controlId = this.field?.controlId ?? this.generatedId;
  /** `aria-labelledby` target when the control lives inside `<kn-field>`. */
  protected readonly labelledBy = computed(() =>
    this.ariaLabel() ? null : (this.field?.labelId ?? null),
  );
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);

  private onChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};
  private watched: AbstractControl | null = null;
  private subscription?: Subscription;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    inject(DestroyRef).onDestroy(() => this.subscription?.unsubscribe());
  }

  ngDoCheck(): void {
    const control = this.ngControl?.control ?? null;
    if (control === this.watched) {
      return;
    }
    this.watched = control;
    this.subscription?.unsubscribe();
    const sync = () => this.formInvalid.set(!!control && control.invalid && control.touched);
    sync();
    this.subscription = control?.events?.subscribe(sync);
  }

  writeValue(value: T): void {
    this.model.set(this.coerce(value));
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /** Normalises values written by a form (e.g. `null` → `false`). */
  protected coerce(value: T): T {
    return value;
  }

  /** Stores a value produced by the user and notifies the form. */
  protected commit(value: T): void {
    this.model.set(value);
    this.onChange(value);
  }

  /** Call when focus leaves the control. */
  protected markTouched(): void {
    this.onTouched();
    this.touch.emit();
  }
}
