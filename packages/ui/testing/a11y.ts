import axe from 'axe-core';

/**
 * Runs axe-core against a rendered element and fails the test on any violation.
 * Colour-contrast is skipped: jsdom has no layout engine, contrast is verified
 * against the tokens instead (see docs → Доступность).
 */
export async function expectNoA11yViolations(element: Element = document.body): Promise<void> {
  const results = await axe.run(element, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
    },
  });
  const summary = results.violations
    .map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.html).join('\n  ')}`)
    .join('\n');
  expect(summary).toBe('');
}
