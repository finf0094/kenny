import { TestBed } from '@angular/core/testing';
import { screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnToaster, provideKnToaster } from './toast';

describe('KnToaster', () => {
  let toaster: KnToaster;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideKnToaster({ max: 2 })] });
    toaster = TestBed.inject(KnToaster);
  });

  afterEach(() => {
    toaster.clear();
    vi.useRealTimers();
  });

  it('announces toasts politely and errors assertively', async () => {
    toaster.success('Сохранено', 'Изменения применены');
    toaster.error('Не удалось отправить');
    await stable();
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(within(region).getByRole('status')).toHaveTextContent('Сохранено');
    expect(within(region).getByRole('alert')).toHaveTextContent('Не удалось отправить');
    await expectNoA11yViolations(region);
  });

  it('dismisses by the close button and via the returned ref', async () => {
    const ref = toaster.show({ title: 'Первое', duration: 0 });
    toaster.show({ title: 'Второе', duration: 0 });
    await stable();
    await userEvent.click(
      within(screen.getByText('Второе').closest('.toast') as HTMLElement).getByRole('button'),
    );
    await waitFor(() => expect(screen.queryByText('Второе')).not.toBeInTheDocument());
    ref.dismiss();
    await waitFor(() => expect(screen.queryByText('Первое')).not.toBeInTheDocument());
  });

  it('runs the action and closes', async () => {
    const run = vi.fn();
    toaster.show({ title: 'Письмо удалено', duration: 0, action: { label: 'Отменить', run } });
    await stable();
    await userEvent.click(screen.getByRole('button', { name: 'Отменить' }));
    expect(run).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByText('Письмо удалено')).not.toBeInTheDocument());
  });

  it('auto-dismisses after the duration and keeps at most `max` toasts', async () => {
    vi.useFakeTimers();
    toaster.show({ title: 'A', duration: 1000 });
    toaster.show({ title: 'B', duration: 0 });
    toaster.show({ title: 'C', duration: 0 });
    expect(toaster.items().map((t) => t.title)).toEqual(['B', 'C']);
    toaster.show({ title: 'D', duration: 1000 });
    vi.advanceTimersByTime(1100);
    expect(toaster.items().map((t) => t.title)).toEqual(['C']);
  });

  it('pauses timers while hovered', async () => {
    vi.useFakeTimers();
    toaster.show({ title: 'A', duration: 1000 });
    toaster.pauseAll();
    vi.advanceTimersByTime(5000);
    expect(toaster.items()).toHaveLength(1);
    toaster.resumeAll();
    vi.advanceTimersByTime(1100);
    expect(toaster.items()).toHaveLength(0);
  });
});
