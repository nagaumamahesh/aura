import { DemoSample, Landmark } from '../types';

// Let's create high-fidelity simulated landmark coordinates for the samples
// This allows the app to draw the interactive canvas skeleton perfectly out-of-the-box
export interface PresetSample extends DemoSample {
  landmarks: Landmark[];
}

export const DEMO_SAMPLES: PresetSample[] = [
  {
    id: 'male-180',
    name: 'Marcus (Path A: Known Height)',
    gender: 'male',
    knownHeightCm: 180,
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    description: 'Front-facing standard standing posture. Optimal canvas alignment, wearing snug athletic wear.',
    presetMeasurements: {
      height: 180.0,
      shoulderWidth: 44.5,
      armLength: 76.2,
      torsoLength: 68.4,
      inseam: 81.3,
      hipWidth: 38.2,
      chestEstimate: 107.7,
    },
    landmarks: [
      { x: 0.50, y: 0.15, z: -0.2, visibility: 0.99 }, // 0: nose
      { x: 0.49, y: 0.13, z: -0.2, visibility: 0.98 }, // 1: r_eye_inner
      { x: 0.48, y: 0.13, z: -0.2, visibility: 0.98 }, // 2: r_eye
      { x: 0.47, y: 0.13, z: -0.2, visibility: 0.98 }, // 3: r_eye_outer
      { x: 0.51, y: 0.13, z: -0.2, visibility: 0.99 }, // 4: l_eye_inner
      { x: 0.52, y: 0.13, z: -0.2, visibility: 0.99 }, // 5: l_eye
      { x: 0.53, y: 0.13, z: -0.1, visibility: 0.99 }, // 6: l_eye_outer
      { x: 0.46, y: 0.14, z: -0.1, visibility: 0.97 }, // 7: r_ear
      { x: 0.54, y: 0.14, z: -0.1, visibility: 0.98 }, // 8: l_ear
      { x: 0.48, y: 0.17, z: -0.1, visibility: 0.99 }, // 9: r_mouth
      { x: 0.52, y: 0.17, z: -0.1, visibility: 0.99 }, // 10: l_mouth
      { x: 0.41, y: 0.24, z: -0.05, visibility: 0.98 }, // 11: r_shoulder
      { x: 0.59, y: 0.24, z: -0.05, visibility: 0.99 }, // 12: l_shoulder
      { x: 0.38, y: 0.42, z: -0.1, visibility: 0.95 }, // 13: r_elbow
      { x: 0.62, y: 0.42, z: -0.1, visibility: 0.96 }, // 14: l_elbow
      { x: 0.37, y: 0.58, z: -0.12, visibility: 0.94 }, // 15: r_wrist
      { x: 0.63, y: 0.58, z: -0.12, visibility: 0.95 }, // 16: l_wrist
      { x: 0.36, y: 0.60, z: -0.13, visibility: 0.90 }, // 17: r_pinky
      { x: 0.64, y: 0.60, z: -0.13, visibility: 0.91 }, // 18: l_pinky
      { x: 0.36, y: 0.59, z: -0.14, visibility: 0.91 }, // 19: r_index
      { x: 0.64, y: 0.59, z: -0.14, visibility: 0.92 }, // 20: l_index
      { x: 0.37, y: 0.59, z: -0.13, visibility: 0.92 }, // 21: r_thumb
      { x: 0.63, y: 0.59, z: -0.13, visibility: 0.93 }, // 22: l_thumb
      { x: 0.43, y: 0.53, z: 0.0, visibility: 0.99 }, // 23: r_hip
      { x: 0.57, y: 0.53, z: 0.0, visibility: 0.99 }, // 24: l_hip
      { x: 0.42, y: 0.71, z: 0.05, visibility: 0.98 }, // 25: r_knee
      { x: 0.58, y: 0.71, z: 0.05, visibility: 0.98 }, // 26: l_knee
      { x: 0.43, y: 0.88, z: 0.1, visibility: 0.97 }, // 27: r_ankle
      { x: 0.57, y: 0.88, z: 0.1, visibility: 0.97 }, // 28: l_ankle
      { x: 0.42, y: 0.90, z: 0.11, visibility: 0.95 }, // 29: r_heel
      { x: 0.58, y: 0.90, z: 0.11, visibility: 0.95 }, // 30: l_heel
      { x: 0.41, y: 0.92, z: 0.10, visibility: 0.94 }, // 31: r_toe_index
      { x: 0.59, y: 0.92, z: 0.10, visibility: 0.94 }, // 32: l_toe_index
    ],
  },
  {
    id: 'female-165',
    name: 'Elena (Path B: Reference Object in Frame)',
    gender: 'female',
    knownHeightCm: 165,
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    description: 'Elena is holding an A4 sheet (29.7cm length). The green reference selector aligns with the sheet boundaries to set absolute pixels-per-cm.',
    presetMeasurements: {
      height: 165.4,
      shoulderWidth: 38.1,
      armLength: 69.8,
      torsoLength: 61.2,
      inseam: 75.1,
      hipWidth: 35.8,
      chestEstimate: 92.2,
    },
    landmarks: [
      { x: 0.50, y: 0.18, z: -0.2, visibility: 0.99 }, // Nose slightly lower
      { x: 0.49, y: 0.16, z: -0.2, visibility: 0.98 },
      { x: 0.48, y: 0.16, z: -0.2, visibility: 0.98 },
      { x: 0.47, y: 0.16, z: -0.2, visibility: 0.98 },
      { x: 0.51, y: 0.16, z: -0.2, visibility: 0.99 },
      { x: 0.52, y: 0.16, z: -0.2, visibility: 0.99 },
      { x: 0.53, y: 0.16, z: -0.1, visibility: 0.99 },
      { x: 0.46, y: 0.17, z: -0.1, visibility: 0.97 },
      { x: 0.54, y: 0.17, z: -0.1, visibility: 0.98 },
      { x: 0.48, y: 0.20, z: -0.1, visibility: 0.99 },
      { x: 0.52, y: 0.20, z: -0.1, visibility: 0.99 },
      { x: 0.42, y: 0.27, z: -0.05, visibility: 0.99 }, // Shoulders
      { x: 0.58, y: 0.27, z: -0.05, visibility: 0.99 },
      { x: 0.39, y: 0.43, z: -0.08, visibility: 0.96 }, // Elbows
      { x: 0.61, y: 0.43, z: -0.08, visibility: 0.95 },
      { x: 0.37, y: 0.57, z: -0.1, visibility: 0.96 }, // Wrists
      { x: 0.63, y: 0.57, z: -0.1, visibility: 0.96 },
      { x: 0.36, y: 0.59, z: -0.11, visibility: 0.92 },
      { x: 0.64, y: 0.59, z: -0.11, visibility: 0.92 },
      { x: 0.36, y: 0.58, z: -0.12, visibility: 0.93 },
      { x: 0.64, y: 0.58, z: -0.12, visibility: 0.93 },
      { x: 0.37, y: 0.58, z: -0.11, visibility: 0.93 },
      { x: 0.63, y: 0.58, z: -0.11, visibility: 0.94 },
      { x: 0.44, y: 0.54, z: 0.0, visibility: 0.99 }, // Hips
      { x: 0.56, y: 0.54, z: 0.0, visibility: 0.99 },
      { x: 0.43, y: 0.71, z: 0.04, visibility: 0.98 }, // Knees
      { x: 0.57, y: 0.71, z: 0.04, visibility: 0.98 },
      { x: 0.44, y: 0.86, z: 0.08, visibility: 0.97 }, // Ankles
      { x: 0.56, y: 0.86, z: 0.08, visibility: 0.97 },
      { x: 0.43, y: 0.88, z: 0.09, visibility: 0.95 },
      { x: 0.57, y: 0.88, z: 0.09, visibility: 0.95 },
      { x: 0.42, y: 0.90, z: 0.09, visibility: 0.94 },
      { x: 0.58, y: 0.90, z: 0.09, visibility: 0.94 },
    ],
  },
  {
    id: 'male-doorframe',
    name: 'Kenji (Path C: Door Frame Backdrop)',
    gender: 'male',
    knownHeightCm: 175,
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    description: 'Kenji stands in front of a standard 200cm door frame. The edge alignment allows scaling from background reference points.',
    presetMeasurements: {
      height: 175.2,
      shoulderWidth: 42.8,
      armLength: 73.1,
      torsoLength: 64.9,
      inseam: 78.6,
      hipWidth: 36.9,
      chestEstimate: 103.5,
    },
    landmarks: [
      { x: 0.50, y: 0.17, z: -0.2, visibility: 0.99 },
      { x: 0.49, y: 0.15, z: -0.2, visibility: 0.98 },
      { x: 0.48, y: 0.15, z: -0.2, visibility: 0.98 },
      { x: 0.47, y: 0.15, z: -0.2, visibility: 0.98 },
      { x: 0.51, y: 0.15, z: -0.2, visibility: 0.99 },
      { x: 0.52, y: 0.15, z: -0.2, visibility: 0.99 },
      { x: 0.53, y: 0.15, z: -0.1, visibility: 0.99 },
      { x: 0.46, y: 0.16, z: -0.1, visibility: 0.97 },
      { x: 0.54, y: 0.16, z: -0.1, visibility: 0.98 },
      { x: 0.48, y: 0.19, z: -0.1, visibility: 0.99 },
      { x: 0.52, y: 0.19, z: -0.1, visibility: 0.99 },
      { x: 0.415, y: 0.26, z: -0.05, visibility: 0.99 }, // shoulders
      { x: 0.585, y: 0.26, z: -0.05, visibility: 0.99 },
      { x: 0.38, y: 0.43, z: -0.1, visibility: 0.93 }, // elbows
      { x: 0.62, y: 0.43, z: -0.1, visibility: 0.94 },
      { x: 0.37, y: 0.58, z: -0.12, visibility: 0.91 }, // wrists (partially occluded)
      { x: 0.63, y: 0.58, z: -0.12, visibility: 0.94 },
      { x: 0.36, y: 0.60, z: -0.13, visibility: 0.88 },
      { x: 0.64, y: 0.60, z: -0.13, visibility: 0.90 },
      { x: 0.36, y: 0.59, z: -0.14, visibility: 0.89 },
      { x: 0.64, y: 0.59, z: -0.14, visibility: 0.91 },
      { x: 0.37, y: 0.59, z: -0.13, visibility: 0.89 },
      { x: 0.63, y: 0.59, z: -0.13, visibility: 0.91 },
      { x: 0.435, y: 0.53, z: 0.0, visibility: 0.99 }, // hips
      { x: 0.565, y: 0.53, z: 0.0, visibility: 0.99 },
      { x: 0.42, y: 0.70, z: 0.05, visibility: 0.98 }, // knees
      { x: 0.58, y: 0.70, z: 0.05, visibility: 0.98 },
      { x: 0.43, y: 0.87, z: 0.1, visibility: 0.98 }, // ankles
      { x: 0.57, y: 0.87, z: 0.1, visibility: 0.98 },
      { x: 0.42, y: 0.89, z: 0.11, visibility: 0.95 },
      { x: 0.58, y: 0.89, z: 0.11, visibility: 0.95 },
      { x: 0.41, y: 0.91, z: 0.10, visibility: 0.93 },
      { x: 0.59, y: 0.91, z: 0.10, visibility: 0.93 },
    ],
  },
];
