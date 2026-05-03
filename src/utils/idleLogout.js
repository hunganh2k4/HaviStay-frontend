const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 phút

let idleTimer;

export function startIdleLogout(onLogout) {
  const resetTimer = () => {
    clearTimeout(idleTimer);

    idleTimer = setTimeout(() => {
      onLogout();
    }, IDLE_TIMEOUT);
  };

  const events = ["mousemove", "keydown", "click", "scroll"];

  events.forEach((event) => {
    window.addEventListener(event, resetTimer);
  });

  // Start lần đầu
  resetTimer();

  // Cleanup
  return () => {
    clearTimeout(idleTimer);

    events.forEach((event) => {
      window.removeEventListener(event, resetTimer);
    });
  };
}