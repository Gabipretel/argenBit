type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeAlertsChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitAlertsChanged(): void {
  for (const cb of listeners) {
    cb();
  }
}
