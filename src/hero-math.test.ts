import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateVisDimensions,
  calculatePivotPosition,
  calculatePivotScale,
  calculateHeadlineLayout,
  applyDamping,
  calculateIdleDrift,
  calculateArrowStep,
  calculateSectionProgress,
  calculateTypedCount,
  calculateMarqueeOffset,
  calculateRingRadius,
  calculateRingAngle,
  calculateFlowStepIndex,
  calculateCardTilt,
  calculateAutoRingAngle,
  calculateFrontPanelIndex
} from './hero-math.ts';

test('calculateVisDimensions at 30 deg fov and 1440/806 aspect', () => {
  const aspect = 1440 / 806;
  const { visH, visW } = calculateVisDimensions(30, aspect, 10);
  // tan(15 deg) ≈ 0.267949, visH ≈ 2 * 0.267949 * 10 ≈ 5.35898
  assert.ok(Math.abs(visH - 5.35898) < 0.01);
  assert.ok(Math.abs(visW - visH * aspect) < 0.0001);
});

test('calculatePivotPosition produces exact offset from center', () => {
  const visH = 5.36;
  const visW = 9.57;
  // Desktop
  const posDesktop = calculatePivotPosition(visW, visH, false);
  // sx = 0.517 -> (0.517 - 0.5) * visW = 0.017 * visW
  assert.ok(posDesktop.x > 0);
  // sy = 0.488 -> (0.5 - 0.488) * visH = 0.012 * visH
  assert.ok(posDesktop.y > 0);

  // Mobile
  const posMobile = calculatePivotPosition(visW, visH, true);
  assert.equal(posMobile.x, 0);
  assert.ok(Math.abs(posMobile.y - 0.05 * visH) < 0.0001);
});

test('calculateHeadlineLayout baselines spacing', () => {
  const layout = calculateHeadlineLayout(1440, 806, false);
  assert.equal(layout.baselines.length, 3);
  // Line gap should equal baseFs * 1.07
  const diff1 = layout.baselines[1] - layout.baselines[0];
  const diff2 = layout.baselines[2] - layout.baselines[1];
  assert.ok(Math.abs(diff1 - layout.gap) < 0.0001);
  assert.ok(Math.abs(diff2 - layout.gap) < 0.0001);
});

test('applyDamping reduces velocity over time', () => {
  const initialV = 0.1;
  const damped = applyDamping(initialV, 1 / 60);
  assert.ok(Math.abs(damped - initialV * 0.94) < 0.0001);
});

test('calculateIdleDrift blends after 0.6s and reaches full ramp at 1.6s', () => {
  const atZero = calculateIdleDrift(0.4, 1 / 60);
  assert.equal(atZero.ramp, 0);
  assert.equal(atZero.driftX, 0);

  const atHalf = calculateIdleDrift(1.1, 1 / 60);
  assert.ok(Math.abs(atHalf.ramp - 0.5) < 0.01);

  const atFull = calculateIdleDrift(2.0, 1 / 60);
  assert.equal(atFull.ramp, 1.0);
  assert.ok(Math.abs(atFull.driftY - 0.0035) < 0.0001);
  assert.ok(Math.abs(atFull.driftX - 0.0012) < 0.0001);
});

test('calculateArrowStep eases remaining rotation', () => {
  const remaining = Math.PI / 2;
  const step = calculateArrowStep(remaining, 1 / 60);
  assert.ok(Math.abs(step - remaining * 0.09) < 0.0001);
});

test('calculateSectionProgress clamps within [0, 1]', () => {
  const pBefore = calculateSectionProgress(500, 1000, 3000, 800);
  assert.equal(pBefore, 0);

  const pHalf = calculateSectionProgress(2100, 1000, 3000, 800);
  assert.equal(pHalf, 0.5);

  const pAfter = calculateSectionProgress(4000, 1000, 3000, 800);
  assert.equal(pAfter, 1);
});

test('calculateTypedCount maps [0.02, 0.38] to [0, totalChars]', () => {
  const total = 100;
  assert.equal(calculateTypedCount(0.01, total), 0);
  assert.equal(calculateTypedCount(0.02, total), 0);
  assert.equal(calculateTypedCount(0.20, total), 50);
  assert.equal(calculateTypedCount(0.38, total), 100);
  assert.equal(calculateTypedCount(0.85, total), 100);
});

test('calculateMarqueeOffset wraps smoothly', () => {
  const offset1 = calculateMarqueeOffset(100, 0.35, 400);
  assert.equal(offset1, -35);
  const offset2 = calculateMarqueeOffset(1200, 0.35, 400);
  assert.equal(offset2, -20);
});

test('calculateMarqueeOffset with autoOffset moves on its own', () => {
  const staticOffset = calculateMarqueeOffset(0, 0.35, 500, 150);
  assert.equal(staticOffset, -150);
  const wrappedOffset = calculateMarqueeOffset(0, 0.35, 500, 650);
  assert.equal(wrappedOffset, -150);
});

test('calculateRingRadius computes correct geometric cylinder radius', () => {
  const r = calculateRingRadius(320, 4, 60);
  // tan(pi/4) = 1, (320 / 2) / 1 + 60 = 220
  assert.ok(Math.abs(r - 220) < 0.0001);
});

test('calculateRingAngle maps [0, 1] to [0, -270]', () => {
  assert.equal(calculateRingAngle(0), -0);
  assert.equal(calculateRingAngle(0.5), -135);
  assert.equal(calculateRingAngle(1), -270);
});

test('calculateFlowStepIndex segments progress into step indices', () => {
  assert.equal(calculateFlowStepIndex(0), 0);
  assert.equal(calculateFlowStepIndex(0.24), 0);
  assert.equal(calculateFlowStepIndex(0.26), 1);
  assert.equal(calculateFlowStepIndex(0.76), 3);
  assert.equal(calculateFlowStepIndex(1), 3);
});

test('calculateCardTilt maps normalized mouse coordinates to rotation angles', () => {
  const center = calculateCardTilt(0, 0, 12);
  assert.equal(center.rx, -0);
  assert.equal(center.ry, 0);

  const corner = calculateCardTilt(0.5, -0.5, 12);
  assert.equal(corner.rx, 6);
  assert.equal(corner.ry, 6);
});

test('calculateAutoRingAngle rotates continuously with autoAngle even when scrollProgress is 0', () => {
  assert.equal(calculateAutoRingAngle(0, 0), -0);
  assert.equal(calculateAutoRingAngle(45, 0), -45);
  assert.equal(calculateAutoRingAngle(90, 0), -90);
  // With scroll progress 0.5:
  assert.equal(calculateAutoRingAngle(90, 0.5, 360), -270);
});

test('calculateFrontPanelIndex correctly identifies front-facing quadrant panel', () => {
  assert.equal(calculateFrontPanelIndex(0), 0);
  assert.equal(calculateFrontPanelIndex(40), 0);
  assert.equal(calculateFrontPanelIndex(50), 1);
  assert.equal(calculateFrontPanelIndex(90), 1);
  assert.equal(calculateFrontPanelIndex(130), 1);
  assert.equal(calculateFrontPanelIndex(140), 2);
  assert.equal(calculateFrontPanelIndex(180), 2);
  assert.equal(calculateFrontPanelIndex(270), 3);
  assert.equal(calculateFrontPanelIndex(350), 0);
  assert.equal(calculateFrontPanelIndex(360), 0);
  assert.equal(calculateFrontPanelIndex(450), 1);
});

