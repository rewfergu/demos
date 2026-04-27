import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

export interface DragPinHandleProps {
  dropTargetRef: RefObject<HTMLElement | null>;
  onDrop: (x: number, y: number) => void;
  hint?: string;
  ariaLabel?: string;
}

const PIN_PATH =
  'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z';

export function DragPinHandle({
  dropTargetRef,
  onDrop,
  hint = 'Drag this pin onto the map to set the location.',
  ariaLabel = 'Drag onto the map to set the location',
}: DragPinHandleProps) {
  const handleRef = useRef<HTMLButtonElement>(null);
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    const onPointerDown = (e: PointerEvent) => {
      const dropTarget = dropTargetRef.current;
      if (!dropTarget) return;
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      handle.setPointerCapture?.(e.pointerId);

      const ghost = document.createElement('div');
      ghost.className = 'du-drag-pin-ghost';
      ghost.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true"><path d="${PIN_PATH}"/></svg>`;
      document.body.appendChild(ghost);

      const positionGhost = (clientX: number, clientY: number) => {
        ghost.style.left = `${clientX}px`;
        ghost.style.top = `${clientY}px`;
      };
      positionGhost(e.clientX, e.clientY);

      const isOverTarget = (clientX: number, clientY: number) => {
        const rect = dropTarget.getBoundingClientRect();
        return (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        );
      };

      const onMove = (ev: PointerEvent) => {
        positionGhost(ev.clientX, ev.clientY);
        dropTarget.classList.toggle('du-drop-target', isOverTarget(ev.clientX, ev.clientY));
      };

      const onUp = (ev: PointerEvent) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
        ghost.remove();
        dropTarget.classList.remove('du-drop-target');

        if (ev.type === 'pointerup' && isOverTarget(ev.clientX, ev.clientY)) {
          const rect = dropTarget.getBoundingClientRect();
          onDropRef.current(ev.clientX - rect.left, ev.clientY - rect.top);
        }
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    };

    handle.addEventListener('pointerdown', onPointerDown);
    return () => handle.removeEventListener('pointerdown', onPointerDown);
  }, [dropTargetRef]);

  return (
    <div className="du-drag-pin-wrap">
      <button
        ref={handleRef}
        type="button"
        className="du-drag-pin"
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
          <path d={PIN_PATH} />
        </svg>
      </button>
      {hint ? <span className="du-drag-pin-hint">{hint}</span> : null}
    </div>
  );
}
