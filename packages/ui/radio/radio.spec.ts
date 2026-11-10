import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnRadio, KnRadioGroup } from './radio';

const template = `
  <kn-radio-group aria-label="Тариф" [formControl]="control">
    <kn-radio value="free">Бесплатный</kn-radio>
    <kn-radio value="pro">Про</kn-radio>
    <kn-radio value="team" disabled>Команда</kn-radio>
  </kn-radio-group>`;

async function setup(initial: string | null = 'free') {
  const control = new FormControl(initial);
  const view = await render(template, {
    imports: [KnRadioGroup, KnRadio, ReactiveFormsModule],
    componentProperties: { control },
  });
  return { control, ...view };
}

describe('KnRadioGroup', () => {
  it('renders a labelled radiogroup with the form value checked', async () => {
    await setup('pro');
    expect(screen.getByRole('radiogroup', { name: 'Тариф' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Про' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Бесплатный' })).not.toBeChecked();
  });

  it('selects by click and updates the form', async () => {
    const { control } = await setup();
    await userEvent.click(screen.getByRole('radio', { name: 'Про' }));
    expect(control.value).toBe('pro');
  });

  it('moves selection with arrow keys, skipping disabled radios', async () => {
    const { control } = await setup();
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Бесплатный' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(control.value).toBe('pro');
    await user.keyboard('{ArrowDown}');
    expect(control.value).toBe('free');
  });

  it('disables every radio when the control is disabled', async () => {
    const { control, fixture } = await setup();
    control.disable();
    await fixture.whenStable();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = await setup();
    await expectNoA11yViolations(container);
  });
});
