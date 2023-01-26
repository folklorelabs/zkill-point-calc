export default function percentLabel(num) {
  if (num > 0) return `+${num}%`;
  if (num < 0) return `${num}%`;
  return '--';
}
