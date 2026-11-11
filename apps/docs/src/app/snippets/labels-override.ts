import { knLabelsRu, provideKnLabels } from '@kenny/ui/core';

// Свой язык или своя формулировка: достаточно перечислить то, что отличается.
// Всё пропущенное останется английским — или возьмите готовый набор за основу.
export const labels = provideKnLabels({
  ...knLabelsRu,
  dialog: { close: 'Свернуть окно' },
  pagination: {
    ...knLabelsRu.pagination,
    page: (page) => `Лист ${page}`,
  },
  table: { ...knLabelsRu.table, empty: 'Пока пусто' },
});
