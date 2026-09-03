/**
 * Client-side image AI-generation detector.
 *
 * No ML model — a transparent battery of forensic signals that generative
 * images (diffusion / GAN) tend to exhibit:
 *
 *  - frequency-domain up-sampling artifacts (periodic spectral peaks)
 *  - abnormally smooth / low high-frequency energy
 *  - flat, spatially-uniform noise residual (missing sensor noise / PRNU)
 *  - generator-native output dimensions
 *  - absence of any capture metadata on a photographic-looking image
 *
 * Each signal is weak on its own and can misfire on heavily edited, upscaled
 * or denoised real photos. They are combined into a probability with a stated
 * caveat — this is an estimate, not proof.
 */

export interface ImageAiSignal {
  label: string;
  detail: string;
  weight: number; // contribution 0..1
}

export interface ImageAiResult {
  probability: number; // 0-100
  signals: ImageAiSignal[];
  width: number;
  height: number;
  usable: boolean;
}

const N = 256; // analysis resolution (power of two for the FFT)

// Common generator output sizes (SD, SDXL, DALL·E, Midjourney, Firefly, Flux…).
const GEN_SIZES = new Set([
  '512x512', '768x768', '576x1024', '1024x576', '640x1536', '1536x640',
  '768x1344', '1344x768', '832x1216', '1216x832', '896x1152', '1152x896',
  '1024x1024', '1024x1536', '1536x1024', '1024x1792', '1792x1024',
  '2048x2048', '1024x1820', '1820x1024', '1456x816', '816x1456',
]);

// --- tiny iterative radix-2 FFT -------------------------------------------

function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

function fft2dMagnitude(gray: Float64Array): Float64Array {
  const re = Float64Array.from(gray);
  const im = new Float64Array(N * N);
  const rowRe = new Float64Array(N);
  const rowIm = new Float64Array(N);

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      rowRe[x] = re[y * N + x];
      rowIm[x] = im[y * N + x];
    }
    fft(rowRe, rowIm);
    for (let x = 0; x < N; x++) {
      re[y * N + x] = rowRe[x];
      im[y * N + x] = rowIm[x];
    }
  }
  const colRe = new Float64Array(N);
  const colIm = new Float64Array(N);
  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      colRe[y] = re[y * N + x];
      colIm[y] = im[y * N + x];
    }
    fft(colRe, colIm);
    for (let y = 0; y < N; y++) {
      re[y * N + x] = colRe[y];
      im[y * N + x] = colIm[y];
    }
  }

  const mag = new Float64Array(N * N);
  for (let i = 0; i < N * N; i++) mag[i] = Math.log1p(Math.hypot(re[i], im[i]));
  return mag;
}

// --- feature extraction ------------------------------------------------

function radialProfile(mag: Float64Array): { profile: number[]; peakiness: number; hfRatio: number } {
  const half = N / 2;
  const sums = new Float64Array(half + 1);
  const counts = new Float64Array(half + 1);
  for (let y = 0; y < N; y++) {
    const fy = y < half ? y : y - N;
    for (let x = 0; x < N; x++) {
      const fx = x < half ? x : x - N;
      const r = Math.round(Math.hypot(fx, fy));
      if (r <= half) {
        sums[r] += mag[y * N + x];
        counts[r] += 1;
      }
    }
  }
  const profile: number[] = [];
  for (let r = 0; r <= half; r++) profile.push(counts[r] ? sums[r] / counts[r] : 0);

  // Peakiness in the mid/high band: how much local spikes stick out of a smoothed baseline.
  const start = Math.floor(half * 0.35);
  let peak = 0;
  let base = 0;
  let bn = 0;
  for (let r = start; r < half - 2; r++) {
    const local = (profile[r - 1] + profile[r] + profile[r + 1]) / 3;
    const wide = (profile[r - 2] + profile[r + 2] + profile[Math.max(0, r - 4)] + profile[Math.min(half, r + 4)]) / 4;
    peak = Math.max(peak, local - wide);
    base += profile[r];
    bn += 1;
  }
  const peakiness = base / bn > 0 ? peak / (base / bn) : 0;

  const lo = profile.slice(1, Math.floor(half * 0.5)).reduce((a, b) => a + b, 0);
  const hi = profile.slice(Math.floor(half * 0.5)).reduce((a, b) => a + b, 0);
  const hfRatio = lo + hi > 0 ? hi / (lo + hi) : 0;

  return { profile, peakiness, hfRatio };
}

function noiseResidual(gray: Float64Array): { level: number; uniformity: number } {
  // High-pass = pixel minus 3x3 box blur.
  const res = new Float64Array(N * N);
  for (let y = 1; y < N - 1; y++) {
    for (let x = 1; x < N - 1; x++) {
      let s = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += gray[(y + dy) * N + (x + dx)];
      res[y * N + x] = gray[y * N + x] - s / 9;
    }
  }
  // Per-tile std, then mean level and coefficient of variation across tiles.
  const T = 16;
  const tileStd: number[] = [];
  for (let ty = 0; ty < N; ty += T) {
    for (let tx = 0; tx < N; tx += T) {
      let sum = 0;
      let sum2 = 0;
      let n = 0;
      for (let y = ty; y < ty + T; y++) for (let x = tx; x < tx + T; x++) {
        const v = res[y * N + x];
        sum += v;
        sum2 += v * v;
        n++;
      }
      const mean = sum / n;
      tileStd.push(Math.sqrt(Math.max(0, sum2 / n - mean * mean)));
    }
  }
  const mean = tileStd.reduce((a, b) => a + b, 0) / tileStd.length;
  const varr = tileStd.reduce((a, b) => a + (b - mean) ** 2, 0) / tileStd.length;
  const cov = mean > 0 ? Math.sqrt(varr) / mean : 0;
  return { level: mean, uniformity: 1 - Math.min(1, cov) }; // uniformity 1 = very flat noise
}

function toGray(data: Uint8ClampedArray): Float64Array {
  const g = new Float64Array(N * N);
  for (let i = 0; i < N * N; i++) {
    g[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  return g;
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

export async function analyzeImageAi(
  file: File,
  meta: { hasCameraMetadata: boolean },
): Promise<ImageAiResult> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { probability: 0, signals: [], width: 0, height: 0, usable: false };
  }
  const w = bitmap.width;
  const h = bitmap.height;

  const canvas = document.createElement('canvas');
  canvas.width = N;
  canvas.height = N;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { probability: 0, signals: [], width: w, height: h, usable: false };
  ctx.drawImage(bitmap, 0, 0, N, N);
  bitmap.close();
  const { data } = ctx.getImageData(0, 0, N, N);

  const gray = toGray(data);
  const mag = fft2dMagnitude(gray);
  const { peakiness, hfRatio } = radialProfile(mag);
  const { level: noiseLevel, uniformity: noiseUniformity } = noiseResidual(gray);

  const sizeKey = `${w}x${h}`;
  const sizeKeyR = `${h}x${w}`;
  const genSize = GEN_SIZES.has(sizeKey) || GEN_SIZES.has(sizeKeyR);
  const suspiciousRatio = Math.abs(w / h - 1) < 0.001 || [1.5, 1 / 1.5, 16 / 9, 9 / 16, 4 / 3, 3 / 4]
    .some((r) => Math.abs(w / h - r) < 0.004);

  const signals: ImageAiSignal[] = [];

  // 1. Up-sampling spectral peaks — diffusion/GAN decoders leave periodic peaks.
  const s1 = sigmoid((peakiness - 0.09) * 45);
  signals.push({
    label: 'Frequency-domain up-sampling artifacts',
    detail: `spectral peakiness ${peakiness.toFixed(3)} (natural ≈ <0.06)`,
    weight: s1,
  });

  // 2. Missing / flat sensor noise.
  const s2 = sigmoid((noiseUniformity - 0.55) * 6) * sigmoid((0.9 - noiseLevel) * 4);
  signals.push({
    label: 'Sensor-noise residual',
    detail: `noise level ${noiseLevel.toFixed(2)}, spatial uniformity ${noiseUniformity.toFixed(2)} (real photos: higher level, less uniform)`,
    weight: s2,
  });

  // 3. Abnormally low high-frequency energy (over-smoothed).
  const s3 = sigmoid((0.34 - hfRatio) * 22);
  signals.push({
    label: 'High-frequency detail',
    detail: `HF energy ratio ${hfRatio.toFixed(3)} (over-smooth < 0.30)`,
    weight: s3,
  });

  // 4. Generator-native dimensions.
  if (genSize) {
    signals.push({
      label: 'Output dimensions',
      detail: `${w}×${h} is a common generative model output size`,
      weight: 0.7,
    });
  } else if (suspiciousRatio && !meta.hasCameraMetadata) {
    signals.push({
      label: 'Output dimensions',
      detail: `${w}×${h} — exact aspect ratio, no camera crop`,
      weight: 0.25,
    });
  }

  // 5. Photographic-looking image with zero capture metadata.
  if (!meta.hasCameraMetadata && (s2 > 0.4 || s3 > 0.4)) {
    signals.push({
      label: 'Capture metadata',
      detail: 'No EXIF camera/make/model on an otherwise photographic image',
      weight: 0.3,
    });
  }

  // Weighted combine — the three forensic signals carry most of the weight.
  const core = 0.42 * s1 + 0.34 * s2 + 0.24 * s3;
  const bonus = signals
    .slice(3)
    .reduce((a, s) => a + s.weight, 0);
  const raw = sigmoid((core - 0.42) * 6) * 0.75 + Math.min(0.35, bonus * 0.35);
  const probability = Math.round(Math.min(97, Math.max(2, raw * 100)));

  return {
    probability,
    signals: signals.filter((s) => s.weight > 0.05).sort((a, b) => b.weight - a.weight),
    width: w,
    height: h,
    usable: true,
  };
}
