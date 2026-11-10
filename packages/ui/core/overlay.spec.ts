import { inheritTheme, knPositions } from './overlay';

function scope(attributes: Record<string, string>): { source: HTMLElement; target: HTMLElement } {
  const outer = document.createElement('section');
  for (const [name, value] of Object.entries(attributes)) outer.setAttribute(name, value);
  const source = outer.appendChild(document.createElement('button'));
  document.body.append(outer);
  // Overlays are rendered at the end of <body>, outside of the scope
  const target = document.body.appendChild(document.createElement('div'));
  return { source, target };
}

describe('inheritTheme', () => {
  afterEach(() => document.body.replaceChildren());

  it('copies the theme of the nearest themed ancestor onto the overlay', () => {
    const { source, target } = scope({ 'data-theme': 'dark' });
    inheritTheme(source, target);
    expect(target).toHaveAttribute('data-theme', 'dark');
    expect(target).not.toHaveAttribute('data-kn-preset');
  });

  it('copies the style preset as well, so a popup matches the block it was opened from', () => {
    const { source, target } = scope({ 'data-theme': 'light', 'data-kn-preset': 'crisp' });
    inheritTheme(source, target);
    expect(target).toHaveAttribute('data-theme', 'light');
    expect(target).toHaveAttribute('data-kn-preset', 'crisp');
  });

  it('takes each attribute from its own nearest ancestor', () => {
    const { source, target } = scope({ 'data-kn-preset': 'tonal' });
    const inner = source.parentElement!.appendChild(document.createElement('div'));
    inner.setAttribute('data-theme', 'dark');
    inner.append(source);
    inheritTheme(source, target);
    expect(target).toHaveAttribute('data-theme', 'dark');
    expect(target).toHaveAttribute('data-kn-preset', 'tonal');
  });

  it('leaves the overlay untouched when nothing is scoped', () => {
    const { source, target } = scope({});
    inheritTheme(source, target);
    expect(target.attributes).toHaveLength(0);
  });
});

describe('knPositions', () => {
  it('starts with the requested placement and falls back to the opposite side', () => {
    const positions = knPositions('bottom-start');
    expect(positions[0]).toMatchObject({ originY: 'bottom', overlayY: 'top', originX: 'start' });
    expect(positions.some((p) => p.originY === 'top' && p.overlayY === 'bottom')).toBe(true);
  });
});
