import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { forwardRef, useId, useImperativeHandle, useRef } from 'react';

export interface PhotoInputProps {
  label?: string;
  previewUrl?: string | null;
  previewAlt?: string;
  accept?: string;
  capture?: InputHTMLAttributes<HTMLInputElement>['capture'];
  onFileSelected: (file: File) => void;
}

export interface PhotoInputHandle {
  reset: () => void;
}

export const PhotoInput = forwardRef<PhotoInputHandle, PhotoInputProps>(function PhotoInput(
  {
    label = 'Photo',
    previewUrl,
    previewAlt = 'Preview',
    accept = 'image/*',
    capture = 'environment',
    onFileSelected,
  },
  ref,
) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        if (inputRef.current) inputRef.current.value = '';
      },
    }),
    [],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div className="du-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        capture={capture}
        onChange={handleChange}
      />
      {previewUrl ? (
        <div className="du-preview">
          <img src={previewUrl} alt={previewAlt} />
        </div>
      ) : null}
    </div>
  );
});
