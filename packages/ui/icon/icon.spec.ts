import { render, screen } from '@testing-library/angular';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnIcon, provideKnIcons } from './icon';

describe('KnIcon', () => {
  it('is decorative by default: hidden from assistive technology', async () => {
    const { container } = await render(`<kn-icon name="check" />`, { imports: [KnIcon] });
    const icon = container.querySelector('kn-icon')!;
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).not.toHaveAttribute('role');
    expect(icon.querySelector('svg')).toHaveAttribute('focusable', 'false');
    expect(icon.querySelector('path')).toBeInTheDocument();
  });

  it('becomes a named image when it carries meaning on its own', async () => {
    const { container } = await render(`<kn-icon name="alert" label="Ошибка оплаты" />`, { imports: [KnIcon] });
    const icon = screen.getByRole('img', { name: 'Ошибка оплаты' });
    expect(icon).not.toHaveAttribute('aria-hidden');
    await expectNoA11yViolations(container);
  });

  it('sizes itself from a number of pixels or any CSS length', async () => {
    const { container } = await render(`<kn-icon name="check" [size]="18" /><kn-icon name="check" size="1.5rem" />`, {
      imports: [KnIcon],
    });
    const [px, rem] = Array.from(container.querySelectorAll<HTMLElement>('kn-icon'));
    expect(px.style.getPropertyValue('--kn-icon-size')).toBe('18px');
    expect(rem.style.getPropertyValue('--kn-icon-size')).toBe('1.5rem');
  });

  it('passes the stroke width to the drawing', async () => {
    const { container } = await render(`<kn-icon name="check" [strokeWidth]="2.5" />`, { imports: [KnIcon] });
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '2.5');
  });

  it('renders icons registered by the application and lets them override the core set', async () => {
    const { container } = await render(`<kn-icon name="rocket" /><kn-icon name="check" />`, {
      imports: [KnIcon],
      providers: [
        provideKnIcons({ rocket: '<circle cx="12" cy="12" r="4" data-icon="rocket"/>' }),
        provideKnIcons({ check: '<rect x="4" y="4" width="16" height="16" data-icon="custom-check"/>' }),
      ],
    });
    expect(container.querySelector('[data-icon="rocket"]')).toBeInTheDocument();
    expect(container.querySelector('[data-icon="custom-check"]')).toBeInTheDocument();
  });

  it('warns about an unknown name and renders an empty drawing instead of throwing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = await render(`<kn-icon name="no-such-icon" />`, { imports: [KnIcon] });
    expect(container.querySelector('svg')?.children).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no-such-icon'));
    warn.mockRestore();
  });
});
