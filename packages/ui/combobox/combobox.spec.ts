import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { KnField } from '@kenny/ui/field';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnCombobox, KnOption } from './index';

const template = `
  <kn-field label="Страна">
    <kn-combobox [formControl]="control" placeholder="Начните вводить" clearable>
      <kn-option value="am">Армения</kn-option>
      <kn-option value="at">Австрия</kn-option>
      <kn-option value="br">Бразилия</kn-option>
      <kn-option value="by">Беларусь</kn-option>
    </kn-combobox>
  </kn-field>`;

async function setup(initial: string | null = null) {
  const control = new FormControl<string | null>(initial);
  const view = await render(template, {
    imports: [KnCombobox, KnOption, KnField, ReactiveFormsModule],
    componentProperties: { control },
  });
  const user = userEvent.setup();
  return {
    control,
    user,
    input: screen.getByRole<HTMLInputElement>('combobox', { name: 'Страна' }),
    ...view,
  };
}

const visibleOptions = () => screen.getAllByRole('option').map((o) => o.textContent?.trim());

describe('KnCombobox', () => {
  it('shows the label of the form value', async () => {
    const { input } = await setup('br');
    await stable();
    expect(input).toHaveValue('Бразилия');
  });

  it('filters options while typing and highlights the first match', async () => {
    const { user, input } = await setup();
    await user.type(input, 'б');
    await stable();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(visibleOptions()).toEqual(['Бразилия', 'Беларусь']);
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[0].id);
  });

  it('selects the active option with Enter and keeps focus in the input', async () => {
    const { control, user, input } = await setup();
    await user.type(input, 'бе');
    await stable();
    await user.keyboard('{Enter}');
    expect(control.value).toBe('by');
    await stable();
    expect(input).toHaveValue('Беларусь');
    expect(input).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('navigates with arrows and wraps', async () => {
    const { control, user } = await setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Enter}');
    expect(control.value).toBe('by');
  });

  it('shows an empty state when nothing matches and restores text on blur', async () => {
    const { control, user, input } = await setup('am');
    await stable();
    await user.clear(input);
    await user.type(input, 'яяя');
    await stable();
    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
    expect(control.value).toBeNull();
    await user.tab();
    await stable();
    expect(input).toHaveValue('');
  });

  it('clears the value with the clear button', async () => {
    const { control, user } = await setup('at');
    await stable();
    await user.click(screen.getByRole('button', { name: 'Очистить' }));
    expect(control.value).toBeNull();
  });

  it('has no accessibility violations, closed and open', async () => {
    const { user, input } = await setup();
    await expectNoA11yViolations(document.body);
    await user.click(input);
    await stable();
    await expectNoA11yViolations(document.body);
  });
});
