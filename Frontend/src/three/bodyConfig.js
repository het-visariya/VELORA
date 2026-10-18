/**
 * Calibration constants for the 3D body models.
 *
 * Everything the viewer and the deformation shader need to know about the
 * assets lives here, so there is one place to tune and no magic numbers
 * scattered through the render code.
 */

/**
 * What the unmodified mesh represents, in centimetres.
 *
 * The models are NOT authored at 1 unit = 1 metre: measured from their baked
 * bounding box they are 1.1634 (boy) and 1.1792 (girl) units tall. Rather than
 * carry that arbitrary scale through the camera rig and the measurement maths,
 * loadBodyModel() scales each mesh so 1 unit = 1 metre and the mesh stands
 * exactly `referenceHeightCm` tall. Height targets then become literal and the
 * lighting rig can be reasoned about in metres.
 *
 * These are the heights the sculpts read as, and are the baseline a
 * heightScale of 1.0 corresponds to.
 */
export const GENDER_PROFILES = {
  male: {
    modelKey: 'male',
    referenceHeightCm: 175,
    // Circumferences the unmodified mesh reads as, used as the 1.0 baseline
    // for the width/depth bands.
    reference: { chestCm: 96, waistCm: 82, hipCm: 96, shoulderCm: 45, inseamCm: 81 },
  },
  female: {
    modelKey: 'female',
    referenceHeightCm: 165,
    reference: { chestCm: 88, waistCm: 70, hipCm: 96, shoulderCm: 39, inseamCm: 75 },
  },
};

export const DEFAULT_GENDER = 'male';

export function profileForGender(gender) {
  const key = String(gender || '').toLowerCase();
  if (key.includes('female') || key.includes('woman') || key === 'girl' || key === 'f') {
    return GENDER_PROFILES.female;
  }
  return GENDER_PROFILES.male;
}

/**
 * Vertical bands, as fractions of the model's height, with 0 at the feet.
 *
 * Valid only because the GLB pipeline bakes the exporter's +90 degrees X
 * rotation into the vertices, so `position.y` really is height. In the raw
 * source files height runs along -Z and local Y is depth.
 *
 * Bands overlap deliberately: the shader blends between them with smoothstep
 * over the overlap, so there is no crease where one ends and the next begins.
 * Ordered feet-upward.
 */
export const BANDS = [
  { name: 'legs', from: 0.0, to: 0.45 },
  { name: 'hips', from: 0.42, to: 0.52 },
  { name: 'waist', from: 0.5, to: 0.66 },
  { name: 'chest', from: 0.66, to: 0.84 },
  // Scales uniformly with overall height only. A head that widens with chest
  // circumference is the single most obvious way this effect looks wrong.
  { name: 'head', from: 0.84, to: 1.0 },
];

export const BAND_INDEX = Object.fromEntries(BANDS.map((band, i) => [band.name, i]));

/** Bands the measurement inputs may widen. `head` and `legs` are excluded. */
export const GIRTH_BANDS = ['hips', 'waist', 'chest'];

/**
 * Clamp on every scale the shader applies. Past roughly a quarter the mesh
 * stops reading as a body: shoulders shear, knees bulge, the texture smears.
 */
export const LIMITS = {
  minScale: 0.75,
  maxScale: 1.25,
  minHeightCm: 140,
  maxHeightCm: 210,
  minWeightKg: 35,
  maxWeightKg: 180,
  minGirthCm: 50,
  maxGirthCm: 160,
};

/** Milliseconds for uniforms to ease to a new target, so sliders do not snap. */
export const TRANSITION_MS = 150;

/** Input ranges for the form sliders. */
export const INPUT_RANGES = {
  heightCm: { min: 140, max: 210, step: 1, unit: 'cm' },
  weight: { min: 35, max: 180, step: 0.5, unit: 'kg' },
  chestCm: { min: 60, max: 150, step: 0.5, unit: 'cm' },
  waistCm: { min: 50, max: 150, step: 0.5, unit: 'cm' },
  hipCm: { min: 60, max: 160, step: 0.5, unit: 'cm' },
  shoulderCm: { min: 30, max: 60, step: 0.5, unit: 'cm' },
  inseamCm: { min: 55, max: 100, step: 0.5, unit: 'cm' },
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
