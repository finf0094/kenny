import { KnLabels, knLabelsEn, provideKnLabels } from '@kenny/ui/core';

// Свои формулировки: перечислите только то, что отличается.
// Остальное останется таким, как в наборе локали.
export const wording = provideKnLabels({
  dialog: { close: 'Свернуть окно' },
  pagination: { page: (page) => `Лист ${page}` },
  table: { empty: 'Пока пусто' },
});

// Язык, которого нет в комплекте: полный набор. Тип KnLabels не даст пропустить строку.
const kk: KnLabels = {
  ...knLabelsEn,
  dialog: { close: 'Жабу' },
  select: { placeholder: 'Таңдаңыз…' },
  // …и остальные группы
};
export const kazakh = provideKnLabels(kk);
