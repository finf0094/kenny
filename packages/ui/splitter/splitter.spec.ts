import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnSplitter, KnSplitterHandle, KnSplitterPanel } from './splitter';

@Component({
  imports: [KnSplitter, KnSplitterPanel, KnSplitterHandle],
  template: `
    <kn-splitter>
      <kn-splitter-panel [(size)]="list" [min]="20" [max]="60">Список</kn-splitter-panel>
      <kn-splitter-handle aria-label="Ширина списка" />
      <kn-splitter-panel>Письмо</kn-splitter-panel>
    </kn-splitter>
  `,
})
class Host {
  readonly list = signal<number | undefined>(30);
}

describe('KnSplitter', () => {
  it('exposes a focusable separator describing the panel before it', async () => {
    await render(Host);
    const separator = screen.getByRole('separator', { name: 'Ширина списка' });
    expect(separator).toHaveAttribute('aria-valuenow', '30');
    expect(separator).toHaveAttribute('aria-valuemin', '20');
    expect(separator).toHaveAttribute('aria-valuemax', '60');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveAttribute('tabindex', '0');
    expect(document.getElementById(separator.getAttribute('aria-controls')!)).toHaveTextContent(
      'Список',
    );
  });

  it('resizes with arrow keys and clamps to min/max with Home/End', async () => {
    const { fixture } = await render(Host);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(fixture.componentInstance.list()).toBe(32);
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(fixture.componentInstance.list()).toBe(22);
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(fixture.componentInstance.list()).toBe(20);
    await user.keyboard('{End}');
    expect(fixture.componentInstance.list()).toBe(60);
    await stable();
    expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '60');
  });

  it('distributes the remaining space to panels without a size', async () => {
    const { container } = await render(Host);
    const panels = container.querySelectorAll<HTMLElement>('kn-splitter-panel');
    expect(panels[0].style.flexGrow).toBe('30');
    expect(panels[1].style.flexGrow).toBe('70');
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(Host);
    await expectNoA11yViolations(container);
  });
});
