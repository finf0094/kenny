import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { KnField } from '@kenny/ui/field';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnTagInput } from './tag-input';

@Component({
  imports: [KnTagInput],
  template: `<kn-tag-input
    aria-label="Tags"
    [max]="max()"
    [validate]="validate"
    [(value)]="tags"
    (rejected)="rejected.set($event.reason)"
  />`,
})
class Host {
  readonly tags = signal<string[]>(['design']);
  readonly max = signal<number | null>(null);
  readonly rejected = signal<string | null>(null);
  readonly validate = (tag: string): boolean => !tag.includes('!');
}

async function setup() {
  const { fixture } = await render(Host);
  const user = userEvent.setup();
  return {
    host: fixture.componentInstance,
    user,
    field: screen.getByRole('textbox', { name: 'Tags' }),
  };
}

describe('KnTagInput', () => {
  it('adds a tag on Enter and on a separator, trimming it', async () => {
    const { host, user, field } = await setup();
    await user.type(field, '  urgent {Enter}');
    expect(host.tags()).toEqual(['design', 'urgent']);
    expect(field).toHaveValue('');
    await user.type(field, 'backend,copy;');
    expect(host.tags()).toEqual(['design', 'urgent', 'backend', 'copy']);
    expect(screen.getByRole('status')).toHaveTextContent('copy added');
  });

  it('marks the last tag on Backspace and removes it on the next one', async () => {
    const { host, user, field } = await setup();
    await user.type(field, 'urgent{Enter}');
    await user.keyboard('{Backspace}');
    expect(host.tags()).toEqual(['design', 'urgent']);
    expect(screen.getByRole('status')).toHaveTextContent('urgent. Backspace removes it');
    await user.keyboard('{Backspace}');
    expect(host.tags()).toEqual(['design']);
  });

  it('walks over the tags with the arrows and removes the marked one', async () => {
    const { host, user, field } = await setup();
    await user.type(field, 'a{Enter}b{Enter}');
    await user.keyboard('{ArrowLeft}{ArrowLeft}{Delete}');
    expect(host.tags()).toEqual(['design', 'b']);
    await user.keyboard('{Escape}{Backspace}{Escape}');
    expect(host.tags()).toEqual(['design', 'b']);
  });

  it('removes any tag with its button, named after the tag', async () => {
    const { host, user, field } = await setup();
    await user.type(field, 'urgent{Enter}');
    await user.click(screen.getByRole('button', { name: 'Remove design' }));
    expect(host.tags()).toEqual(['urgent']);
  });

  it('splits pasted text and keeps what was rejected in the field', async () => {
    const { host, user, field } = await setup();
    await user.click(field);
    await user.paste('Design, mail; bad!\nlast');
    expect(host.tags()).toEqual(['design', 'mail', 'last']);
    expect(field).toHaveValue('Design bad!');
  });

  it('rejects duplicates, invalid tags and anything over the limit', async () => {
    const { host, user, field } = await setup();
    await user.type(field, 'DESIGN{Enter}');
    expect(host.rejected()).toBe('duplicate');
    expect(field).toHaveValue('DESIGN');
    await user.clear(field);
    await user.type(field, 'no!{Enter}');
    expect(host.rejected()).toBe('invalid');
    await user.clear(field);
    host.max.set(1);
    await user.type(field, 'more{Enter}');
    expect(host.rejected()).toBe('limit');
    expect(host.tags()).toEqual(['design']);
  });

  it('turns unfinished text into a tag when focus leaves', async () => {
    const { host, user, field } = await setup();
    await user.type(field, 'draft');
    await user.tab();
    expect(host.tags()).toEqual(['design', 'draft']);
  });

  it('works with reactive forms', async () => {
    const control = new FormControl<string[]>(['a'], { nonNullable: true });
    const { fixture } = await render(`<kn-tag-input aria-label="Tags" [formControl]="control" />`, {
      imports: [KnTagInput, ReactiveFormsModule],
      componentProperties: { control },
    });
    const field = screen.getByRole('textbox');
    await userEvent.type(field, 'b{Enter}');
    expect(control.value).toEqual(['a', 'b']);
    control.disable();
    await fixture.whenStable();
    expect(field).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove a' })).toBeDisabled();
  });

  it('works with signal forms', async () => {
    @Component({
      imports: [KnTagInput, FormField],
      template: `<kn-tag-input aria-label="Tags" [formField]="f.tags" />`,
    })
    class SignalHost {
      readonly model = signal<{ tags: string[] }>({ tags: [] });
      readonly f = form(this.model);
    }
    const { fixture } = await render(SignalHost);
    await userEvent.type(screen.getByRole('textbox'), 'x{Enter}');
    expect(fixture.componentInstance.model().tags).toEqual(['x']);
  });

  it('has no accessibility violations, alone and inside a field', async () => {
    const { container } = await render(
      `<kn-tag-input aria-label="Tags" [value]="['a', 'b']" />
       <kn-field label="Keywords" hint="Up to five"><kn-tag-input [value]="['c']" /></kn-field>`,
      { imports: [KnTagInput, KnField] },
    );
    await expectNoA11yViolations(container);
    expect(screen.getByRole('textbox', { name: 'Keywords' })).toBeInTheDocument();
  });
});
