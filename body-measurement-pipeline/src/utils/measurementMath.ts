import { Landmark, BodyMeasurements, SegmentConfidence, SizingRecommendation } from '../types';

/**
 * Calculates the Euclidean distance between two points in 2D space.
 */
export function getDistance2D(p1: { x: number; y: number }, p2: { x: number; y: number }, width: number, height: number): number {
  const dx = (p1.x - p2.x) * width;
  const dy = (p1.y - p2.y) * height;
  return Math.hypot(dx, dy);
}

/**
 * Normalizes values and calculates body dimensions based on pixel-to-cm ratio.
 * MediaPipe landmark map:
 *   11, 12 - Shoulders (L, R)
 *   13, 14 - Elbows (L, R)
 *   15, 16 - Wrists (L, R)
 *   23, 24 - Hips (L, R)
 *   25, 26 - Knees (L, R)
 *   27, 28 - Ankles (L, R)
 *   0      - Nose
 */
export function computeMeasurements(
  landmarks: Landmark[],
  imgWidth: number,
  imgHeight: number,
  pxPerCm: number
): BodyMeasurements {
  if (!landmarks || landmarks.length < 29) {
    return {
      height: 0,
      shoulderWidth: 0,
      armLength: 0,
      torsoLength: 0,
      inseam: 0,
      hipWidth: 0,
      chestEstimate: 0,
    };
  }

  // Helper points
  const shoulderL = landmarks[11];
  const shoulderR = landmarks[12];
  const elbowL = landmarks[13];
  const elbowR = landmarks[14];
  const wristL = landmarks[15];
  const wristR = landmarks[16];
  const hipL = landmarks[23];
  const hipR = landmarks[24];
  const kneeL = landmarks[25];
  const kneeR = landmarks[26];
  const ankleL = landmarks[27];
  const ankleR = landmarks[28];
  const nose = landmarks[0];

  // Midpoints
  const shoulderMid = {
    x: (shoulderL.x + shoulderR.x) / 2,
    y: (shoulderL.y + shoulderR.y) / 2,
  };
  const hipMid = {
    x: (hipL.x + hipR.x) / 2,
    y: (hipR.y + hipL.y) / 2,
  };
  const ankleMid = {
    x: (ankleL.x + ankleR.x) / 2,
    y: (ankleL.y + ankleR.y) / 2,
  };

  // Shoulder Width
  const shoulderPx = getDistance2D(shoulderL, shoulderR, imgWidth, imgHeight);
  const shoulderCm = shoulderPx / pxPerCm;

  // Arm Length (shoulder -> elbow -> wrist). Calculate for both sides and protect against outliers/occlusions.
  const armLPx = getDistance2D(shoulderL, elbowL, imgWidth, imgHeight) + getDistance2D(elbowL, wristL, imgWidth, imgHeight);
  const armRPx = getDistance2D(shoulderR, elbowR, imgWidth, imgHeight) + getDistance2D(elbowR, wristR, imgWidth, imgHeight);
  const armLCm = armLPx / pxPerCm;
  const armRCm = armRPx / pxPerCm;

  // Use the one with higher visibility, or average
  const lArmVis = (shoulderL.visibility + elbowL.visibility + wristL.visibility) / 3;
  const rArmVis = (shoulderR.visibility + elbowR.visibility + wristR.visibility) / 3;
  let armCm = (armLCm + armRCm) / 2;
  if (lArmVis > rArmVis && lArmVis - rArmVis > 0.2) {
    armCm = armLCm;
  } else if (rArmVis > lArmVis && rArmVis - lArmVis > 0.2) {
    armCm = armRCm;
  }

  // Torso (shoulder mid to hip mid)
  const torsoPx = getDistance2D(shoulderMid, hipMid, imgWidth, imgHeight);
  const torsoCm = torsoPx / pxPerCm;

  // Inseam (hip mid -> ankle mid, minus a shoes/ankle correction of approx 3cm)
  // Leg breakdown: hip -> knee -> ankle
  const legLPx = getDistance2D(hipL, kneeL, imgWidth, imgHeight) + getDistance2D(kneeL, ankleL, imgWidth, imgHeight);
  const legRPx = getDistance2D(hipR, kneeR, imgWidth, imgHeight) + getDistance2D(kneeR, ankleR, imgWidth, imgHeight);
  const legLCm = legLPx / pxPerCm;
  const legRCm = legRPx / pxPerCm;

  const lLegVis = (hipL.visibility + kneeL.visibility + ankleL.visibility) / 3;
  const rLegVis = (hipR.visibility + kneeR.visibility + ankleR.visibility) / 3;
  let legCm = (legLCm + legRCm) / 2;
  if (lLegVis > rLegVis && lLegVis - rLegVis > 0.2) {
    legCm = legLCm;
  } else if (rLegVis > lLegVis && rLegVis - lLegVis > 0.2) {
    legCm = legRCm;
  }
  const inseamCm = Math.max(0, legCm - 3.5); // Adjust for ankle to crotch and shoe height

  // Hip Width
  const hipPx = getDistance2D(hipL, hipR, imgWidth, imgHeight);
  const hipCm = hipPx / pxPerCm;

  // Extrapolate Height (nose to ankle floor + correction for head size)
  // Standard head is about 7.5% to 8% of height, so nose to top of head is about 10-12cm
  const noseToAnklePx = getDistance2D(nose, ankleMid, imgWidth, imgHeight);
  const heightCm = (noseToAnklePx / pxPerCm) + 11.0;

  // Chest Estimate: simple heuristic in monocular depth is around 1.15x shoulder width for relaxed garments
  // or shoulder distance + depth estimation correction factor (36cm shoulder typically maps to 88-92cm envelope chest)
  // Standard envelope equation: Chest circumference ~ 2.4 * shoulder width
  const chestCalced = shoulderCm * 2.42;

  return {
    height: Math.round(heightCm * 10) / 10,
    shoulderWidth: Math.round(shoulderCm * 10) / 10,
    armLength: Math.round(armCm * 10) / 10,
    torsoLength: Math.round(torsoCm * 10) / 10,
    inseam: Math.round(inseamCm * 10) / 10,
    hipWidth: Math.round(hipCm * 10) / 10,
    chestEstimate: Math.round(chestCalced * 10) / 10,
  };
}

/**
 * Calculates confidence ratings for each parsed measurement based on landmark visibility.
 */
export function calculateConfidence(landmarks: Landmark[]): SegmentConfidence {
  if (!landmarks || landmarks.length < 29) {
    return {
      height: 0,
      shoulderWidth: 0,
      armLength: 0,
      torsoLength: 0,
      inseam: 0,
      hipWidth: 0,
      chestEstimate: 0,
      overall: 0,
    };
  }

  const v = (idx: number) => landmarks[idx]?.visibility || 0;

  const heightConf = v(0) * (v(27) + v(28)) / 2;
  const shoulderConf = v(11) * v(12);

  const lArmConf = v(11) * v(13) * v(15);
  const rArmConf = v(12) * v(14) * v(16);
  const armConf = Math.max(lArmConf, rArmConf); // occlusion robust

  const torsoConf = ((v(11) + v(12)) / 2) * ((v(23) + v(24)) / 2);

  const lLegConf = v(23) * v(25) * v(27);
  const rLegConf = v(24) * v(26) * v(28);
  const inseamConf = Math.max(lLegConf, rLegConf);

  const hipConf = v(23) * v(24);
  const chestConf = shoulderConf * 0.95; // derived metric

  const overall = (heightConf + shoulderConf + armConf + torsoConf + inseamConf + hipConf) / 6;

  return {
    height: Math.round(heightConf * 100),
    shoulderWidth: Math.round(shoulderConf * 100),
    armLength: Math.round(armConf * 100),
    torsoLength: Math.round(torsoConf * 100),
    inseam: Math.round(inseamConf * 100),
    hipWidth: Math.round(hipConf * 100),
    chestEstimate: Math.round(chestConf * 100),
    overall: Math.round(overall * 100),
  };
}

/**
 * Recommends sizing parameters based on shoulder or chest measurement envelopes.
 */
export function evaluateSizing(measurements: BodyMeasurements, gender: 'male' | 'female'): SizingRecommendation {
  const { shoulderWidth, chestEstimate } = measurements;

  // Criteria arrays
  const maleSizes = [
    { size: 'XS' as const, maxShoulder: 40, maxChest: 88 },
    { size: 'S' as const, maxShoulder: 42, maxChest: 94 },
    { size: 'M' as const, maxShoulder: 45, maxChest: 102 },
    { size: 'L' as const, maxShoulder: 48, maxChest: 110 },
    { size: 'XL' as const, maxShoulder: 51, maxChest: 118 },
    { size: 'XXL' as const, maxShoulder: 999, maxChest: 999 },
  ];

  const femaleSizes = [
    { size: 'XS' as const, maxShoulder: 36, maxChest: 80 },
    { size: 'S' as const, maxShoulder: 38, maxChest: 86 },
    { size: 'M' as const, maxShoulder: 40, maxChest: 92 },
    { size: 'L' as const, maxShoulder: 43, maxChest: 100 },
    { size: 'XL' as const, maxShoulder: 46, maxChest: 108 },
    { size: 'XXL' as const, maxShoulder: 999, maxChest: 999 },
  ];

  const scale = gender === 'male' ? maleSizes : femaleSizes;

  // Find suitable match
  let selectedSize = scale[scale.length - 1].size;
  for (const group of scale) {
    if (shoulderWidth <= group.maxShoulder && chestEstimate <= group.maxChest) {
      selectedSize = group.size;
      break;
    }
  }

  // Calculate generic check values helper matches
  const matchPercent = Math.min(
    100,
    Math.max(65, Math.round(100 - Math.abs(chestEstimate - 96) / 2))
  );

  return {
    size: selectedSize,
    matchPercent,
    details: {
      chest: chestEstimate < 90 ? 'tight' : chestEstimate > 105 ? 'loose' : 'regular',
      shoulders: shoulderWidth < 41 ? 'snug' : shoulderWidth > 47 ? 'loose' : 'regular',
      length: 'regular',
    },
  };
}
