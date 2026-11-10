import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnAccordion, KnAccordionItem } from './accordion';

const template = (multiple = false) => `
  <kn-accordion ${multiple ? 'multiple' : ''}>
    <kn-accordion-item heading="Доставка" [expanded]="true">Текст о доставке</kn-accordion-item>
    <kn-accordion-item heading="Оплата">Текст об оплате</kn-accordion-item>
    <kn-accordion-item heading="Возврат" disabled>Текст о возврате</kn-accordion-item>
  </kn-accordion>`;

const imports = [KnAccordion, KnAccordionItem];
const trigger = (name: string) => screen.getByRole('button', { name });

describe('KnAccordion', () => {
  it('exposes headings with buttons that control labelled regions', async () => {
    await render(template(), { imports });
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    const button = trigger('Доставка');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const region = document.getElementById(button.getAttribute('aria-controls')!)!;
    expect(region).toHaveAttribute('role', 'region');
    expect(region).toHaveAttribute('aria-labelledby', button.id);
  });

  it('keeps one section open in single mode and hides collapsed content from AT', async () => {
    await render(template(), { imports });
    await userEvent.click(trigger('Оплата'));
    await stable();
    expect(trigger('Оплата')).toHaveAttribute('aria-expanded', 'true');
    expect(trigger('Доставка')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Текст о доставке').closest('.inner')).toHaveAttribute('inert');
    expect(screen.getByText('Текст об оплате').closest('.inner')).not.toHaveAttribute('inert');
  });

  it('allows several open sections with multiple', async () => {
    await render(template(true), { imports });
    await userEvent.click(trigger('Оплата'));
    await stable();
    expect(trigger('Оплата')).toHaveAttribute('aria-expanded', 'true');
    expect(trigger('Доставка')).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves focus between headers with arrows, Home and End', async () => {
    await render(template(), { imports });
    const user = userEvent.setup();
    await user.tab();
    expect(trigger('Доставка')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(trigger('Оплата')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(trigger('Доставка')).toHaveFocus();
    await user.keyboard('{End}');
    expect(trigger('Оплата')).toHaveFocus();
    await user.keyboard('{Enter}');
    await stable();
    expect(trigger('Оплата')).toHaveAttribute('aria-expanded', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(template(), { imports });
    await expectNoA11yViolations(container);
  });
});
