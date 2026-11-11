import { LOCALE_ID, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { KnPagination } from '@kenny/ui/pagination';
import { KnSelect } from '@kenny/ui/select';
import { KnSpinner } from '@kenny/ui/spinner';
import { KnLabelsOverride, knLabelsEn, knLabelsRu, provideKnLabels } from './labels';

const imports = [KnPagination, KnSelect, KnSpinner];
const template = `
  <kn-pagination [total]="50" [pageSize]="10" />
  <kn-select aria-label="Role" />
  <kn-spinner />`;

describe('provideKnLabels', () => {
  it('speaks English by default', async () => {
    await render(template, { imports });
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.getByText('Select…')).toBeInTheDocument();
  });

  it('follows LOCALE_ID without any provider', async () => {
    await render(template, { imports, providers: [{ provide: LOCALE_ID, useValue: 'ru-RU' }] });
    expect(screen.getByRole('navigation', { name: 'Страницы' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Загрузка' })).toBeInTheDocument();
    expect(screen.getByText('Выберите…')).toBeInTheDocument();
  });

  it("keeps the locale's own texts where an override leaves them out", async () => {
    await render(template, {
      imports,
      providers: [
        { provide: LOCALE_ID, useValue: 'ru' },
        provideKnLabels({ pagination: { next: 'Дальше' } }),
      ],
    });
    expect(screen.getByRole('button', { name: 'Дальше' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Предыдущая страница' })).toBeInTheDocument();
  });

  it('lets a full set win over the locale', async () => {
    await render(template, {
      imports,
      providers: [{ provide: LOCALE_ID, useValue: 'ru' }, provideKnLabels(knLabelsEn)],
    });
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
  });

  it('switches every built-in text to a ready set', async () => {
    await render(template, { imports, providers: [provideKnLabels(knLabelsRu)] });
    expect(screen.getByRole('navigation', { name: 'Страницы' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Следующая страница' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Страница 2' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Загрузка' })).toBeInTheDocument();
    expect(screen.getByText('Выберите…')).toBeInTheDocument();
  });

  it('merges a partial override over English', async () => {
    await render(template, {
      imports,
      providers: [provideKnLabels({ pagination: { next: 'Forward' } })],
    });
    expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
  });

  it('follows a signal, so the language changes without a reload', async () => {
    const labels = signal<KnLabelsOverride>(knLabelsEn);
    const { fixture } = await render(template, {
      imports,
      providers: [provideKnLabels(() => labels)],
    });
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    labels.set(knLabelsRu);
    await fixture.whenStable();
    expect(screen.getByRole('button', { name: 'Следующая страница' })).toBeInTheDocument();
    expect(screen.getByText('Выберите…')).toBeInTheDocument();
  });

  it('lets an input win over the provided label', async () => {
    await render(`<kn-spinner label="Saving" />`, {
      imports,
      providers: [provideKnLabels(knLabelsRu)],
    });
    expect(screen.getByRole('progressbar', { name: 'Saving' })).toBeInTheDocument();
  });

  it('ships sets with the same keys', () => {
    const shape = (labels: object) =>
      Object.entries(labels).map(([group, value]) => [group, Object.keys(value as object).sort()]);
    expect(shape(knLabelsRu)).toEqual(shape(knLabelsEn));
  });
});
