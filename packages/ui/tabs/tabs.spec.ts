import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnTab, KnTabs } from './tabs';

@Component({
  imports: [KnTabs, KnTab],
  template: `
    <kn-tabs aria-label="Раздел" [(value)]="tab">
      <kn-tab value="overview" label="Обзор">Панель обзора</kn-tab>
      <kn-tab value="code" label="Код">Панель кода</kn-tab>
      <kn-tab value="billing" label="Оплата" disabled>Панель оплаты</kn-tab>
      <kn-tab value="api" label="API">Панель API</kn-tab>
    </kn-tabs>
  `,
})
class Host {
  readonly tab = signal<string | undefined>(undefined);
}

describe('KnTabs', () => {
  it('selects the first tab by default and wires tabs to panels', async () => {
    await render(Host);
    const tab = screen.getByRole('tab', { name: 'Обзор' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveTextContent('Панель обзора');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('tells panels which side the selection moved to', async () => {
    const { container } = await render(Host);
    const tabs = container.querySelector<HTMLElement>('kn-tabs')!;
    // Nothing moves on the first render
    expect(tabs.style.getPropertyValue('--kn-shift')).toBe('0px');
    await userEvent.click(screen.getByRole('tab', { name: 'API' }));
    await stable();
    expect(tabs.style.getPropertyValue('--kn-shift')).toBe('14px');
    await userEvent.click(screen.getByRole('tab', { name: 'Код' }));
    await stable();
    expect(tabs.style.getPropertyValue('--kn-shift')).toBe('-14px');
  });

  it('activates on click and updates the model', async () => {
    const { fixture } = await render(Host);
    await userEvent.click(screen.getByRole('tab', { name: 'Код' }));
    await stable();
    expect(fixture.componentInstance.tab()).toBe('code');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Панель кода');
  });

  it('uses a roving tabindex and arrow keys, skipping disabled tabs', async () => {
    await render(Host);
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Обзор' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Код' })).toHaveAttribute('tabindex', '-1');

    await user.keyboard('{ArrowRight}');
    await stable();
    expect(screen.getByRole('tab', { name: 'Код' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    await stable();
    expect(screen.getByRole('tab', { name: 'API' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    await stable();
    expect(screen.getByRole('tab', { name: 'Обзор' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    await stable();
    expect(screen.getByRole('tab', { name: 'API' })).toHaveAttribute('aria-selected', 'true');
  });

  it('follows external value changes', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.tab.set('api');
    await stable();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Панель API');
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(Host);
    await expectNoA11yViolations(container);
  });
});
