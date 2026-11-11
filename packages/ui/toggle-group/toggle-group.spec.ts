import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnToggle, KnToggleGroup } from './toggle-group';

const imports = [KnToggleGroup, KnToggle];
const buttons = `
  <button kn-toggle value="left">Left</button>
  <button kn-toggle value="center">Center</button>
  <button kn-toggle value="right">Right</button>`;

describe('KnToggleGroup', () => {
  it('selects one value and lets it be cleared', async () => {
    @Component({
      imports,
      template: `<kn-toggle-group aria-label="Align" [(value)]="align">
        <button kn-toggle value="left">Left</button>
        <button kn-toggle value="center">Center</button>
        <button kn-toggle value="right">Right</button>
      </kn-toggle-group>`,
    })
    class Host {
      readonly align = signal<string | null>('left');
    }
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    expect(screen.getByRole('group', { name: 'Align' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Center' }));
    expect(host.align()).toBe('center');
    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(screen.getByRole('button', { name: 'Center' }));
    expect(host.align()).toBeNull();
  });

  it('keeps a value when a selection is required', async () => {
    @Component({
      imports,
      template: `<kn-toggle-group aria-label="Align" requireSelection [(value)]="align">
        <button kn-toggle value="left">Left</button>
        <button kn-toggle value="center">Center</button>
        <button kn-toggle value="right">Right</button>
      </kn-toggle-group>`,
    })
    class Host {
      readonly align = signal<string | null>('left');
    }
    const { fixture } = await render(Host);
    await userEvent.click(screen.getByRole('button', { name: 'Left' }));
    expect(fixture.componentInstance.align()).toBe('left');
  });

  it('collects several values in multiple mode', async () => {
    @Component({
      imports,
      template: `<kn-toggle-group aria-label="Style" multiple [(value)]="marks">
        <button kn-toggle value="left">Left</button>
        <button kn-toggle value="center">Center</button>
        <button kn-toggle value="right">Right</button>
      </kn-toggle-group>`,
    })
    class Host {
      readonly marks = signal<string[]>(['left']);
    }
    const { fixture } = await render(Host);
    await userEvent.click(screen.getByRole('button', { name: 'Right' }));
    expect(fixture.componentInstance.marks()).toEqual(['left', 'right']);
    await userEvent.click(screen.getByRole('button', { name: 'Left' }));
    expect(fixture.componentInstance.marks()).toEqual(['right']);
  });

  it('is one tab stop; arrows, Home and End move the focus, skipping disabled buttons', async () => {
    await render(
      `<kn-toggle-group aria-label="Align" value="center">
         <button kn-toggle value="left">Left</button>
         <button kn-toggle value="center">Center</button>
         <button kn-toggle value="justify" disabled>Justify</button>
         <button kn-toggle value="right">Right</button>
       </kn-toggle-group>
       <button>After</button>`,
      { imports },
    );
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Center' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Right' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Left' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Right' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Left' })).toHaveFocus();
    // Moving the focus does not change the value
    expect(screen.getByRole('button', { name: 'Center' })).toHaveAttribute('aria-pressed', 'true');
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('works with reactive forms', async () => {
    const control = new FormControl<string | null>('right');
    const { fixture } = await render(
      `<kn-toggle-group aria-label="Align" [formControl]="control">${buttons}</kn-toggle-group>`,
      { imports: [...imports, ReactiveFormsModule], componentProperties: { control } },
    );
    expect(screen.getByRole('button', { name: 'Right' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Left' }));
    expect(control.value).toBe('left');
    control.disable();
    await fixture.whenStable();
    expect(screen.getByRole('button', { name: 'Left' })).toBeDisabled();
  });

  it('works with signal forms', async () => {
    @Component({
      imports: [...imports, FormField],
      template: `<kn-toggle-group aria-label="Align" [formField]="f.align">
        <button kn-toggle value="left">Left</button>
        <button kn-toggle value="center">Center</button>
        <button kn-toggle value="right">Right</button>
      </kn-toggle-group>`,
    })
    class Host {
      readonly model = signal<{ align: string | null }>({ align: 'left' });
      readonly f = form(this.model);
    }
    const { fixture } = await render(Host);
    await userEvent.click(screen.getByRole('button', { name: 'Right' }));
    expect(fixture.componentInstance.model().align).toBe('right');
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(
      `<kn-toggle-group aria-label="Align" value="left">${buttons}</kn-toggle-group>`,
      { imports },
    );
    await expectNoA11yViolations(container);
  });
});
