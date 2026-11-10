import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnBreadcrumb, KnBreadcrumbs } from '@kenny/ui/breadcrumbs';
import { KnIcon } from '@kenny/ui/icon';

@Component({
  imports: [KnBreadcrumbs, KnBreadcrumb, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-breadcrumbs>
      <kn-breadcrumb>
        <a href="#home"><kn-icon name="home" [size]="16" label="Главная" /></a>
      </kn-breadcrumb>
      <kn-breadcrumb><a href="#projects">Проекты</a></kn-breadcrumb>
      <kn-breadcrumb><a href="#kenny">Kenny</a></kn-breadcrumb>
      <kn-breadcrumb current>Настройки доступа</kn-breadcrumb>
    </kn-breadcrumbs>
  `,
})
export default class BreadcrumbsBasicDemo {}
