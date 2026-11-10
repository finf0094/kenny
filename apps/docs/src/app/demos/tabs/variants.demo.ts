import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnTab, KnTabs } from '@kenny/ui/tabs';

@Component({
  imports: [KnTabs, KnTab],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-tabs variant="underline" aria-label="Разделы проекта">
      <kn-tab value="overview" label="Обзор" icon="home"
        >Линия-индикатор едет под активную вкладку.</kn-tab
      >
      <kn-tab value="files" label="Файлы" icon="folder">Файлы проекта.</kn-tab>
      <kn-tab value="settings" label="Настройки" icon="sliders">Настройки проекта.</kn-tab>
    </kn-tabs>

    <kn-tabs stretch size="lg" aria-label="Вид">
      <kn-tab value="list" label="Список">Вкладки растянуты на всю ширину.</kn-tab>
      <kn-tab value="board" label="Доска">Доска.</kn-tab>
      <kn-tab value="timeline" label="Таймлайн">Таймлайн.</kn-tab>
    </kn-tabs>

    <kn-tabs size="sm" aria-label="Язык">
      <kn-tab value="ts" label="TypeScript">Маленький размер.</kn-tab>
      <kn-tab value="html" label="HTML">HTML.</kn-tab>
      <kn-tab value="css" label="CSS">CSS.</kn-tab>
    </kn-tabs>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-8);
      max-inline-size: 32rem;
    }
  `,
})
export default class TabsVariantsDemo {}
