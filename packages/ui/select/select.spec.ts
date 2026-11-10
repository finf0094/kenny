import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { KnField } from '@kenny/ui/field';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnOption, KnSelect } from './index';

const template = `
  <kn-field label="Город">
    <kn-select [formControl]="control" placeholder="Не выбран">
      <kn-option value="msk">Москва</kn-option>
      <kn-option value="spb">Санкт-Петербург</kn-option>
      <kn-option value="kzn" disabled>Казань</kn-option>
      <kn-option value="nsk">Новосибирск</kn-option>
    </kn-select>
  </kn-field>`;

async function setup(initial: string | null = null) {
  const control = new FormControl<string | null>(initial);
  const view = await render(template, {
    imports: [KnSelect, KnOption, KnField, ReactiveFormsModule],
    componentProperties: { control },
  });
  const user = userEvent.setup();
  return { control, user, trigger: screen.getByRole('combobox'), ...view };
}

describe('KnSelect', () => {
  it('shows the placeholder, then the label of the selected option', async () => {
    const { control, trigger, fixture } = await setup();
    expect(trigger).toHaveTextContent('Не выбран');
    control.setValue('spb');
    await fixture.whenStable();
    expect(trigger).toHaveTextContent('Санкт-Петербург');
    expect(trigger).toHaveAccessibleName('Город Санкт-Петербург');
  });

  it('opens on click and selects an option', async () => {
    const { control, user, trigger } = await setup();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Москва' }));
    expect(control.value).toBe('msk');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports the APG keyboard model with a virtual focus', async () => {
    const { control, user, trigger } = await setup('msk');
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    const options = screen.getAllByRole('option');
    expect(trigger).toHaveAttribute('aria-activedescendant', options[0].id);

    await user.keyboard('{ArrowDown}');
    await stable();
    expect(trigger).toHaveAttribute('aria-activedescendant', options[1].id);
    // Disabled option is skipped
    await user.keyboard('{ArrowDown}');
    await stable();
    expect(trigger).toHaveAttribute('aria-activedescendant', options[3].id);
    await user.keyboard('{Home}');
    await stable();
    expect(trigger).toHaveAttribute('aria-activedescendant', options[0].id);
    await user.keyboard('{End}{Enter}');
    expect(control.value).toBe('nsk');
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape without changing the value', async () => {
    const { control, user } = await setup('msk');
    await user.tab();
    await user.keyboard('{Enter}{ArrowDown}{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(control.value).toBe('msk');
  });

  it('selects by typing when closed', async () => {
    const { control, user } = await setup();
    await user.tab();
    await user.keyboard('н');
    await waitFor(() => expect(control.value).toBe('nsk'));
  });

  it('marks touched on blur and reflects disabled', async () => {
    const { control, user, trigger, fixture } = await setup();
    await user.tab();
    await user.tab();
    expect(control.touched).toBe(true);
    control.disable();
    await fixture.whenStable();
    expect(trigger).toBeDisabled();
  });

  it('has no accessibility violations, closed and open', async () => {
    const { user, trigger } = await setup('msk');
    await expectNoA11yViolations(document.body);
    await user.click(trigger);
    await expectNoA11yViolations(document.body);
  });
});
