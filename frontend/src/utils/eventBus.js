// frontend/src/utils/eventBus.js
// Tiny event bus using DOM CustomEvent so independent pages can react to changes

export const emitEntityChange = (entity) => {
  try {
    window.dispatchEvent(
      new CustomEvent("entity:changed", { detail: { entity } })
    );
  } catch (e) {
    // ignore in non-browser env
    console.warn("emitEntityChange failed", e);
  }
};

export const onEntityChange = (handler) => {
  const cb = (e) => handler(e.detail);
  window.addEventListener("entity:changed", cb);
  return () => window.removeEventListener("entity:changed", cb);
};
