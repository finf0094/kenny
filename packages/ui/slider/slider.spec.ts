import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, screen } from '@testing-library/angular';
import { KnField } from '@kenny/ui/field';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnSlider } from './slider';

describe('KnSlider', () => {
  it('exposes a native slider with range attributes', async () => {
    await render(
      `<kn-slider aria-label="Громкость" [min]="0" [max]="10" [step]="2" [value]="4" />`,
      {
        imports: [KnSlider],
      },
    );
    const slider = screen.getByRole('slider', { name: 'Громкость' });
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '10');
    expect(slider).toHaveAttribute('step', '2');
    expect(slider).toHaveValue('4');
  });

  it('writes user input to a reactive form and reflects form writes', async () => {
    const control = new FormControl(20, { nonNullable: true });
    const { fixture } = await render(`<kn-slider aria-label="Яркость" [formControl]="control" />`, {
      imports: [KnSlider, ReactiveFormsModule],
      componentProperties: { control },
    });
    const slider = screen.getByRole('slider');
    fireEvent.input(slider, { target: { value: '65' } });
    expect(control.value).toBe(65);

    control.setValue(10);
    await fixture.whenStable();
    expect(slider).toHaveValue('10');
    expect(
      fixture.nativeElement.querySelector('kn-slider').style.getPropertyValue('--_ratio'),
    ).toBe('0.1');
  });

  it('announces formatted values', async () => {
    const format = (v: number) => `${v} %`;
    await render(`<kn-slider aria-label="Яркость" [value]="40" [formatValue]="format" />`, {
      imports: [KnSlider],
      componentProperties: { format },
    });
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '40 %');
  });

  it('is labelled by its field and has no accessibility violations', async () => {
    const { container } = await render(`<kn-field label="Громкость"><kn-slider /></kn-field>`, {
      imports: [KnSlider, KnField],
    });
    expect(screen.getByRole('slider', { name: 'Громкость' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
