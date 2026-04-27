import type { TextareaHTMLAttributes } from 'react';
import { useId } from 'react';

export interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextAreaField({ label, id, className, rows = 3, ...rest }: TextAreaFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={['du-field', className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId}>{label}</label>
      <textarea id={inputId} rows={rows} {...rest} />
    </div>
  );
}
