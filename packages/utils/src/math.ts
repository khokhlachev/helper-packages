export const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

export const clamp = (x: number, min: number, max: number) =>
  Math.min(Math.max(x, min), max);

type Vec2 = [number, number];
// sqrt((x1 - x2)^2 + (y1 - y2)^2)
export const distance = (a: Vec2, b: Vec2) =>
  Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
