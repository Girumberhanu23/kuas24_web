function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "00:00:00";
  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${pad2(hours)}h ${pad2(minutes)}m`;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}
