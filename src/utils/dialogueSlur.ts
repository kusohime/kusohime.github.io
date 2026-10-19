type Point = { x: number; y: number };
type SlurOptions = { crest?: number; dotted?: boolean };

// Keep the broad cubic bow, with a fuller centre and short, visible tips.
export function dialogueSlur(
  from: Point,
  to: Point,
  bowX: number,
  side: "left" | "right",
  thickness = 1.1,
  options: SlurOptions = {},
): { curve: string; ribbon: string } {
  const sign = side === "right" ? 1 : -1;
  const start = from.x * sign;
  const end = to.x * sign;
  const edge = Math.max(start, end);
  const bow = Math.max(bowX * sign, edge + 1);

  // Bound the actual extremum, rather than the control points: asymmetric
  // bubble widths can otherwise push a long slur beyond its reserved lane.
  const maximum = (control: number) => {
    const a = end - start;
    const b = 2 * (start - control);
    const c = control - start;
    const roots = Math.abs(a) < 1e-9
      ? (Math.abs(b) < 1e-9 ? [] : [-c / b])
      : (() => {
          const discriminant = Math.max(0, b * b - 4 * a * c);
          return [(-b + Math.sqrt(discriminant)) / (2 * a), (-b - Math.sqrt(discriminant)) / (2 * a)];
        })();
    return Math.max(start, end, ...roots.filter((t) => t > 0 && t < 1).map((t) =>
      start * (1 - t) ** 3 + 3 * control * t * (1 - t) + end * t ** 3,
    ));
  };
  let low = edge;
  let high = edge + Math.max(8, bow - edge) * 4;
  while (maximum(high) < bow) high = edge + (high - edge) * 2;
  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2;
    if (maximum(middle) < bow) low = middle;
    else high = middle;
  }

  const controlX = ((low + high) / 2) * sign;
  const deltaY = to.y - from.y;
  const crest = Math.max(0.25, Math.min(0.75, options.crest ?? 0.5));
  const c1y = from.y + deltaY * (crest - 0.22);
  const c2y = from.y + deltaY * (crest + 0.22);
  const n = (value: number) => Number(value.toFixed(3));
  const startPoint = `${n(from.x)} ${n(from.y)}`;
  const endPoint = `${n(to.x)} ${n(to.y)}`;

  const centre = (t: number): Point => ({
    x: from.x * (1 - t) ** 3 + 3 * controlX * t * (1 - t) + to.x * t ** 3,
    y: from.y * (1 - t) ** 3 + 3 * c1y * (1 - t) ** 2 * t + 3 * c2y * (1 - t) * t ** 2 + to.y * t ** 3,
  });
  const lengths = [0];
  let previous = from;
  for (let step = 1; step <= 96; step += 1) {
    const point = centre(step / 96);
    lengths.push(lengths[step - 1] + Math.hypot(point.x - previous.x, point.y - previous.y));
    previous = point;
  }
  const total = Math.max(lengths[96], 1e-6);
  // Long slurs no longer spend hundreds of pixels fading towards zero.
  const tipLength = Math.max(1e-6, Math.min(16, total * 0.08));
  const distanceAt = (t: number) => {
    const index = Math.min(95, Math.floor(t * 96));
    return lengths[index] + (lengths[index + 1] - lengths[index]) * (t * 96 - index);
  };
  const parameterAt = (distance: number) => {
    const index = Math.max(0, lengths.findIndex((length) => length >= distance) - 1);
    return (index + (distance - lengths[index]) / Math.max(1e-6, lengths[index + 1] - lengths[index])) / 96;
  };
  const widthAt = (t: number) => {
    const distance = distanceAt(t);
    const ramp = Math.min(1, distance / tipLength, (total - distance) / tipLength);
    const smooth = ramp * ramp * (3 - 2 * ramp);
    const body = 0.93 + 0.87 * Math.sin(Math.PI * distance / total) ** 2;
    return thickness * (0.48 + (body - 0.48) * smooth);
  };
  const curve = `M ${startPoint} C ${n(controlX)} ${n(c1y)}, ${n(controlX)} ${n(c2y)}, ${endPoint}`;
  if (options.dotted) {
    const intervals = Math.max(2, Math.ceil(total / 4.5));
    const dots = Array.from({ length: intervals + 1 }, (_, index) => {
      const t = parameterAt(total * index / intervals);
      const point = centre(t);
      const radius = Math.max(0.38, widthAt(t) / 2);
      return `M ${n(point.x + radius)} ${n(point.y)} A ${n(radius)} ${n(radius)} 0 1 0 ${n(point.x - radius)} ${n(point.y)} A ${n(radius)} ${n(radius)} 0 1 0 ${n(point.x + radius)} ${n(point.y)} Z`;
    });
    return { curve, ribbon: dots.join(" ") };
  }
  const offset = (t: number, edgeSign: number): Point => {
    const point = centre(t);
    const dx = 3 * ((controlX - from.x) * (1 - t) ** 2 + (to.x - controlX) * t ** 2);
    const dy = 3 * ((c1y - from.y) * (1 - t) ** 2 + 2 * (c2y - c1y) * t * (1 - t) + (to.y - c2y) * t ** 2);
    const speed = Math.max(1e-6, Math.hypot(dx, dy));
    const halfWidth = widthAt(t) / 2;
    // Measure thickness normal to the line, including shallow/diagonal arcs.
    return { x: point.x + edgeSign * dy / speed * halfWidth, y: point.y - edgeSign * dx / speed * halfWidth };
  };
  const derivative = (t: number, edgeSign: number): Point => {
    const a = Math.max(0, t - 1e-5);
    const b = Math.min(1, t + 1e-5);
    const p = offset(a, edgeSign);
    const q = offset(b, edgeSign);
    return { x: (q.x - p.x) / (b - a), y: (q.y - p.y) / (b - a) };
  };
  const knots = [...new Set([
    ...Array.from({ length: 17 }, (_, index) => index / 16),
    parameterAt(tipLength / 2), parameterAt(tipLength),
    parameterAt(total - tipLength), parameterAt(total - tipLength / 2),
  ])].sort((a, b) => a - b);
  const pointText = (point: Point) => `${n(point.x)} ${n(point.y)}`;
  const contour = (parameters: number[], edgeSign: number) => parameters.slice(1).map((t, index) => {
    const previousT = parameters[index];
    const a = offset(previousT, edgeSign);
    const b = offset(t, edgeSign);
    const da = derivative(previousT, edgeSign);
    const db = derivative(t, edgeSign);
    const interval = (t - previousT) / 3;
    return `C ${pointText({ x: a.x + da.x * interval, y: a.y + da.y * interval })}, ${pointText({ x: b.x - db.x * interval, y: b.y - db.y * interval })}, ${pointText(b)}`;
  }).join(" ");

  return {
    curve,
    ribbon: `M ${pointText(offset(0, 1))} ${contour(knots, 1)} L ${pointText(offset(1, -1))} ${contour([...knots].reverse(), -1)} Z`,
  };
}
