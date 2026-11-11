import { render, screen } from '@testing-library/angular';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnDivider } from './divider';

describe('KnDivider', () => {
  it('is a separator, vertical when asked', async () => {
    await render(`<kn-divider /><kn-divider orientation="vertical" />`, { imports: [KnDivider] });
    const [horizontal, vertical] = screen.getAllByRole('separator');
    expect(horizontal).not.toHaveAttribute('aria-orientation');
    expect(vertical).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('is hidden from assistive technology when decorative', async () => {
    const { container } = await render(`<kn-divider decorative />`, { imports: [KnDivider] });
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    expect(container.querySelector('kn-divider')).toHaveAttribute('role', 'presentation');
  });

  it('maps spacing to the scale or passes a raw length', async () => {
    const { container } = await render(
      `<kn-divider spacing="4" /><kn-divider spacing="1.5rem" />`,
      { imports: [KnDivider] },
    );
    const [scaled, raw] = Array.from(container.querySelectorAll<HTMLElement>('kn-divider'));
    expect(scaled.style.getPropertyValue('--_gap')).toBe('var(--kn-space-4)');
    expect(raw.style.getPropertyValue('--_gap')).toBe('1.5rem');
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(`<kn-divider>or</kn-divider>`, { imports: [KnDivider] });
    await expectNoA11yViolations(container);
  });
});
