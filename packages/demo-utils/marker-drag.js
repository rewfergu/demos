export const PIN_SVG = `
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
  </svg>
`;

export function setupMarkerDrag(handle, mapContainer, onDropOnMap, opts = {}) {
  const ghostClass = opts.ghostClass ?? 'dm-marker-drag-ghost';
  const dropTargetClass = opts.dropTargetClass ?? 'dm-map-drop-target';

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    handle.setPointerCapture?.(e.pointerId);

    const ghost = document.createElement('div');
    ghost.className = ghostClass;
    ghost.innerHTML = PIN_SVG;
    document.body.appendChild(ghost);
    const positionGhost = (clientX, clientY) => {
      ghost.style.left = `${clientX}px`;
      ghost.style.top = `${clientY}px`;
    };
    positionGhost(e.clientX, e.clientY);

    const isOverMap = (clientX, clientY) => {
      const rect = mapContainer.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    };

    const onMove = (ev) => {
      positionGhost(ev.clientX, ev.clientY);
      mapContainer.classList.toggle(dropTargetClass, isOverMap(ev.clientX, ev.clientY));
    };

    const onUp = (ev) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      ghost.remove();
      mapContainer.classList.remove(dropTargetClass);

      if (ev.type === 'pointerup' && isOverMap(ev.clientX, ev.clientY)) {
        const rect = mapContainer.getBoundingClientRect();
        onDropOnMap(ev.clientX - rect.left, ev.clientY - rect.top);
      }
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  });
}
