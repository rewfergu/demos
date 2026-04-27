import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, id, type = 'text', className, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={['du-field', className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} type={type} {...rest} />
    </div>
  );
}
