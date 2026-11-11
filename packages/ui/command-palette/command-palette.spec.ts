import { TestBed } from '@angular/core/testing';
import { fireEvent, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnCommandPalette, provideKnCommandPalette } from './command-palette';

describe('KnCommandPalette', () => {
  const run = vi.fn();
  let palette: KnCommandPalette;

  beforeEach(async () => {
    run.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideKnCommandPalette({
          commands: [
            { id: 'home', label: 'Главная', group: 'Разделы', run: () => run('home') },
            {
              id: 'tokens',
              label: 'Токены',
              group: 'Разделы',
              keywords: ['цвета'],
              run: () => run('tokens'),
            },
            {
              id: 'theme',
              label: 'Сменить тему',
              group: 'Действия',
              shortcut: ['⌘', 'T'],
              run: () => run('theme'),
            },
          ],
        }),
      ],
    });
    palette = TestBed.inject(KnCommandPalette);
    // App initializers (command registration, hotkey) run on bootstrap.
    await TestBed.inject(await import('@angular/core').then((m) => m.ApplicationInitStatus))
      .donePromise;
  });

  afterEach(async () => {
    palette.close();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('opens with Ctrl+K as a dialog with a focused combobox and grouped options', async () => {
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('group', { name: 'Разделы' })).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[0].id);
    await expectNoA11yViolations(dialog);
  });

  it('filters by label and keywords', async () => {
    palette.open();
    const input = await screen.findByRole('combobox');
    const user = userEvent.setup();
    await user.type(input, 'цвет');
    await stable();
    expect(screen.getAllByRole('option').map((o) => o.textContent?.trim())).toEqual(['Токены']);
    await user.clear(input);
    await user.type(input, 'ъъъ');
    await stable();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText(/Nothing found/)).toBeInTheDocument();
  });

  it('moves the active option with arrows and runs it with Enter', async () => {
    palette.open();
    const input = await screen.findByRole('combobox');
    const user = userEvent.setup();
    await waitFor(() => expect(input).toHaveFocus());
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await stable();
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent('Сменить тему');
    await user.keyboard('{ArrowDown}{ArrowUp}{Enter}');
    await waitFor(() => expect(run).toHaveBeenCalledWith('theme'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('unregisters commands', async () => {
    const off = palette.register([{ id: 'x', label: 'Временная', run }]);
    expect(palette.commands()).toHaveLength(4);
    off();
    expect(palette.commands()).toHaveLength(3);
  });
});
