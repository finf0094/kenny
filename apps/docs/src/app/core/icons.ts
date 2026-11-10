import { provideKnIcons } from '@kenny/ui/icon';
import * as icons from '@kenny/ui/icon';

/** kebab-case name → markup for every optional icon: `knIconPanelLeft` → `panel-left`. */
const all = Object.fromEntries(
  Object.entries(icons)
    .filter((entry): entry is [string, string] => entry[0].startsWith('knIcon') && typeof entry[1] === 'string')
    .map(([key, value]) => [
      key
        .slice('knIcon'.length)
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase(),
      value,
    ]),
);

/** The docs use the whole optional icon set; applications should register only what they need. */
export const docsIcons = provideKnIcons(all);
export const docsIconNames = Object.keys(all).sort();
