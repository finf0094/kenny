import { render, screen } from '@testing-library/angular';
import { KnCard } from '@kenny/ui/card';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnSidebar, KnSidebarGroup, KnSidebarItem } from './sidebar';

const template = `
  <kn-sidebar aria-label="Разделы" [collapsed]="collapsed">
    <kn-sidebar-group label="Работа">
      <a kn-sidebar-item href="#inbox" active>Входящие</a>
      <a kn-sidebar-item href="#projects">Проекты</a>
    </kn-sidebar-group>
    <button kn-sidebar-item type="button">Настройки</button>
  </kn-sidebar>`;

describe('KnSidebar', () => {
  it('renders a navigation landmark with groups and the current page', async () => {
    await render(template, {
      imports: [KnSidebar, KnSidebarGroup, KnSidebarItem],
      componentProperties: { collapsed: false },
    });
    expect(screen.getByRole('navigation', { name: 'Разделы' })).toBeInTheDocument();
    // The name lives on the landmark only: a copy on the wrapper would be an unnamed-role label
    expect(document.querySelector('kn-sidebar')).not.toHaveAttribute('aria-label');
    expect(screen.getByRole('group', { name: 'Работа' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Входящие' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Проекты' })).not.toHaveAttribute('aria-current');
  });

  it('keeps item names accessible when collapsed', async () => {
    const { container } = await render(template, {
      imports: [KnSidebar, KnSidebarGroup, KnSidebarItem],
      componentProperties: { collapsed: true },
    });
    expect(container.querySelector('kn-sidebar')).toHaveAttribute('data-collapsed');
    expect(screen.getByRole('link', { name: 'Проекты' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Настройки' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});

describe('KnCard', () => {
  it('projects media, header, body and footer in order', async () => {
    const { container } = await render(
      `<kn-card variant="solid" padding="lg">
         <footer knCardFooter>Подвал</footer>
         <p>Тело</p>
         <h3 knCardHeader>Заголовок</h3>
         <img knCardMedia alt="Обложка" src="data:," />
       </kn-card>`,
      { imports: [KnCard] },
    );
    const card = container.querySelector('kn-card')!;
    expect(card).toHaveAttribute('data-variant', 'solid');
    expect(card).toHaveAttribute('data-padding', 'lg');
    expect(card.firstElementChild).toHaveAttribute('alt', 'Обложка');
    expect(card.querySelector('.body')!.textContent!.replace(/\s+/g, '')).toBe(
      'ЗаголовокТелоПодвал',
    );
    await expectNoA11yViolations(container);
  });

  it('can be an interactive link', async () => {
    await render(`<a kn-card interactive href="#x">Открыть проект</a>`, { imports: [KnCard] });
    expect(screen.getByRole('link', { name: 'Открыть проект' })).toHaveAttribute(
      'data-interactive',
    );
  });
});
