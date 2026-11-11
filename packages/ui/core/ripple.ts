import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, ElementRef, inject, PLATFORM_ID } from '@angular/core';

const GROW = 480;
const FADE = 260;

/**
 * A wave that spreads from the point of a press. Whether it shows is a matter of style,
 * not of code: the wave is drawn only where `--kn-ripple-opacity` is above zero, so one
 * token switches it on for a whole preset, a block of the page or a single component.
 *
 * `--kn-ripple-opacity` — strength (0 — off, 0.12–0.16 reads well);
 * `--kn-ripple-color` — colour, the text colour of the pressed element by default.
 *
 * Only `transform` and `opacity` are animated; nothing is drawn under
 * `prefers-reduced-motion: reduce`.
 */
export function spawnRipple(target: HTMLElement, event: PointerEvent): void {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  if (typeof target.animate !== 'function') return;
  if (target.matches(':disabled, [aria-disabled="true"], [data-disabled]')) return;
  const view = target.ownerDocument.defaultView;
  if (!view || view.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const style = view.getComputedStyle(target);
  const opacity = parseFloat(style.getPropertyValue('--kn-ripple-opacity'));
  if (!(opacity > 0)) return;
  if (style.position === 'static') target.style.position = 'relative';

  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
  const speed = parseFloat(style.getPropertyValue('--kn-duration-scale')) || 1;

  const clip = target.ownerDocument.createElement('span');
  clip.setAttribute('aria-hidden', 'true');
  clip.setAttribute('data-kn-ripple', '');
  clip.style.cssText =
    'position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;';
  const wave = target.ownerDocument.createElement('span');
  wave.style.cssText =
    `position:absolute;left:${x - radius}px;top:${y - radius}px;` +
    `width:${radius * 2}px;height:${radius * 2}px;border-radius:50%;` +
    `background:var(--kn-ripple-color, currentColor);opacity:${opacity};transform:scale(0);`;
  clip.append(wave);
  target.append(clip);

  const grow = wave.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
    duration: GROW * speed,
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
    fill: 'forwards',
  });

  let released = false;
  const release = (): void => {
    if (released) return;
    released = true;
    view.removeEventListener('pointerup', release);
    view.removeEventListener('pointercancel', release);
    target.removeEventListener('pointerleave', release);
    const remove = (): void => clip.remove();
    // The wave always finishes spreading, then fades: a quick tap still reads as a wave
    grow.finished
      .then(
        () => clip.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE * speed }).finished,
      )
      .then(remove, remove);
  };
  view.addEventListener('pointerup', release);
  view.addEventListener('pointercancel', release);
  target.addEventListener('pointerleave', release);
}

/**
 * Gives the host component a press ripple. With a selector the wave is drawn on the
 * matching descendant that was pressed — for components that render several buttons.
 * Call in an injection context (a constructor or a field initialiser).
 */
export function useRipple(selector?: string): void {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
  const onDown = (event: PointerEvent): void => {
    const target = selector
      ? (event.target as Element | null)?.closest<HTMLElement>(selector)
      : host;
    if (target && host.contains(target)) spawnRipple(target, event);
  };
  host.addEventListener('pointerdown', onDown, { passive: true });
  inject(DestroyRef).onDestroy(() => host.removeEventListener('pointerdown', onDown));
}
