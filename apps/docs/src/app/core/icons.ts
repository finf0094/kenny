import { provideKnIcons } from '@kenny/ui/icon';
import * as icons from '@kenny/ui/icon';

/** kebab-case name → markup for every optional icon: `knIconPanelLeft` → `panel-left`. */
const all = Object.fromEntries(
  Object.entries(icons)
    .filter(
      (entry): entry is [string, string] =>
        entry[0].startsWith('knIcon') && typeof entry[1] === 'string',
    )
    .map(([key, value]) => [
      key
        .slice('knIcon'.length)
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase(),
      value,
    ]),
);

/** The docs use the whole optional icon set; applications should register only what they need. */
/** Icons the library does not ship: an application registers its own the same way. */
const own = {
  chat: '<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-7l-4.5 3.5v-3.5H5A1.5 1.5 0 0 1 3.5 16V7A1.5 1.5 0 0 1 5 5.5z"/>',
  flag: '<path d="M5.5 21V4M5.5 4.5h12l-2.5 4 2.5 4h-12"/>',
  cpu: '<path d="M7.5 6h9A1.5 1.5 0 0 1 18 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 16.5v-9A1.5 1.5 0 0 1 7.5 6zM9.5 9.5h5v5h-5zM10 3.5V6M14 3.5V6M10 18v2.5M14 18v2.5M3.5 10H6M3.5 14H6M18 10h2.5M18 14h2.5"/>',
};

export const docsIcons = provideKnIcons({ ...all, ...own });
export const docsIconNames = Object.keys(all).sort();
