import { render, screen } from '@testing-library/angular';
import { KnCombobox } from '@kenny/ui/combobox';
import { KnDatePicker } from '@kenny/ui/date-picker';
import { KnInput, KnInputGroup, KnTextarea } from '@kenny/ui/input';
import { KnOption, KnSelect } from '@kenny/ui/select';

describe('kn-control: the shared field look', () => {
  it('is carried by the well of every kind of field, so one selector restyles them all', async () => {
    const { container } = await render(
      `<input knInput aria-label="Имя" />
       <textarea knTextarea aria-label="О себе"></textarea>
       <kn-input-group><input knInput aria-label="Поиск" /></kn-input-group>
       <kn-select aria-label="Роль"><kn-option value="a">А</kn-option></kn-select>
       <kn-combobox aria-label="Город"><kn-option value="a">А</kn-option></kn-combobox>
       <kn-date-picker aria-label="Срок" />`,
      {
        imports: [KnInput, KnTextarea, KnInputGroup, KnSelect, KnOption, KnCombobox, KnDatePicker],
      },
    );
    expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveClass('kn-control');
    expect(screen.getByRole('textbox', { name: 'О себе' })).toHaveClass('kn-control');
    expect(container.querySelector('kn-input-group')).toHaveClass('kn-control');
    expect(screen.getByRole('combobox', { name: 'Роль' })).toHaveClass('kn-control');
    expect(screen.getByRole('combobox', { name: 'Город' }).parentElement).toHaveClass('kn-control');
    expect(screen.getByRole('textbox', { name: 'Срок' }).parentElement).toHaveClass('kn-control');
  });

  it('reflects the size on the well itself', async () => {
    await render(
      `<input knInput knSize="sm" aria-label="Имя" />
       <kn-select size="lg" aria-label="Роль" />
       <kn-date-picker size="sm" aria-label="Срок" />`,
      { imports: [KnInput, KnSelect, KnDatePicker] },
    );
    expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('combobox', { name: 'Роль' })).toHaveAttribute('data-size', 'lg');
    expect(screen.getByRole('textbox', { name: 'Срок' }).parentElement).toHaveAttribute(
      'data-size',
      'sm',
    );
  });

  it('loads its stylesheet once, however many fields are on the page', async () => {
    await render(
      `<input knInput aria-label="A" /><input knInput aria-label="B" /><kn-select aria-label="C" />`,
      {
        imports: [KnInput, KnSelect],
      },
    );
    const sheets = Array.from(document.querySelectorAll('style')).filter((style) =>
      style.textContent?.includes('.kn-control {'),
    );
    expect(sheets).toHaveLength(1);
  });
});
