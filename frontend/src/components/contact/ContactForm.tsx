'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import type { Locale } from '@/i18n/config';
import { submitContact } from '@/lib/api';
import { cn, localePath } from '@/lib/utils';

interface ContactFormProps {
  locale: Locale;
  solutionNames: string[];
}

type Status = 'idle' | 'sending' | 'success' | 'error';
type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;

const inputBase =
  'mt-2 w-full rounded-2xl border bg-white px-5 py-3.5 text-sm text-ink-800 transition-colors placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-ink-100';

export function ContactForm({ locale, solutionNames }: ContactFormProps) {
  const t = useTranslations('contact');

  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const busy = status === 'sending';

  const validate = (data: FormData): FieldErrors => {
    const next: FieldErrors = {};
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    if (name.length < 2) next.name = t('errors.nameRequired');
    if (!email) next.email = t('errors.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = t('errors.emailInvalid');
    if (message.length < 10) next.message = t('errors.messageRequired');

    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus('idle');
      return;
    }

    setStatus('sending');
    setServerError('');

    try {
      await submitContact({
        name: String(data.get('name') ?? '').trim(),
        email: String(data.get('email') ?? '').trim(),
        company: String(data.get('company') ?? '').trim(),
        phone: String(data.get('phone') ?? '').trim(),
        solution_interest: String(data.get('solution_interest') ?? '').trim(),
        message: String(data.get('message') ?? '').trim(),
        locale,
        // Honeypot: bots fill every field, humans never see this one.
        website: String(data.get('website') ?? ''),
      });
      setStatus('success');
      form.reset();
    } catch (error) {
      setStatus('error');
      setServerError(error instanceof Error ? error.message : '');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-start gap-4 rounded-4xl border border-emerald-200 bg-emerald-50 p-8">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
        <div>
          <p className="font-medium text-emerald-900">{t('success')}</p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-3 text-sm font-semibold text-emerald-800 underline underline-offset-2"
          >
            {t('submit')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {status === 'error' ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
        >
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
          <div>
            <p className="font-medium">{t('error')}</p>
            {serverError ? <p className="mt-1 text-red-700">{serverError}</p> : null}
          </div>
        </div>
      ) : null}

      {/* Honeypot, hidden from users and assistive tech but visible to bots. */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label={`${t('name')} *`}
          error={errors.name}
          disabled={busy}
          autoComplete="name"
          maxLength={120}
        />
        <Field
          id="email"
          type="email"
          label={`${t('email')} *`}
          error={errors.email}
          disabled={busy}
          autoComplete="email"
          maxLength={180}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="company"
          label={`${t('company')} (${t('optional')})`}
          disabled={busy}
          autoComplete="organization"
          maxLength={180}
        />
        <Field
          id="phone"
          type="tel"
          label={`${t('phone')} (${t('optional')})`}
          disabled={busy}
          autoComplete="tel"
          maxLength={40}
        />
      </div>

      <div>
        <label htmlFor="solution_interest" className="text-sm font-medium text-ink-800">
          {t('solution')} ({t('optional')})
        </label>
        <select
          id="solution_interest"
          name="solution_interest"
          disabled={busy}
          defaultValue=""
          className={cn(inputBase, 'border-ink-200 focus:border-brand-500')}
        >
          <option value="">{t('solutionPlaceholder')}</option>
          {solutionNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value="other">{t('solutionOther')}</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium text-ink-800">
          {t('message')} *
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          disabled={busy}
          maxLength={4000}
          placeholder={t('messagePlaceholder')}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className={cn(
            inputBase,
            'min-h-[9rem] resize-y',
            errors.message ? 'border-red-400 focus:border-red-500' : 'border-ink-200 focus:border-brand-500',
          )}
        />
        {errors.message ? (
          <p id="message-error" className="mt-2 text-xs font-medium text-red-600">
            {errors.message}
          </p>
        ) : null}
      </div>

      <p className="text-xs leading-relaxed text-ink-500">
        {t.rich('consent', {
          link: (chunks) => (
            <Link
              href={localePath(locale, '/privacy-policy')}
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>

      <Button type="submit" size="lg" disabled={busy} className="self-start">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </Button>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  maxLength?: number;
}

function Field({
  id,
  label,
  type = 'text',
  error,
  disabled,
  autoComplete,
  maxLength,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink-800">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          inputBase,
          error ? 'border-red-400 focus:border-red-500' : 'border-ink-200 focus:border-brand-500',
        )}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
