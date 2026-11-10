import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnCollapse } from './collapse';

const template = `
  <button type="button" [attr.aria-expanded]="open" aria-controls="details">Подробности</button>
  <kn-collapse id="details" [open]="open">
    <p>Скрытый текст</p>
    <a href="#more">Читать дальше</a>
  </kn-collapse>
  <button type="button">После</button>`;

describe('KnCollapse', () => {
  it('makes collapsed content inert: unreachable by keyboard and screen readers', async () => {
    const { container } = await render(template, { imports: [KnCollapse], componentProperties: { open: false } });
    const host = container.querySelector('kn-collapse')!;
    expect(host).not.toHaveAttribute('data-open');
    expect(host.querySelector('.inner')).toHaveAttribute('inert');
    // The content stays in the DOM, so opening needs no re-render and can animate
    expect(screen.getByText('Скрытый текст')).toBeInTheDocument();
  });

  it('exposes the content when open', async () => {
    const { container, rerender } = await render(template, {
      imports: [KnCollapse],
      componentProperties: { open: false },
    });
    await rerender({ componentProperties: { open: true } });
    const host = container.querySelector('kn-collapse')!;
    expect(host).toHaveAttribute('data-open');
    expect(host.querySelector('.inner')).not.toHaveAttribute('inert');

    const user = userEvent.setup();
    screen.getByRole('button', { name: 'Подробности' }).focus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Читать дальше' })).toHaveFocus();
    await expectNoA11yViolations(container);
  });

  it('accepts the attribute form', async () => {
    const { container } = await render(`<kn-collapse open><p>Текст</p></kn-collapse>`, { imports: [KnCollapse] });
    expect(container.querySelector('kn-collapse')).toHaveAttribute('data-open');
  });

  it('closes again and hides the content from the accessibility tree', async () => {
    const { container, rerender } = await render(template, {
      imports: [KnCollapse],
      componentProperties: { open: true },
    });
    await rerender({ componentProperties: { open: false } });
    expect(container.querySelector('kn-collapse .inner')).toHaveAttribute('inert');
  });
});
