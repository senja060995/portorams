'use client';

import { cn } from '@/lib/utils';

const inputBase =
  'w-full rounded-xl border border-ink-300 bg-white px-4 py-2.5 text-sm text-ink-900 transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-ink-100';

interface BaseProps {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

interface TextFieldProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'url' | 'number' | 'date';
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function TextField({
  label,
  hint,
  required,
  className,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
  maxLength,
}: TextFieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="text-sm font-medium text-ink-800">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(inputBase, 'mt-1.5')}
      />
      {hint ? <span className="mt-1.5 block text-xs text-ink-500">{hint}</span> : null}
    </label>
  );
}

interface TextAreaFieldProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  /** Shows a hint that Markdown is supported. */
  markdown?: boolean;
}

export function TextAreaField({
  label,
  hint,
  required,
  className,
  value,
  onChange,
  rows = 4,
  placeholder,
  disabled,
  markdown = false,
}: TextAreaFieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="text-sm font-medium text-ink-800">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(inputBase, 'mt-1.5 resize-y font-mono text-[0.8125rem] leading-relaxed')}
      />
      <span className="mt-1.5 block text-xs text-ink-500">
        {hint}
        {markdown ? ' Mendukung Markdown: ## judul, - daftar, **tebal**, [tautan](url).' : ''}
      </span>
    </label>
  );
}

interface SelectFieldProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

export function SelectField({
  label,
  hint,
  required,
  className,
  value,
  onChange,
  options,
  disabled,
}: SelectFieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="text-sm font-medium text-ink-800">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={cn(inputBase, 'mt-1.5')}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="mt-1.5 block text-xs text-ink-500">{hint}</span> : null}
    </label>
  );
}

interface CheckboxFieldProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField({
  label,
  hint,
  checked,
  onChange,
  disabled,
  className,
}: CheckboxFieldProps) {
  return (
    <label className={cn('flex items-start gap-3', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-800 focus:ring-2 focus:ring-brand-200"
      />
      <span>
        <span className="text-sm font-medium text-ink-800">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-ink-500">{hint}</span> : null}
      </span>
    </label>
  );
}

interface BilingualFieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  valueId: string;
  valueEn: string;
  onChangeId: (value: string) => void;
  onChangeEn: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  markdown?: boolean;
  disabled?: boolean;
}

/**
 * Side-by-side Indonesian and English inputs. Keeping both languages visible at
 * once is what stops an editor from publishing a half-translated record.
 */
export function BilingualField({
  label,
  hint,
  required,
  valueId,
  valueEn,
  onChangeId,
  onChangeEn,
  multiline = false,
  rows = 3,
  markdown = false,
  disabled,
}: BilingualFieldProps) {
  return (
    <fieldset className="rounded-2xl border border-ink-200 p-4">
      <legend className="px-2 text-sm font-semibold text-ink-800">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </legend>

      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            { code: 'ID', value: valueId, onChange: onChangeId },
            { code: 'EN', value: valueEn, onChange: onChangeEn },
          ] as const
        ).map((lang) => (
          <div key={lang.code}>
            <span className="mb-1.5 inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-[0.6875rem] font-bold text-brand-800">
              {lang.code}
            </span>
            {multiline ? (
              <textarea
                value={lang.value}
                onChange={(event) => lang.onChange(event.target.value)}
                rows={rows}
                disabled={disabled}
                className={cn(inputBase, 'resize-y font-mono text-[0.8125rem] leading-relaxed')}
              />
            ) : (
              <input
                type="text"
                value={lang.value}
                onChange={(event) => lang.onChange(event.target.value)}
                disabled={disabled}
                className={inputBase}
              />
            )}
          </div>
        ))}
      </div>

      {hint || markdown ? (
        <p className="mt-3 text-xs text-ink-500">
          {hint}
          {markdown ? ' Mendukung Markdown: ## judul, - daftar, **tebal**, [tautan](url).' : ''}
        </p>
      ) : null}
    </fieldset>
  );
}
