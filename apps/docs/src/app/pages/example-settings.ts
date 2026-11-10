import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { email, form, FormField, maxLength, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { KnAvatar } from '@kenny/ui/avatar';
import { KnBreadcrumb, KnBreadcrumbs } from '@kenny/ui/breadcrumbs';
import { KnButton } from '@kenny/ui/button';
import { KnCard } from '@kenny/ui/card';
import { KnCheckbox } from '@kenny/ui/checkbox';
import { KnCombobox } from '@kenny/ui/combobox';
import { KnDatePicker } from '@kenny/ui/date-picker';
import {
  KnDialog,
  KnDialogBody,
  KnDialogFooter,
  KnDialogHeader,
  KnDialogRef,
} from '@kenny/ui/dialog';
import { KnField } from '@kenny/ui/field';
import { KnInput } from '@kenny/ui/input';
import { KnRadio, KnRadioGroup } from '@kenny/ui/radio';
import { KnOption, KnSelect } from '@kenny/ui/select';
import { KnSlider } from '@kenny/ui/slider';
import { KnSwitch } from '@kenny/ui/switch';
import { KnTab, KnTabs } from '@kenny/ui/tabs';
import { KnTextarea } from '@kenny/ui/textarea';
import { KnToaster } from '@kenny/ui/toast';
import { ACCENTS, ThemeMode, ThemeService } from '../core/theme';

const WORKSPACE = 'kenny-team';

const ZONES = [
  'Калининград (UTC+2)',
  'Москва (UTC+3)',
  'Самара (UTC+4)',
  'Екатеринбург (UTC+5)',
  'Омск (UTC+6)',
  'Новосибирск (UTC+7)',
  'Иркутск (UTC+8)',
  'Владивосток (UTC+10)',
];

@Component({
  imports: [
    RouterLink,
    FormField,
    KnBreadcrumbs,
    KnBreadcrumb,
    KnTabs,
    KnTab,
    KnCard,
    KnField,
    KnInput,
    KnTextarea,
    KnSelect,
    KnOption,
    KnCombobox,
    KnDatePicker,
    KnSwitch,
    KnRadioGroup,
    KnRadio,
    KnCheckbox,
    KnSlider,
    KnButton,
    KnAvatar,
    KnDialogHeader,
    KnDialogBody,
    KnDialogFooter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="content" class="page">
      <kn-breadcrumbs>
        <kn-breadcrumb><a routerLink="/examples">Примеры</a></kn-breadcrumb>
        <kn-breadcrumb current>Настройки</kn-breadcrumb>
      </kn-breadcrumbs>
      <h1>Настройки</h1>

      <kn-tabs variant="underline" aria-label="Разделы настроек">
        <kn-tab value="profile" label="Профиль" icon="user">
          <kn-card padding="lg">
            <form class="form" novalidate (submit)="$event.preventDefault(); saveProfile()">
              <div class="identity">
                <kn-avatar size="lg" [name]="model().name || 'Без имени'" status="online" />
                <div>
                  <strong>{{ model().name || 'Без имени' }}</strong>
                  <div class="muted">{{ model().email }}</div>
                </div>
              </div>

              <div class="grid">
                <kn-field label="Имя" required [error]="error(profile.name)">
                  <input knInput autocomplete="name" [formField]="profile.name" />
                </kn-field>
                <kn-field label="Почта" required [error]="error(profile.email)">
                  <input knInput type="email" autocomplete="email" [formField]="profile.email" />
                </kn-field>
                <kn-field label="Роль">
                  <kn-select [formField]="profile.role">
                    <kn-option value="designer">Дизайнер</kn-option>
                    <kn-option value="developer">Разработчик</kn-option>
                    <kn-option value="manager">Менеджер</kn-option>
                  </kn-select>
                </kn-field>
                <kn-field label="Часовой пояс" hint="Начните вводить город">
                  <kn-combobox [formField]="profile.zone">
                    @for (zone of zones; track zone) {
                      <kn-option [value]="zone">{{ zone }}</kn-option>
                    }
                  </kn-combobox>
                </kn-field>
                <kn-field label="День рождения" hint="Покажем коллегам только день и месяц">
                  <kn-date-picker [formField]="profile.birthday" />
                </kn-field>
              </div>

              <kn-field
                label="О себе"
                [hint]="model().bio.length + ' из 160'"
                [error]="error(profile.bio)"
              >
                <textarea knTextarea [minRows]="2" [formField]="profile.bio"></textarea>
              </kn-field>

              <div class="actions">
                <button kn-button type="submit" [loading]="saving()">Сохранить профиль</button>
                <button
                  kn-button
                  type="button"
                  variant="ghost"
                  tone="neutral"
                  [disabled]="!profile().dirty()"
                  (click)="resetProfile()"
                >
                  Отменить изменения
                </button>
              </div>
            </form>
          </kn-card>
        </kn-tab>

        <kn-tab value="notifications" label="Уведомления" icon="bell">
          <kn-card padding="lg">
            <h2>Каналы</h2>
            <div class="list">
              <div class="item">
                <div>
                  <strong>Почта</strong>
                  <div class="muted">Упоминания и приглашения</div>
                </div>
                <kn-switch aria-label="Уведомления по почте" [(checked)]="mail" />
              </div>
              <div class="item">
                <div>
                  <strong>Push в браузере</strong>
                  <div class="muted">Пока вкладка открыта</div>
                </div>
                <kn-switch aria-label="Push-уведомления" [(checked)]="push" />
              </div>
              <div class="item">
                <div>
                  <strong>Не беспокоить ночью</strong>
                  <div class="muted">С 22:00 до 8:00 по вашему поясу</div>
                </div>
                <kn-switch aria-label="Не беспокоить ночью" [(checked)]="quiet" />
              </div>
            </div>

            <h2>Сводка</h2>
            <kn-radio-group aria-label="Частота сводки" [(value)]="digest">
              <kn-radio value="daily">Каждый день в 9:00</kn-radio>
              <kn-radio value="weekly">По понедельникам</kn-radio>
              <kn-radio value="never">Не присылать</kn-radio>
            </kn-radio-group>

            <h2>О чём сообщать</h2>
            <div class="checks">
              @for (topic of topics(); track topic.id) {
                <kn-checkbox [checked]="topic.on" (checkedChange)="toggleTopic(topic.id, $event)">{{
                  topic.label
                }}</kn-checkbox>
              }
            </div>
          </kn-card>
        </kn-tab>

        <kn-tab value="appearance" label="Внешний вид" icon="droplet">
          <kn-card padding="lg">
            <h2>Тема</h2>
            <kn-radio-group
              orientation="horizontal"
              aria-label="Тема"
              [value]="theme.mode()"
              (valueChange)="setTheme($event)"
            >
              <kn-radio value="system">Как в системе</kn-radio>
              <kn-radio value="light">Светлая</kn-radio>
              <kn-radio value="dark">Тёмная</kn-radio>
            </kn-radio-group>

            <h2>Акцент</h2>
            <div class="swatches" role="group" aria-label="Акцентный цвет">
              @for (accent of accents; track accent.id) {
                <button
                  class="swatch"
                  type="button"
                  [attr.aria-pressed]="theme.accent() === accent.id"
                  [style.--_color]="accent.scale ? accent.scale[6] : '#1f4bdb'"
                  (click)="theme.accent.set(accent.id)"
                >
                  <span class="dot" aria-hidden="true"></span>{{ accent.label }}
                </button>
              }
            </div>

            <h2>Размер текста в редакторе</h2>
            <kn-field [label]="fontSize() + ' px'">
              <kn-slider [min]="13" [max]="21" [step]="1" [(value)]="fontSize" />
            </kn-field>
            <p class="preview" [style.font-size.px]="fontSize()">
              Съешь ещё этих мягких французских булок, да выпей чаю.
            </p>
          </kn-card>
        </kn-tab>

        <kn-tab value="danger" label="Опасная зона" icon="alert">
          <kn-card padding="lg">
            <h2>Удалить пространство</h2>
            <p class="muted">
              Пространство <code>{{ workspace }}</code
              >, все проекты и файлы будут удалены для всех участников. Отменить это нельзя.
            </p>
            <div>
              <button kn-button tone="danger" variant="soft" (click)="confirmDelete()">
                Удалить пространство…
              </button>
            </div>
          </kn-card>
        </kn-tab>
      </kn-tabs>
    </main>

    <ng-template #deleteDialog let-ref>
      <kn-dialog-header heading="Удалить пространство?" description="Это действие необратимо." />
      <kn-dialog-body>
        <kn-field [label]="'Введите ' + workspace + ', чтобы подтвердить'">
          <input
            knInput
            autocomplete="off"
            spellcheck="false"
            [value]="confirmation()"
            (input)="confirmation.set($any($event.target).value)"
          />
        </kn-field>
      </kn-dialog-body>
      <kn-dialog-footer>
        <button kn-button variant="ghost" tone="neutral" (click)="ref.close()">Отмена</button>
        <button
          kn-button
          tone="danger"
          [disabled]="confirmation() !== workspace"
          (click)="deleteWorkspace(ref)"
        >
          Удалить навсегда
        </button>
      </kn-dialog-footer>
    </ng-template>
  `,
  styles: `
    .page {
      max-inline-size: 50rem;
      margin-inline: auto;
      padding: 0 var(--kn-space-6) var(--kn-space-12);
    }

    h1 {
      margin: var(--kn-space-2) 0 var(--kn-space-6);
      font-size: var(--kn-text-4xl);
      font-weight: 680;
      letter-spacing: var(--kn-tracking-tight);
      line-height: 1;
    }

    h2 {
      margin: var(--kn-space-4) 0 0;
      font-size: var(--kn-text-lg);
      letter-spacing: var(--kn-tracking-snug);
    }

    h2:first-child {
      margin-block-start: 0;
    }

    .form {
      display: grid;
      gap: var(--kn-space-6);
    }

    .identity {
      display: flex;
      align-items: center;
      gap: var(--kn-space-4);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      gap: var(--kn-space-5);
    }

    .muted {
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    p.muted {
      margin: 0;
      font-size: var(--kn-text-md);
      max-inline-size: 36rem;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-2);
    }

    .list {
      border-radius: var(--kn-radius-md);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
    }

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--kn-space-4);
      padding: var(--kn-space-3) var(--kn-space-4);
    }

    .item + .item {
      border-block-start: 1px solid var(--kn-color-border);
    }

    .checks {
      display: grid;
      gap: var(--kn-space-3);
    }

    .swatches {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-2);
    }

    .swatch {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-2);
      block-size: var(--kn-size-md);
      padding: 0 var(--kn-space-4) 0 var(--kn-space-3);
      border: 0;
      border-radius: var(--kn-radius-control);
      background: var(--kn-color-surface-sunken);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
      color: var(--kn-color-text);
      font: inherit;
      font-weight: var(--kn-weight-medium);
      cursor: pointer;
    }

    .swatch[aria-pressed='true'] {
      box-shadow: inset 0 0 0 2px var(--_color);
    }

    .swatch:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .dot {
      inline-size: 1rem;
      block-size: 1rem;
      border-radius: 50%;
      background: var(--_color);
    }

    .preview {
      margin: 0;
      padding: var(--kn-space-4);
      border-radius: var(--kn-radius-md);
      background: var(--kn-color-surface-sunken);
    }
  `,
})
export default class SettingsExample {
  protected readonly theme = inject(ThemeService);
  private readonly toaster = inject(KnToaster);
  private readonly dialog = inject(KnDialog);
  private readonly deleteDialog = viewChild.required<TemplateRef<unknown>>('deleteDialog');

  protected readonly workspace = WORKSPACE;
  protected readonly zones = ZONES;
  protected readonly accents = ACCENTS;

  private readonly initial = {
    name: 'Зоя Мельникова',
    email: 'zoya@kenny.team',
    role: 'designer' as string | null,
    zone: 'Москва (UTC+3)' as string | null,
    birthday: new Date(1994, 4, 17) as Date | null,
    bio: 'Собираю дизайн-систему и слежу, чтобы тени были синими.',
  };
  protected readonly model = signal({ ...this.initial });
  protected readonly profile = form(this.model, (path) => {
    required(path.name, { message: 'Укажите имя' });
    required(path.email, { message: 'Укажите почту' });
    email(path.email, { message: 'Проверьте адрес: в нём опечатка' });
    maxLength(path.bio, 160, { message: 'Не больше 160 символов' });
  });
  protected readonly saving = signal(false);

  protected readonly mail = signal(true);
  protected readonly push = signal(false);
  protected readonly quiet = signal(true);
  protected readonly digest = signal<string | null>('weekly');
  protected readonly topics = signal([
    { id: 'mentions', label: 'Упоминания в комментариях', on: true },
    { id: 'reviews', label: 'Запросы на ревью', on: true },
    { id: 'releases', label: 'Новые релизы', on: false },
  ]);
  protected readonly fontSize = signal(16);
  protected readonly confirmation = signal('');

  protected readonly hasErrors = computed(() => this.profile().invalid());

  /** First error of a field, shown only after the user has left it (or tried to save). */
  protected error(
    field: () => { touched(): boolean; errors(): readonly { message?: string }[] },
  ): string | null {
    const state = field();
    return state.touched() ? (state.errors()[0]?.message ?? null) : null;
  }

  protected saveProfile(): void {
    for (const field of [this.profile.name, this.profile.email, this.profile.bio])
      field().markAsTouched();
    if (this.hasErrors()) {
      this.toaster.error('Профиль не сохранён', 'Исправьте отмеченные поля.');
      return;
    }
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.toaster.success('Профиль сохранён');
    }, 900);
  }

  protected resetProfile(): void {
    this.model.set({ ...this.initial });
    this.profile().reset();
  }

  protected toggleTopic(id: string, on: boolean): void {
    this.topics.update((topics) => topics.map((t) => (t.id === id ? { ...t, on } : t)));
  }

  protected setTheme(mode: unknown): void {
    this.theme.mode.set(mode as ThemeMode);
  }

  protected confirmDelete(): void {
    this.confirmation.set('');
    this.dialog.open(this.deleteDialog(), {
      role: 'alertdialog',
      width: '27rem',
      closeOnBackdrop: false,
    });
  }

  protected deleteWorkspace(ref: KnDialogRef): void {
    void ref.close();
    this.toaster.show({
      tone: 'warning',
      title: 'Это демо: пространство не удалено',
      description: 'В настоящем приложении здесь был бы запрос к серверу.',
    });
  }
}
