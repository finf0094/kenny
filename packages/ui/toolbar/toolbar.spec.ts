import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnToolbar, KnToolbarSeparator } from './toolbar';

const template = `
  <button type="button">До</button>
  <kn-toolbar aria-label="Форматирование">
    <button type="button">Жирный</button>
    <button type="button">Курсив</button>
    <button type="button" disabled>Подчёркнутый</button>
    <kn-toolbar-separator />
    <button type="button">Ссылка</button>
  </kn-toolbar>
  <button type="button">После</button>`;

describe('KnToolbar', () => {
  it('is a single tab stop with arrow-key navigation', async () => {
    await render(template, { imports: [KnToolbar, KnToolbarSeparator] });
    expect(screen.getByRole('toolbar', { name: 'Форматирование' })).toBeInTheDocument();
    const user = userEvent.setup();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Жирный' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Курсив' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Ссылка' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Жирный' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Ссылка' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'После' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Ссылка' })).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(template, { imports: [KnToolbar, KnToolbarSeparator] });
    await expectNoA11yViolations(container);
  });
});
