import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnPanel } from './panel';

describe('KnPanel', () => {
  it('toggles its region and keeps actions outside of the toggle button', async () => {
    const onExpanded = vi.fn();
    await render(
      `<kn-panel heading="Фильтры" description="3 активных" (expandedChange)="onExpanded($event)">
         <button knPanelActions type="button">Сбросить</button>
         Содержимое
       </kn-panel>`,
      { imports: [KnPanel], componentProperties: { onExpanded } },
    );
    const toggle = screen.getByRole('button', { name: /Фильтры/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).not.toContainElement(screen.getByRole('button', { name: 'Сбросить' }));

    await userEvent.click(toggle);
    await stable();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(onExpanded).toHaveBeenCalledWith(false);
    expect(screen.getByRole('region', { hidden: true }).closest('.inner')).toHaveAttribute('inert');
  });

  it('renders a static heading when not collapsible', async () => {
    await render(`<kn-panel heading="Сводка" [collapsible]="false">Текст</kn-panel>`, {
      imports: [KnPanel],
    });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Сводка' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(`<kn-panel heading="Сводка">Текст</kn-panel>`, {
      imports: [KnPanel],
    });
    await expectNoA11yViolations(container);
  });
});
