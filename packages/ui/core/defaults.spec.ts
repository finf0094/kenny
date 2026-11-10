import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { KnBadge } from '@kenny/ui/badge';
import { KnButton } from '@kenny/ui/button';
import { KnCard } from '@kenny/ui/card';
import { KnInput } from '@kenny/ui/input';
import { KnSelect } from '@kenny/ui/select';
import { KnTab, KnTabs } from '@kenny/ui/tabs';
import { provideKnDefaults } from './defaults';

const imports = [KnButton, KnCard, KnTabs, KnTab, KnBadge, KnInput, KnSelect];
const template = `
  <button kn-button>Сохранить</button>
  <button kn-button variant="ghost" size="lg">Отмена</button>
  <kn-card data-testid="card">Текст</kn-card>
  <kn-tabs aria-label="Период"><kn-tab value="a" label="День">…</kn-tab></kn-tabs>
  <kn-badge data-testid="badge">3</kn-badge>
  <input knInput aria-label="Имя" />
  <kn-select aria-label="Роль" />`;

describe('provideKnDefaults', () => {
  it('keeps the built-in defaults when nothing is provided', async () => {
    const { container } = await render(template, { imports });
    const save = screen.getByRole('button', { name: 'Сохранить' });
    expect(save).toHaveAttribute('data-variant', 'solid');
    expect(save).toHaveAttribute('data-size', 'md');
    expect(screen.getByTestId('card')).toHaveAttribute('data-variant', 'surface');
    expect(container.querySelector('kn-tabs')).toHaveAttribute('data-variant', 'segmented');
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'soft');
    expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveAttribute('data-size', 'md');
  });

  it('changes the default variant and size of the components it names', async () => {
    const { container } = await render(template, {
      imports,
      providers: [
        provideKnDefaults({
          size: 'sm',
          button: { variant: 'soft', size: 'lg' },
          card: { variant: 'outline' },
          tabs: { variant: 'underline' },
          badge: { variant: 'solid' },
        }),
      ],
    });
    const save = screen.getByRole('button', { name: 'Сохранить' });
    expect(save).toHaveAttribute('data-variant', 'soft');
    // The component's own entry wins over the global size
    expect(save).toHaveAttribute('data-size', 'lg');
    expect(screen.getByTestId('card')).toHaveAttribute('data-variant', 'outline');
    expect(container.querySelector('kn-tabs')).toHaveAttribute('data-variant', 'underline');
    expect(container.querySelector('kn-tabs')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'solid');
    // The global size reaches every field
    expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('combobox', { name: 'Роль' })).toHaveAttribute('data-size', 'sm');
  });

  it('never overrides a value set in the template', async () => {
    await render(template, {
      imports,
      providers: [provideKnDefaults({ button: { variant: 'soft', size: 'sm' } })],
    });
    const cancel = screen.getByRole('button', { name: 'Отмена' });
    expect(cancel).toHaveAttribute('data-variant', 'ghost');
    expect(cancel).toHaveAttribute('data-size', 'lg');
  });

  it('can be scoped to a part of the page through component providers', async () => {
    @Component({
      selector: 'test-dense',
      imports: [KnButton],
      providers: [provideKnDefaults({ size: 'sm' })],
      template: `<button kn-button>Внутри</button>`,
    })
    class Dense {}

    await render(`<button kn-button>Снаружи</button><test-dense />`, {
      imports: [KnButton, Dense],
    });
    expect(screen.getByRole('button', { name: 'Снаружи' })).toHaveAttribute('data-size', 'md');
    expect(screen.getByRole('button', { name: 'Внутри' })).toHaveAttribute('data-size', 'sm');
  });
});
