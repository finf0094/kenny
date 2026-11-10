import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { KnSwitch } from '@kenny/ui/switch';

it('переключается с клавиатуры и не нарушает правила axe', async () => {
  const { container } = await render(`<kn-switch>Уведомления</kn-switch>`, { imports: [KnSwitch] });

  await userEvent.tab();
  await userEvent.keyboard(' ');
  expect(screen.getByRole('switch', { name: 'Уведомления' })).toBeChecked();

  const { violations } = await axe.run(container);
  expect(violations).toEqual([]);
});
