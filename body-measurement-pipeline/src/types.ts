export type PipelinePath = 'A' | 'B' | 'C';

export interface ReferenceObject {
  id: string;
  name: string;
  realSizeCm: number; // width or height in cm depending on orientation
  description: string;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface BodyMeasurements {
  height: number;
  shoulderWidth: number;
  armLength: number;
  torsoLength: number;
  inseam: number;
  hipWidth: number;
  chestEstimate: number;
}

export interface SegmentConfidence {
  height: number;
  shoulderWidth: number;
  armLength: number;
  torsoLength: number;
  inseam: number;
  hipWidth: number;
  chestEstimate: number;
  overall: number;
}

export interface SizingRecommendation {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  matchPercent: number;
  details: {
    chest: 'tight' | 'snug' | 'regular' | 'loose';
    shoulders: 'tight' | 'snug' | 'regular' | 'loose';
    length: 'short' | 'regular' | 'long';
  };
}

export interface DemoSample {
  id: string;
  name: string;
  url: string;
  gender: 'male' | 'female';
  knownHeightCm: number;
  description: string;
  presetMeasurements: BodyMeasurements;
}
