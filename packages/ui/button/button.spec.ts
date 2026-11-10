import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnButton } from './button';

describe('KnButton', () => {
  it('renders a native button with projected content', async () => {
    await render(`<button kn-button>Сохранить</button>`, { imports: [KnButton] });
    const button = screen.getByRole('button', { name: 'Сохранить' });
    expect(button).toHaveAttribute('data-variant', 'solid');
    expect(button).toHaveAttribute('data-size', 'md');
  });

  it('reflects variant, tone and size', async () => {
    await render(`<button kn-button variant="soft" tone="danger" size="lg">Удалить</button>`, {
      imports: [KnButton],
    });
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'soft');
    expect(button).toHaveAttribute('data-tone', 'danger');
    expect(button).toHaveAttribute('data-size', 'lg');
  });

  it('emits clicks and is operable with the keyboard', async () => {
    const onClick = vi.fn();
    await render(`<button kn-button (click)="onClick()">OK</button>`, {
      imports: [KnButton],
      componentProperties: { onClick },
    });
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('disables the native button', async () => {
    const onClick = vi.fn();
    await render(`<button kn-button disabled (click)="onClick()">OK</button>`, {
      imports: [KnButton],
      componentProperties: { onClick },
    });
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps focusability while loading but swallows clicks', async () => {
    const onClick = vi.fn();
    await render(`<button kn-button loading (click)="onClick()">OK</button>`, {
      imports: [KnButton],
      componentProperties: { onClick },
    });
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('marks a disabled link as aria-disabled and removes it from the tab order', async () => {
    await render(`<a kn-button href="/docs" disabled>Документация</a>`, { imports: [KnButton] });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('has no accessibility violations (text and icon-only)', async () => {
    const { container } = await render(
      `<button kn-button>Текст</button><button kn-icon-button aria-label="Закрыть">×</button>`,
      { imports: [KnButton] },
    );
    await expectNoA11yViolations(container);
  });
});
