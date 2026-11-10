import {
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import {
  ConnectedPosition,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
  OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { playExit } from './motion';
import { KnPlacement, KnSide } from './types';

type Align = 'start' | 'center' | 'end';

const OPPOSITE: Record<KnSide, KnSide> = {
  top: 'bottom',
  bottom: 'top',
  start: 'end',
  end: 'start',
};

function position(side: KnSide, align: Align, offset: number): ConnectedPosition {
  const vertical = { start: 'top', center: 'center', end: 'bottom' } as const;
  switch (side) {
    case 'top':
      return { originX: align, overlayX: align, originY: 'top', overlayY: 'bottom', offsetY: -offset };
    case 'bottom':
      return { originX: align, overlayX: align, originY: 'bottom', overlayY: 'top', offsetY: offset };
    case 'start':
      return {
        originX: 'start',
        overlayX: 'end',
        originY: vertical[align],
        overlayY: vertical[align],
        offsetX: -offset,
      };
    case 'end':
      return {
        originX: 'end',
        overlayX: 'start',
        originY: vertical[align],
        overlayY: vertical[align],
        offsetX: offset,
      };
  }
}

/**
 * Turns a placement like `bottom-start` into an ordered list of CDK positions:
 * the preferred one first, then the flipped side, then the other alignments.
 */
export function knPositions(placement: KnPlacement, offset = 8): ConnectedPosition[] {
  const [side, alignment] = placement.split('-') as [KnSide, 'start' | 'end' | undefined];
  const align: Align = alignment ?? 'center';
  const aligns: Align[] = [align, ...(['start', 'center', 'end'] as const).filter((a) => a !== align)];
  const sides: KnSide[] = [side, OPPOSITE[side]];
  return sides.flatMap((s) => aligns.map((a) => position(s, a, offset)));
}

export interface KnOverlayOpenOptions {
  /** Element the overlay is attached to. */
  origin: ElementRef<HTMLElement> | HTMLElement;
  /** Content to render. */
  template: TemplateRef<unknown>;
  placement?: KnPlacement;
  /** Gap between the origin and the overlay, px. */
  offset?: number;
  /** Make the overlay at least as wide as the origin. */
  matchWidth?: boolean;
  /** CSS selector of the element whose `transform-origin` should follow the position. */
  transformOriginOn?: string;
  /** Extra class on the overlay pane. */
  panelClass?: string | string[];
  /** Close when Escape is pressed (default: true). */
  closeOnEscape?: boolean;
  /** Close on pointer down outside of overlay and origin (default: true). */
  closeOnOutsideClick?: boolean;
}

/**
 * A single anchored overlay with enter/exit animation, shared by Popover, Tooltip,
 * Select, Combobox and DatePicker. Create it in an injection context of the owner.
 *
 * Exit: the first element of the overlay gets `data-kn-state="closing"`; the overlay
 * is detached only after its animations settle.
 */
export class KnAnchoredOverlay {
  private readonly injector = inject(Injector);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly directionality = inject(Directionality, { optional: true });
  private overlayRef: OverlayRef | null = null;
  private generation = 0;

  /** True from the moment the overlay opens until its exit animation starts. */
  readonly isOpen = signal(false);
  /** Emits when the overlay asks to be closed by Escape or an outside click. */
  readonly dismissed = new Subject<'escape' | 'outside'>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.overlayRef?.dispose();
      this.dismissed.complete();
    });
  }

  /** The rendered root element of the overlay content, if open. */
  get panel(): HTMLElement | null {
    return (this.overlayRef?.overlayElement.firstElementChild as HTMLElement | null) ?? null;
  }

  open(options: KnOverlayOpenOptions): void {
    this.generation++;
    this.overlayRef?.dispose();

    const positionStrategy = createFlexibleConnectedPositionStrategy(this.injector, options.origin)
      .withPositions(knPositions(options.placement ?? 'bottom-start', options.offset ?? 8))
      .withFlexibleDimensions(false)
      .withPush(true)
      .withViewportMargin(8);
    if (options.transformOriginOn) {
      positionStrategy.withTransformOriginOn(options.transformOriginOn);
    }

    const originElement =
      options.origin instanceof ElementRef ? options.origin.nativeElement : options.origin;
    const ref = createOverlayRef(this.injector, {
      positionStrategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
      direction: this.directionality ?? undefined,
      panelClass: options.panelClass,
      minWidth: options.matchWidth ? originElement.getBoundingClientRect().width : undefined,
    });
    this.overlayRef = ref;
    ref.attach(new TemplatePortal(options.template, this.viewContainer));

    if (options.closeOnEscape !== false) {
      ref.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape' && !event.defaultPrevented) {
          event.preventDefault();
          event.stopPropagation();
          this.dismissed.next('escape');
        }
      });
    }
    if (options.closeOnOutsideClick !== false) {
      ref.outsidePointerEvents().subscribe((event) => {
        const target = event.target as Node | null;
        if (!target || !originElement.contains(target)) {
          this.dismissed.next('outside');
        }
      });
    }
    this.isOpen.set(true);
  }

  /** Recomputes the position, e.g. after the content changed size. */
  reposition(): void {
    this.overlayRef?.updatePosition();
  }

  /** Plays the exit animation and removes the overlay. */
  async close(): Promise<void> {
    const ref = this.overlayRef;
    if (!ref || !this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    const generation = this.generation;
    await playExit(this.panel);
    if (generation === this.generation) {
      ref.dispose();
      this.overlayRef = null;
    }
  }
}
