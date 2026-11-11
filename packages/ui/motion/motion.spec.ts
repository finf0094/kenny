import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { spawnRipple } from '@kenny/ui/core';
import { KnNumber } from './number';
import { KnReveal } from './reveal';
import { KnRipple } from './ripple';

describe('KnNumber', () => {
  it('formats with Intl and gives screen readers the final value at once', async () => {
    @Component({
      imports: [KnNumber],
      template: `<kn-number [value]="total()" locale="en" [options]="money" />`,
    })
    class Host {
      readonly total = signal(1250);
      readonly money: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      };
    }
    const { fixture, container } = await render(Host);
    const [spoken, shown] = Array.from(container.querySelectorAll('kn-number span'));
    expect(spoken).toHaveTextContent('$1,250');
    expect(shown).toHaveTextContent('$1,250');
    expect(shown).toHaveAttribute('aria-hidden', 'true');

    fixture.componentInstance.total.set(9800);
    await fixture.whenStable();
    // The spoken value never passes through intermediate frames
    expect(spoken).toHaveTextContent('$9,800');
  });

  it('jumps straight to the value when the duration is zero', async () => {
    @Component({
      imports: [KnNumber],
      template: `<kn-number [value]="n()" [duration]="0" locale="en" />`,
    })
    class Host {
      readonly n = signal(1);
    }
    const { fixture, container } = await render(Host);
    fixture.componentInstance.n.set(42);
    await fixture.whenStable();
    expect(container.querySelector('[aria-hidden]')).toHaveTextContent('42');
  });
});

describe('KnReveal', () => {
  it('leaves content visible where there is nothing to observe with', async () => {
    await render(`<p knReveal>Text</p><p knReveal="zoom" [knRevealIndex]="2">More</p>`, {
      imports: [KnReveal],
    });
    expect(screen.getByText('Text').style.opacity).toBe('');
    expect(screen.getByText('More').style.animation).toBe('');
  });
});

describe('ripple', () => {
  const press = (target: HTMLElement): void => {
    spawnRipple(target, {
      pointerType: 'mouse',
      button: 0,
      clientX: 10,
      clientY: 10,
    } as PointerEvent);
  };

  beforeEach(() => {
    // jsdom has no Web Animations API
    HTMLElement.prototype.animate = vi.fn(() => ({ finished: new Promise(() => {}) })) as never;
  });

  afterEach(() => {
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  it('draws nothing unless the style switches the wave on', async () => {
    await render(`<button knRipple>Tap</button>`, { imports: [KnRipple] });
    const button = screen.getByRole('button');
    press(button);
    expect(button.querySelector('[data-kn-ripple]')).toBeNull();
  });

  it('draws a wave hidden from assistive technology when the token is set', async () => {
    await render(`<button knRipple style="--kn-ripple-opacity: 0.14">Tap</button>`, {
      imports: [KnRipple],
    });
    const button = screen.getByRole('button', { name: 'Tap' });
    press(button);
    const wave = button.querySelector('[data-kn-ripple]');
    expect(wave).toHaveAttribute('aria-hidden', 'true');
    expect(button.style.position).toBe('relative');
  });

  it('ignores disabled elements and secondary mouse buttons', async () => {
    await render(
      `<button knRipple disabled style="--kn-ripple-opacity: 0.14">Off</button>
       <button knRipple style="--kn-ripple-opacity: 0.14">On</button>`,
      { imports: [KnRipple] },
    );
    const [off, on] = screen.getAllByRole('button');
    press(off);
    spawnRipple(on, { pointerType: 'mouse', button: 2, clientX: 1, clientY: 1 } as PointerEvent);
    expect(off.querySelector('[data-kn-ripple]')).toBeNull();
    expect(on.querySelector('[data-kn-ripple]')).toBeNull();
  });
});
