import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { KnField } from '@kenny/ui/field';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnFileUpload, KnRejectedFile } from './file-upload';

const file = (name: string, type: string, size = 1000): File =>
  new File([new Uint8Array(size)], name, { type });

@Component({
  imports: [KnFileUpload],
  template: `<kn-file-upload
    aria-label="Attachments"
    locale="en"
    accept=".pdf,image/*"
    [multiple]="multiple()"
    [maxSize]="5000"
    [maxFiles]="2"
    [(value)]="files"
    (rejected)="rejected.set($event)"
    >PDF or images, up to 5 kB</kn-file-upload
  >`,
})
class Host {
  readonly files = signal<File[]>([]);
  readonly multiple = signal(true);
  readonly rejected = signal<KnRejectedFile[]>([]);
}

async function setup() {
  const { fixture, container } = await render(Host);
  const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
  return {
    host: fixture.componentInstance,
    fixture,
    input,
    user: userEvent.setup({ applyAccept: false, pointerEventsCheck: 0 }),
  };
}

describe('KnFileUpload', () => {
  it('is a named button described by its hint; the native input stays out of the way', async () => {
    const { input } = await setup();
    const button = screen.getByRole('button', { name: 'Attachments' });
    expect(button).toHaveAccessibleDescription('PDF or images, up to 5 kB');
    expect(input).toHaveAttribute('tabindex', '-1');
    expect(input).toHaveAttribute('aria-hidden', 'true');
  });

  it('collects chosen files, lists them with sizes and removes them', async () => {
    const { host, input, user } = await setup();
    await user.upload(input, [
      file('report.pdf', 'application/pdf', 2048),
      file('photo.png', 'image/png'),
    ]);
    expect(host.files().map((item) => item.name)).toEqual(['report.pdf', 'photo.png']);
    const list = screen.getByRole('list', { name: 'Chosen files' });
    expect(list).toHaveTextContent('report.pdf');
    expect(list).toHaveTextContent('2 kB');
    expect(screen.getByRole('status')).toHaveTextContent('Files added: 2');
    await user.click(screen.getByRole('button', { name: 'Remove report.pdf' }));
    expect(host.files().map((item) => item.name)).toEqual(['photo.png']);
    expect(screen.getByRole('button', { name: 'Attachments' })).toHaveFocus();
  });

  it('rejects a wrong type, an oversized file and files over the limit, saying why', async () => {
    const { host, input, user } = await setup();
    await user.upload(input, [
      file('notes.txt', 'text/plain'),
      file('big.pdf', 'application/pdf', 9000),
      file('a.pdf', 'application/pdf'),
      file('b.PDF', ''),
      file('c.png', 'image/png'),
    ]);
    expect(host.files().map((item) => item.name)).toEqual(['a.pdf', 'b.PDF']);
    expect(host.rejected().map(({ file: item, reason }) => `${item.name}:${reason}`)).toEqual([
      'notes.txt:type',
      'big.pdf:size',
      'c.png:count',
    ]);
    expect(screen.getByRole('status')).toHaveTextContent('big.pdf: the file is too large');
  });

  it('replaces the file when only one is allowed', async () => {
    const { host, fixture, input, user } = await setup();
    host.multiple.set(false);
    await fixture.whenStable();
    expect(screen.getByRole('button', { name: 'Attachments' })).toHaveTextContent('Choose a file');
    await user.upload(input, file('a.pdf', 'application/pdf'));
    await user.upload(input, file('b.pdf', 'application/pdf'));
    expect(host.files().map((item) => item.name)).toEqual(['b.pdf']);
  });

  it('accepts dropped files and shows that the zone is ready for them', async () => {
    const { host, fixture } = await setup();
    const zone = fixture.nativeElement.querySelector('.zone') as HTMLElement;
    const dataTransfer = { types: ['Files'], files: [file('drop.png', 'image/png')] };
    fireEvent.dragEnter(zone, { dataTransfer });
    await fixture.whenStable();
    expect(zone).toHaveAttribute('data-over');
    fireEvent.drop(zone, { dataTransfer });
    await fixture.whenStable();
    expect(zone).not.toHaveAttribute('data-over');
    expect(host.files().map((item) => item.name)).toEqual(['drop.png']);
  });

  it('works with reactive forms and inside a field', async () => {
    const control = new FormControl<File[]>([], { nonNullable: true });
    const { container, fixture } = await render(
      `<kn-field label="Contract" hint="One PDF"><kn-file-upload [formControl]="control" /></kn-field>`,
      { imports: [KnFileUpload, KnField, ReactiveFormsModule], componentProperties: { control } },
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    // The native input is not a pointer target: the button opens it
    await userEvent
      .setup({ pointerEventsCheck: 0 })
      .upload(input, file('contract.pdf', 'application/pdf'));
    expect(control.value.map((item) => item.name)).toEqual(['contract.pdf']);
    await expectNoA11yViolations(container);
    control.disable();
    await fixture.whenStable();
    expect(screen.getByRole('button', { name: /Contract/ })).toBeDisabled();
  });
});
