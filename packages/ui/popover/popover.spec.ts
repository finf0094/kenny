import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { KnTooltip } from '@kenny/ui/tooltip';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnPopover, KnPopoverTrigger } from './popover';

const template = `
  <button type="button" [knPopoverTrigger]="filters">Фильтры</button>
  <kn-popover #filters aria-label="Фильтры задач">
    <label>Исполнитель <input type="text" /></label>
    <button type="button" (click)="filters.close()">Применить</button>
  </kn-popover>
  <button type="button">Снаружи</button>`;

describe('KnPopover', () => {
  it('opens a labelled dialog from its trigger and moves focus inside', async () => {
    await render(template, { imports: [KnPopover, KnPopoverTrigger] });
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Фильтры' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Фильтры задач' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);
    await waitFor(() => expect(screen.getByLabelText('Исполнитель')).toHaveFocus());
    await expectNoA11yViolations(dialog);
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    await render(template, { imports: [KnPopover, KnPopoverTrigger] });
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Фильтры' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await waitFor(() => expect(screen.getByLabelText('Исполнитель')).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('closes on outside click and from inside content', async () => {
    await render(template, { imports: [KnPopover, KnPopoverTrigger] });
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Фильтры' });

    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Снаружи' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(trigger);
    await user.click(await screen.findByRole('button', { name: 'Применить' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('KnTooltip', () => {
  it('describes its host for assistive technology at all times', async () => {
    await render(`<button type="button" aria-label="Архив" knTooltip="Переместить в архив">A</button>`, {
      imports: [KnTooltip],
    });
    await stable();
    expect(screen.getByRole('button', { name: 'Архив' })).toHaveAccessibleDescription('Переместить в архив');
  });

  it('shows on hover after the delay and hides on leave', async () => {
    await render(`<button type="button" knTooltip="Подсказка" [knTooltipDelay]="0">Кнопка</button>`, {
      imports: [KnTooltip],
    });
    const user = userEvent.setup();
    const button = screen.getByRole('button');
    await user.hover(button);
    await waitFor(() => expect(document.querySelector('kn-tooltip-panel')).toHaveTextContent('Подсказка'));
    await user.unhover(button);
    await waitFor(() => expect(document.querySelector('kn-tooltip-panel')).toBeNull());
  });

  it('hides on Escape', async () => {
    await render(`<button type="button" knTooltip="Подсказка" [knTooltipDelay]="0">Кнопка</button>`, {
      imports: [KnTooltip],
    });
    const user = userEvent.setup();
    await user.hover(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('kn-tooltip-panel')).not.toBeNull());
    screen.getByRole('button').focus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelector('kn-tooltip-panel')).toBeNull());
  });
});
