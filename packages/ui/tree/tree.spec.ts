import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnTree, KnTreeNode, KnTreeNodeTemplate } from './tree';

const NODES: KnTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'app', label: 'app', children: [{ id: 'main', label: 'main.ts' }] },
      { id: 'styles', label: 'styles.css' },
      { id: 'secret', label: 'secret.env', disabled: true },
    ],
  },
  { id: 'readme', label: 'README.md' },
  { id: 'package', label: 'package.json' },
];

@Component({
  imports: [KnTree],
  template: `<kn-tree
    aria-label="Files"
    [nodes]="nodes"
    [(selected)]="selected"
    [(expanded)]="expanded"
    (activated)="opened.set($event.id)"
  />`,
})
class Host {
  readonly nodes = NODES;
  readonly selected = signal<string | null>(null);
  readonly expanded = signal<string[]>(['src']);
  readonly opened = signal<string | null>(null);
}

async function setup() {
  const { fixture } = await render(Host);
  return { host: fixture.componentInstance, user: userEvent.setup() };
}
const item = (name: string): HTMLElement => screen.getByRole('treeitem', { name });

describe('KnTree', () => {
  it('renders visible nodes with their level, position and state', async () => {
    await setup();
    expect(screen.getByRole('tree', { name: 'Files' })).toBeInTheDocument();
    expect(screen.getAllByRole('treeitem').map((node) => node.textContent?.trim())).toEqual([
      'src',
      'app',
      'styles.css',
      'secret.env',
      'README.md',
      'package.json',
    ]);
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    expect(item('app')).toHaveAttribute('aria-expanded', 'false');
    expect(item('app')).toHaveAttribute('aria-level', '2');
    expect(item('styles.css')).toHaveAttribute('aria-posinset', '2');
    expect(item('styles.css')).toHaveAttribute('aria-setsize', '3');
    expect(item('styles.css')).not.toHaveAttribute('aria-expanded');
    expect(item('secret.env')).toHaveAttribute('aria-disabled', 'true');
  });

  it('selects on click, toggles a branch and reports the activation', async () => {
    const { host, user } = await setup();
    await user.click(item('styles.css'));
    expect(host.selected()).toBe('styles');
    expect(host.opened()).toBe('styles');
    expect(item('styles.css')).toHaveAttribute('aria-selected', 'true');
    await user.click(item('app'));
    expect(host.expanded()).toEqual(['src', 'app']);
    expect(item('main.ts')).toHaveAttribute('aria-level', '3');
    await user.click(item('secret.env'));
    expect(host.selected()).toBe('app');
  });

  it('is one tab stop; arrows walk visible nodes and skip disabled ones', async () => {
    const { host, user } = await setup();
    await user.tab();
    expect(item('src')).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(item('README.md')).toHaveFocus();
    await user.keyboard('{End}');
    expect(item('package.json')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(item('src')).toHaveFocus();
    // Moving the focus selects nothing
    expect(host.selected()).toBeNull();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('opens, steps in, steps out and closes with the horizontal arrows', async () => {
    const { host, user } = await setup();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(item('app')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(host.expanded()).toEqual(['src', 'app']);
    await user.keyboard('{ArrowRight}');
    expect(item('main.ts')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(item('app')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(host.expanded()).toEqual(['src']);
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(item('src')).toHaveFocus();
    expect(host.expanded()).toEqual([]);
  });

  it('activates with Enter and finds nodes by the letters typed', async () => {
    const { host, user } = await setup();
    await user.tab();
    await user.keyboard('p');
    expect(item('package.json')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(host.selected()).toBe('package');
    expect(host.opened()).toBe('package');
    await new Promise((done) => setTimeout(done, 650));
    await user.keyboard('st');
    expect(item('styles.css')).toHaveFocus();
  });

  it('renders a custom node template', async () => {
    await render(
      `<kn-tree aria-label="Files" [nodes]="nodes" [expanded]="['src']">
         <ng-template knTreeNode let-node let-level="level">{{ node.label }} · {{ level }}</ng-template>
       </kn-tree>`,
      { imports: [KnTree, KnTreeNodeTemplate], componentProperties: { nodes: NODES } },
    );
    expect(screen.getByRole('treeitem', { name: 'app · 2' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(
      `<kn-tree aria-label="Files" [nodes]="nodes" [expanded]="['src']" selected="styles" />`,
      { imports: [KnTree], componentProperties: { nodes: NODES } },
    );
    await expectNoA11yViolations(container);
  });
});
