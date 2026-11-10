import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { KnIcon } from '@kenny/ui/icon';
import { KnSidebarGroup, KnSidebarItem } from '@kenny/ui/sidebar';
import { componentGroups, examples, guides } from '../core/nav';

/** The documentation tree. Used in the desktop sidebar and in the mobile drawer. */
@Component({
  selector: 'docs-nav',
  imports: [RouterLink, RouterLinkActive, KnSidebarGroup, KnSidebarItem, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-sidebar-group label="Руководства">
      @for (item of guides; track item.path) {
        <a
          kn-sidebar-item
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
          [routerLink]="item.path"
          (click)="navigated.emit()"
        >
          <kn-icon knSidebarIcon [name]="item.icon ?? 'file'" [size]="18" />
          {{ item.title }}
        </a>
      }
    </kn-sidebar-group>
    @for (group of groups; track group.label) {
      <kn-sidebar-group [label]="group.label">
        @for (item of group.items; track item.slug) {
          <a
            kn-sidebar-item
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            [routerLink]="['/components', item.slug]"
            (click)="navigated.emit()"
          >
            {{ item.title }}
          </a>
        }
      </kn-sidebar-group>
    }
    <kn-sidebar-group label="Примеры">
      @for (item of examples; track item.path) {
        <a
          kn-sidebar-item
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
          [routerLink]="item.path"
          (click)="navigated.emit()"
        >
          <kn-icon knSidebarIcon [name]="item.icon ?? 'file'" [size]="18" />
          {{ item.title }}
        </a>
      }
    </kn-sidebar-group>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--kn-space-0-5);
    }
  `,
})
export class DocsNav {
  readonly navigated = output<void>();
  protected readonly guides = guides;
  protected readonly groups = componentGroups;
  protected readonly examples = examples;
}
