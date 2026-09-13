/** Keep only live timers; completed animation beats must not accumulate. */
export function createAnimationTimers() {
  const pending = new Set<ReturnType<typeof setTimeout>>();
  return {
    schedule(callback: () => void, delay: number) {
      const timer = setTimeout(() => {
        pending.delete(timer);
        callback();
      }, delay);
      pending.add(timer);
    },
    clear() {
      pending.forEach(clearTimeout);
      pending.clear();
    },
    get pendingCount() {
      return pending.size;
    },
  };
}
