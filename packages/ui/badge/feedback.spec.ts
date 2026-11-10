import { render, screen } from '@testing-library/angular';
import { KnAvatar, KnAvatarGroup } from '@kenny/ui/avatar';
import { KnBreadcrumb, KnBreadcrumbs } from '@kenny/ui/breadcrumbs';
import { KnEmptyState } from '@kenny/ui/empty-state';
import { KnProgress } from '@kenny/ui/progress';
import { KnSkeleton } from '@kenny/ui/skeleton';
import { KnSpinner } from '@kenny/ui/spinner';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnBadge } from './badge';

describe('KnBadge', () => {
  it('reflects tone and variant and can show a status dot', async () => {
    const { container } = await render(`<kn-badge tone="success" variant="solid" dot>Оплачен</kn-badge>`, {
      imports: [KnBadge],
    });
    const badge = container.querySelector('kn-badge')!;
    expect(badge).toHaveAttribute('data-tone', 'success');
    expect(badge).toHaveAttribute('data-variant', 'solid');
    expect(badge.querySelector('.dot')).toHaveAttribute('aria-hidden', 'true');
    expect(badge).toHaveTextContent('Оплачен');
  });
});

describe('KnAvatar', () => {
  it('falls back to initials with an accessible name', async () => {
    await render(`<kn-avatar name="Анна Орлова" status="online" />`, { imports: [KnAvatar] });
    const avatar = screen.getByRole('img', { name: 'Анна Орлова, в сети' });
    expect(avatar).toHaveTextContent('АО');
  });

  it('renders the image with alt text and recovers when it fails to load', async () => {
    const { container, fixture } = await render(`<kn-avatar name="Борис Ким" src="/missing.png" />`, {
      imports: [KnAvatar],
    });
    const image = screen.getByAltText('Борис Ким');
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('img', { name: 'Борис Ким' })).toHaveTextContent('БК');
  });

  it('derives a stable colour from the name', async () => {
    const { container } = await render(
      `<kn-avatar-group><kn-avatar name="Вера" /><kn-avatar name="Вера" /><kn-avatar name="Глеб" /></kn-avatar-group>`,
      { imports: [KnAvatar, KnAvatarGroup] },
    );
    const hues = Array.from(container.querySelectorAll<HTMLElement>('kn-avatar')).map((a) =>
      a.style.getPropertyValue('--_hue'),
    );
    expect(hues[0]).toBe(hues[1]);
    expect(hues[0]).not.toBe(hues[2]);
  });
});

describe('KnProgress', () => {
  it('exposes determinate values to assistive technology', async () => {
    await render(`<kn-progress aria-label="Загрузка файла" [value]="30" [max]="60" />`, {
      imports: [KnProgress],
    });
    const bar = screen.getByRole('progressbar', { name: 'Загрузка файла' });
    expect(bar).toHaveAttribute('aria-valuenow', '30');
    expect(bar).toHaveAttribute('aria-valuemax', '60');
    expect(bar.style.getPropertyValue('--_ratio')).toBe('0.5');
  });

  it('omits values when indeterminate', async () => {
    await render(`<kn-progress aria-label="Синхронизация" />`, { imports: [KnProgress] });
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('data-indeterminate');
  });
});

describe('KnSkeleton / KnSpinner', () => {
  it('skeleton is hidden from assistive technology and renders the requested lines', async () => {
    const { container } = await render(`<kn-skeleton [lines]="3" />`, { imports: [KnSkeleton] });
    expect(container.querySelector('kn-skeleton')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.bone')).toHaveLength(3);
  });

  it('spinner is a labelled progressbar unless decorative', async () => {
    const { container } = await render(`<kn-spinner label="Сохраняем" /><kn-spinner decorative />`, {
      imports: [KnSpinner],
    });
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.getByRole('progressbar', { name: 'Сохраняем' })).toBeInTheDocument();
    expect(container.querySelectorAll('kn-spinner')[1]).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('KnEmptyState', () => {
  it('renders a heading, description and projected actions', async () => {
    await render(
      `<kn-empty-state icon="inbox" heading="Писем нет" description="Новые появятся здесь">
         <button type="button">Написать</button>
       </kn-empty-state>`,
      { imports: [KnEmptyState] },
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Писем нет' })).toBeInTheDocument();
    expect(screen.getByText('Новые появятся здесь')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Написать' })).toBeInTheDocument();
  });
});

describe('KnBreadcrumbs', () => {
  it('is a labelled navigation list with the current page marked', async () => {
    const { container } = await render(
      `<kn-breadcrumbs>
         <kn-breadcrumb><a href="/">Главная</a></kn-breadcrumb>
         <kn-breadcrumb><a href="/projects">Проекты</a></kn-breadcrumb>
         <kn-breadcrumb current>Kenny</kn-breadcrumb>
       </kn-breadcrumbs>`,
      { imports: [KnBreadcrumbs, KnBreadcrumb] },
    );
    expect(screen.getByRole('navigation', { name: 'Навигационная цепочка' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Kenny')).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link')).toHaveLength(2);
    await expectNoA11yViolations(container);
  });
});

describe('feedback components', () => {
  it('have no accessibility violations together', async () => {
    const { container } = await render(
      `<kn-badge tone="danger">3</kn-badge>
       <kn-avatar name="Анна Орлова" />
       <kn-progress aria-label="Загрузка" [value]="10" />
       <kn-spinner />
       <kn-skeleton />
       <kn-empty-state heading="Пусто" />`,
      { imports: [KnBadge, KnAvatar, KnProgress, KnSpinner, KnSkeleton, KnEmptyState] },
    );
    await expectNoA11yViolations(container);
  });
});
