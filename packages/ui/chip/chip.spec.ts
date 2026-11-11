import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnChip } from './chip';

describe('KnChip', () => {
  it('is plain text unless it is selectable', async () => {
    await render(`<kn-chip>Design</kn-chip>`, { imports: [KnChip] });
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('toggles as a pressed button with two-way binding', async () => {
    @Component({
      imports: [KnChip],
      template: `<kn-chip selectable [(selected)]="on">Unread</kn-chip>`,
    })
    class Host {
      readonly on = signal(false);
    }
    const { fixture } = await render(Host);
    const chip = screen.getByRole('button', { name: 'Unread' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(fixture.componentInstance.on()).toBe(true);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(' ');
    expect(fixture.componentInstance.on()).toBe(false);
  });

  it('names the remove button after the chip and emits removed', async () => {
    const removed = vi.fn();
    await render(
      `<kn-chip removable (removed)="removed('a')">Anna</kn-chip>
       <kn-chip removable (removed)="removed('b')">Boris</kn-chip>`,
      { imports: [KnChip], componentProperties: { removed } },
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove Boris' }));
    expect(removed).toHaveBeenCalledWith('b');
  });

  it('does nothing while disabled', async () => {
    const removed = vi.fn();
    await render(`<kn-chip selectable removable disabled (removed)="removed()">Off</kn-chip>`, {
      imports: [KnChip],
      componentProperties: { removed },
    });
    const [body, remove] = screen.getAllByRole('button');
    expect(body).toBeDisabled();
    expect(remove).toBeDisabled();
    await userEvent.click(remove);
    expect(removed).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(
      `<kn-chip>Tag</kn-chip>
       <kn-chip selectable [selected]="true" tone="accent">Filter</kn-chip>
       <kn-chip removable>Person</kn-chip>`,
      { imports: [KnChip] },
    );
    await expectNoA11yViolations(container);
  });
});
