export function nearlyEqual(a, b, relTol = 1e-9, absTol = 1e-12) {
  return Math.abs(a - b) <= Math.max(
    relTol * Math.max(Math.abs(a), Math.abs(b)),
    absTol
  );
}
