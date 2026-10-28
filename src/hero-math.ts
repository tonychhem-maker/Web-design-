/**
 * Core mathematical functions for 3D Hero Scene
 */

export function calculateVisDimensions(fovDeg: number, aspect: number, distance: number = 10) {
  const fovRad = (fovDeg * Math.PI) / 180;
  const visH = 2 * Math.tan(fovRad / 2) * distance;
  const visW = visH * aspect;
  return { visH, visW };
}

export function calculatePivotPosition(visW: number, visH: number, mobile: boolean) {
  const sx = mobile ? 0.5 : 0.517;
  const sy = mobile ? 0.45 : 0.488;
  return {
    x: (sx - 0.5) * visW,
    y: (0.5 - sy) * visH,
    z: 0
  };
}

export function calculatePivotScale(H: number, W: number, mobile: boolean, visH: number) {
  const px = Math.min(H * 0.44, W * (mobile ? 0.45 : 0.29));
  return (px / H) * visH;
}

export function calculateHeadlineLayout(W: number, H: number, mobile: boolean, lines: string[] = ['Build smarter', 'with AI', 'agentics']) {
  const baseFs = Math.min(H * 0.21, W * (mobile ? 0.21 : 0.118));
  const cx = W * (mobile ? 0.5 : 0.505);
  const cy = H * (mobile ? 0.45 : 0.468);
  const gap = baseFs * 1.07;
  const cap = baseFs * 0.7;

  // line i baselines: cy + cap/2 + (i - (lines.length - 1)/2)*gap
  const baselines = lines.map((_, i) => cy + cap / 2 + (i - (lines.length - 1) / 2) * gap);
  return { baseFs, cx, cy, gap, cap, baselines };
}

export function applyDamping(velocity: number, dt: number) {
  const step = dt * 60;
  return velocity * Math.pow(0.94, step);
}

export function calculateIdleDrift(timeSinceRelease: number, dt: number) {
  const step = dt * 60;
  if (timeSinceRelease <= 0.6) {
    return { driftX: 0, driftY: 0, ramp: 0 };
  }
  const ramp = Math.min(1.0, (timeSinceRelease - 0.6) / 1.0);
  return {
    driftY: 0.0035 * step * ramp,
    driftX: 0.0012 * step * ramp,
    ramp
  };
}

export function calculateArrowStep(remaining: number, dt: number): number {
  const step = dt * 60;
  return remaining * Math.min(1, 0.09 * step);
}

export function calculateSectionProgress(scrollY: number, sectionTop: number, sectionHeight: number, innerHeight: number): number {
  const scrollableDistance = sectionHeight - innerHeight;
  if (scrollableDistance <= 0) return 0;
  const p = (scrollY - sectionTop) / scrollableDistance;
  return Math.max(0, Math.min(1, p));
}

export function smoothValue(current: number, target: number, dt: number): number {
  const clampedDt = Math.min(dt, 0.05);
  return current + (target - current) * (1 - Math.pow(0.001, clampedDt));
}

export function calculateTypedCount(p: number, totalChars: number, startP = 0.02, endP = 0.38): number {
  if (p <= startP) return 0;
  if (p >= endP) return totalChars;
  const mapped = ((p - startP) / (endP - startP)) * totalChars;
  return Math.min(totalChars, Math.floor(mapped));
}

export function calculateMarqueeOffset(scrollY: number, speed: number, groupWidth: number, autoOffset: number = 0): number {
  if (groupWidth <= 0) return 0;
  const raw = -(scrollY * speed + autoOffset);
  const mod = raw % groupWidth;
  return mod > 0 ? mod - groupWidth : mod;
}

export function calculateRingRadius(panelWidth: number, count = 4, extraPadding = 60): number {
  const theta = (2 * Math.PI) / count;
  return (panelWidth / 2) / Math.tan(theta / 2) + extraPadding;
}

export function calculateRingAngle(progress: number, totalDeg = 270): number {
  const clamped = Math.max(0, Math.min(1, progress));
  return -clamped * totalDeg;
}

export function calculateFlowStepIndex(progress: number, totalSteps = 4): number {
  const clamped = Math.max(0, Math.min(0.9999, progress));
  return Math.floor(clamped * totalSteps);
}

export function calculateCardTilt(normX: number, normY: number, maxAngleDeg = 12) {
  // normX, normY in [-0.5, 0.5]
  const rx = -normY * maxAngleDeg;
  const ry = normX * maxAngleDeg;
  return { rx, ry };
}

export function calculateAutoRingAngle(autoAngle: number, scrollProgress: number = 0, scrollTotalDeg: number = 360): number {
  const clampedP = Math.max(0, Math.min(1, scrollProgress));
  const scrollAngle = clampedP * scrollTotalDeg;
  return -(autoAngle + scrollAngle);
}

export function calculateFrontPanelIndex(totalDeg: number, panelCount: number = 4): number {
  const norm = ((totalDeg % 360) + 360) % 360;
  const sector = 360 / panelCount;
  return Math.round(norm / sector) % panelCount;
}

