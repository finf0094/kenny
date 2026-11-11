const SAFETY_TIMEOUT = 1200;

/**
 * Resolves when every finite CSS animation/transition running on `element`
 * (and its subtree) has finished. Used to delay DOM removal until an exit
 * animation is done. Resolves immediately where the Web Animations API is
 * unavailable (SSR, jsdom) and never waits longer than a safety timeout.
 */
export function waitForAnimations(element: Element | null | undefined): Promise<void> {
  if (!element || typeof element.getAnimations !== 'function') {
    return Promise.resolve();
  }
  const running = element.getAnimations({ subtree: true }).filter((animation) => {
    const iterations = animation.effect?.getComputedTiming().iterations;
    return iterations !== Infinity;
  });
  if (running.length === 0) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, SAFETY_TIMEOUT);
    void Promise.allSettled(running.map((animation) => animation.finished)).then(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

/**
 * Plays the exit animation of an element: sets `data-kn-state="closing"`,
 * which component styles map to an `-out` keyframe, and waits for it.
 */
export async function playExit(element: Element | null | undefined): Promise<void> {
  if (!element) {
    return;
  }
  element.setAttribute('data-kn-state', 'closing');
  await waitForAnimations(element);
}

/**
 * Resolves a duration token to milliseconds on a given element. Tokens are `calc()`
 * expressions, which a custom property keeps unevaluated — so the value is read through
 * a real property instead.
 */
export function resolveDuration(element: HTMLElement, token: string): number {
  const view = element.ownerDocument.defaultView;
  if (!view) return 0;
  const before = element.style.getPropertyValue('animation-duration');
  element.style.setProperty('animation-duration', `var(${token})`);
  const value = view.getComputedStyle(element).animationDuration.split(',')[0].trim();
  if (before) element.style.setProperty('animation-duration', before);
  else element.style.removeProperty('animation-duration');
  const number = parseFloat(value);
  if (!Number.isFinite(number)) return 0;
  return value.endsWith('ms') ? number : number * 1000;
}
