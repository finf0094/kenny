/*
 * Kenny icon set: 24×24, drawn with a 1.75 stroke and round joins.
 * Each icon is the inner markup of an <svg>. The set is intentionally small:
 * `KN_CORE_ICONS` is what the components themselves need; everything else is a
 * separate export so unused icons are tree-shaken.
 */

const dot = (cx: number, cy: number, r = 1.25) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="none"/>`;
const p = (d: string) => `<path d="${d}"/>`;

export const knIconCheck = p('M5 12.5l4.5 4.5L19 7.5');
export const knIconMinus = p('M5 12h14');
export const knIconPlus = p('M12 5v14M5 12h14');
export const knIconX = p('M6 6l12 12M18 6L6 18');
export const knIconChevronDown = p('M6 9l6 6 6-6');
export const knIconChevronUp = p('M6 15l6-6 6 6');
export const knIconChevronLeft = p('M15 6l-6 6 6 6');
export const knIconChevronRight = p('M9 6l6 6-6 6');
export const knIconChevronsUpDown = p('M8 9.5l4-4 4 4M8 14.5l4 4 4-4');
export const knIconSearch = `<circle cx="11" cy="11" r="6.5"/>${p('M20 20l-4.2-4.2')}`;
export const knIconCalendar = `<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/>${p('M3.5 10h17M8 3v4M16 3v4')}`;
export const knIconMore = dot(5, 12, 1.4) + dot(12, 12, 1.4) + dot(19, 12, 1.4);
export const knIconArrowUp = p('M12 19V5M6 11l6-6 6 6');
export const knIconArrowDown = p('M12 5v14M6 13l6 6 6-6');
export const knIconArrowLeft = p('M19 12H5M11 6l-6 6 6 6');
export const knIconArrowRight = p('M5 12h14M13 6l6 6-6 6');
export const knIconInfo = `<circle cx="12" cy="12" r="9"/>${p('M12 11v5.5')}${dot(12, 7.75, 1.1)}`;
export const knIconAlert = `${p('M12 4l9 15.5H3L12 4z')}${p('M12 10v4.5')}${dot(12, 17, 1.1)}`;
export const knIconCheckCircle = `<circle cx="12" cy="12" r="9"/>${p('M8 12.5l2.8 2.8L16 9.8')}`;
export const knIconXCircle = `<circle cx="12" cy="12" r="9"/>${p('M9 9l6 6M15 9l-6 6')}`;

/** Icons used internally by Kenny components. Always registered. */
export const KN_CORE_ICONS: Record<string, string> = {
  check: knIconCheck,
  minus: knIconMinus,
  plus: knIconPlus,
  x: knIconX,
  'chevron-down': knIconChevronDown,
  'chevron-up': knIconChevronUp,
  'chevron-left': knIconChevronLeft,
  'chevron-right': knIconChevronRight,
  'chevrons-up-down': knIconChevronsUpDown,
  search: knIconSearch,
  calendar: knIconCalendar,
  more: knIconMore,
  'arrow-up': knIconArrowUp,
  'arrow-down': knIconArrowDown,
  'arrow-left': knIconArrowLeft,
  'arrow-right': knIconArrowRight,
  info: knIconInfo,
  alert: knIconAlert,
  'check-circle': knIconCheckCircle,
  'x-circle': knIconXCircle,
};

/* ---- Optional icons: import what you need and register with provideKnIcons() ---- */

export const knIconSun = `<circle cx="12" cy="12" r="4"/>${p('M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4')}`;
export const knIconMoon = p('M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.6 6.6 0 0 0 10.7 10.7z');
export const knIconMonitor = `<rect x="3" y="4.5" width="18" height="12" rx="2.5"/>${p('M8.5 20h7M12 16.5V20')}`;
export const knIconCopy = `<rect x="8.5" y="8.5" width="12" height="12" rx="3"/>${p('M15.5 8.5v-2a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h2')}`;
export const knIconMenu = p('M4 7h16M4 12h16M4 17h16');
export const knIconPanelLeft = `<rect x="3.5" y="4.5" width="17" height="15" rx="3.5"/>${p('M9.5 4.5v15')}`;
export const knIconSliders = `${p('M4 7h9M17 7h3M4 17h3M11 17h9')}<circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>`;
export const knIconUser = `<circle cx="12" cy="8.5" r="3.5"/>${p('M5 20a7 7 0 0 1 14 0')}`;
export const knIconMail = `<rect x="3" y="5.5" width="18" height="13" rx="3"/>${p('M4 8.5l8 5 8-5')}`;
export const knIconInbox = p(
  'M3.5 13.5l3-7.5h11l3 7.5v4a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-4zM3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5',
);
export const knIconStar = p(
  'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5z',
);
export const knIconTrash = p(
  'M4.5 7h15M9.5 7V5A1.5 1.5 0 0 1 11 3.5h2A1.5 1.5 0 0 1 14.5 5v2M6.5 7l.8 11.2a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8L17.5 7',
);
export const knIconEdit = p('M4 20l1-4.5L16.5 4a2.1 2.1 0 0 1 3 3L8 18.5 4 20zM14.5 6l3 3');
export const knIconHome = p(
  'M4 11l8-7 8 7v7.5a1.5 1.5 0 0 1-1.5 1.5H14v-6h-4v6H5.5A1.5 1.5 0 0 1 4 18.5V11z',
);
export const knIconGrid =
  '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>';
export const knIconBell = p(
  'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15l1.5-2zM10 20.5a2.2 2.2 0 0 0 4 0',
);
export const knIconFolder = p(
  'M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7z',
);
export const knIconFile = p(
  'M6.5 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5zM13.5 3.5v4h4',
);
export const knIconLink = p(
  'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
);
export const knIconExternal = p(
  'M14 5h5v5M19 5l-8 8M17 14v3.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 17.5v-9A1.5 1.5 0 0 1 6.5 7H10',
);
export const knIconCode = p('M8.5 7l-5 5 5 5M15.5 7l5 5-5 5');
export const knIconCommand = p(
  'M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9zm0 0h6m-6 0v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15zm0 0v6m0 0H9m6 0v2.5a2.5 2.5 0 1 0 2.5-2.5H15zm-6 0v2.5A2.5 2.5 0 1 1 6.5 15H9z',
);
export const knIconAlignLeft = p('M4 6h16M4 10h10M4 14h16M4 18h10');
export const knIconAlignCenter = p('M4 6h16M7 10h10M4 14h16M7 18h10');
export const knIconAlignRight = p('M4 6h16M10 10h10M4 14h16M10 18h10');
export const knIconBold = p('M7 5h6a3.5 3.5 0 0 1 0 7H7V5zM7 12h7a3.5 3.5 0 0 1 0 7H7v-7z');
export const knIconItalic = p('M10 5h7M7 19h7M14 5l-4 14');
export const knIconUnderline = p('M7 4.5v6a5 5 0 0 0 10 0v-6M5.5 20h13');
export const knIconEye = `${p('M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z')}<circle cx="12" cy="12" r="3"/>`;
export const knIconLock = `<rect x="5" y="10.5" width="14" height="10" rx="2.5"/>${p('M8 10.5V8a4 4 0 0 1 8 0v2.5')}`;
export const knIconDownload = p('M12 4v11M7 10.5l5 5 5-5M5 19.5h14');
export const knIconUpload = p('M12 15.5v-11M7 9l5-5 5 5M5 19.5h14');
export const knIconFilter = p('M4 6h16M7 12h10M10 18h4');
export const knIconGrip =
  dot(9, 6, 1.3) +
  dot(15, 6, 1.3) +
  dot(9, 12, 1.3) +
  dot(15, 12, 1.3) +
  dot(9, 18, 1.3) +
  dot(15, 18, 1.3);
export const knIconZap = p('M13 3L5 13.5h6l-1 7.5 8-10.5h-6l1-7.5z');
export const knIconLayers = p('M12 3.5l9 5-9 5-9-5 9-5zM3 13l9 5 9-5');
export const knIconClock = `<circle cx="12" cy="12" r="9"/>${p('M12 7v5l3.2 2')}`;
export const knIconSend = p('M20.5 3.5l-7 17-3-7-7-3 17-7zM10.5 13.5l4-4');
export const knIconArchive = `<rect x="3" y="4.5" width="18" height="5" rx="1.5"/>${p('M5 9.5V18a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 18V9.5M10 13.5h4')}`;
export const knIconTag = `${p('M3.5 12.2V5.5a2 2 0 0 1 2-2h6.7l8.4 8.4a2 2 0 0 1 0 2.8l-5.9 5.9a2 2 0 0 1-2.8 0l-8.4-8.4z')}${dot(8, 8, 1.2)}`;
export const knIconHeart = p(
  'M12 20S4 15 4 9.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 8 1.9C20 15 12 20 12 20z',
);
export const knIconDroplet = p(
  'M12 3.5s6.5 6.2 6.5 10.5a6.5 6.5 0 0 1-13 0C5.5 9.7 12 3.5 12 3.5z',
);
export const knIconKeyboard = `<rect x="2.5" y="6" width="19" height="12" rx="3"/>${p('M7 14h10')}${dot(6.5, 10, 0.9)}${dot(10, 10, 0.9)}${dot(13.5, 10, 0.9)}${dot(17, 10, 0.9)}`;
export const knIconAccessibility = `${dot(12, 4.8, 1.7)}${p('M5 9l7 1.5L19 9M12 10.5V15M12 15l-3.5 5.5M12 15l3.5 5.5')}`;
export const knIconBox = p('M12 3l8.5 4.5v9L12 21l-8.5-4.5v-9L12 3zM3.5 7.5L12 12l8.5-4.5M12 12v9');
export const knIconBook = p(
  'M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7a2 2 0 0 1-2-2v-13zM5 17.5a2 2 0 0 1 2-2h12',
);
export const knIconChart = p('M5 20V10M12 20V4M19 20v-7');
export const knIconColumns = `<rect x="3.5" y="4.5" width="17" height="15" rx="3.5"/>${p('M9.2 4.5v15M14.8 4.5v15')}`;
export const knIconRefresh = p('M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5');
export const knIconMotion = p('M3 17c3 0 3-10 6-10s3 10 6 10 3-10 6-10');
