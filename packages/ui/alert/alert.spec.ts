import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { knLabelsRu, provideKnLabels } from '@kenny/ui/core';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnAlert } from './alert';

describe('KnAlert', () => {
  it('announces politely by default and assertively for danger', async () => {
    await render(
      `<kn-alert tone="success" heading="Saved">All changes are stored.</kn-alert>
       <kn-alert tone="danger">Payment failed.</kn-alert>
       <kn-alert live="off">Just a note.</kn-alert>`,
      { imports: [KnAlert] },
    );
    expect(screen.getByRole('status')).toHaveTextContent('SavedAll changes are stored.');
    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed.');
    expect(screen.getByText('Just a note.').closest('.alert')).not.toHaveAttribute('role');
  });

  it('closes from the button, emits and leaves no empty box behind', async () => {
    const closed = vi.fn();
    const { container } = await render(
      `<kn-alert closable (closed)="closed()">Trial ends tomorrow.</kn-alert>`,
      { imports: [KnAlert], componentProperties: { closed } },
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(closed).toHaveBeenCalledOnce();
    expect(screen.queryByText('Trial ends tomorrow.')).not.toBeInTheDocument();
    expect(container.querySelector('kn-alert')).toHaveAttribute('data-closed');
  });

  it('takes the close label from the provided labels', async () => {
    await render(`<kn-alert closable>Текст</kn-alert>`, {
      imports: [KnAlert],
      providers: [provideKnLabels(knLabelsRu)],
    });
    expect(screen.getByRole('button', { name: 'Скрыть' })).toBeInTheDocument();
  });

  it('picks an icon by tone and lets it be removed', async () => {
    const { container } = await render(
      `<kn-alert tone="warning">A</kn-alert><kn-alert icon="">B</kn-alert>`,
      { imports: [KnAlert] },
    );
    expect(container.querySelectorAll('kn-icon.icon')).toHaveLength(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(
      `<kn-alert tone="accent" heading="Update" closable>
         Version 2 is out.
         <button knAlertActions>Details</button>
       </kn-alert>`,
      { imports: [KnAlert] },
    );
    await expectNoA11yViolations(container);
  });
});
