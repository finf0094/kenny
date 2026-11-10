import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Type,
} from '@angular/core';

/**
 * Loads the styles of a template-less component once per application.
 * Used by directives (which cannot declare styles): the component is created
 * detached, which is enough for Angular to add its stylesheet to the document
 * — on the server as well as in the browser.
 */
@Injectable({ providedIn: 'root' })
export class KnStyleLoader {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly loaded = new Set<Type<unknown>>();

  load(component: Type<unknown>): void {
    if (this.loaded.has(component)) return;
    this.loaded.add(component);
    const ref = createComponent(component, { environmentInjector: this.injector });
    this.appRef.onDestroy(() => {
      this.loaded.delete(component);
      ref.destroy();
    });
  }
}
