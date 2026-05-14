interface ImageAnalysisResult {
  score: number;
  label: 'Low' | 'Medium' | 'High';
  explanation: string;
  signals: {
    name: string;
    impact: 'increased' | 'decreased' | 'neutral';
    value: string;
  }[];
  limitations: string[];
}

type PixelAnalysis = {
  smoothness: number;
  colorUniformity: number;
  edgeSharpness: number;
  noiseLevel: number;
};

export async function analyzeImage(file: File): Promise<ImageAnalysisResult> {
  const signals: ImageAnalysisResult['signals'] = [];
  const limitations: string[] = [
    'Multi-factor heuristic analysis only',
    'Results are probability-based estimates, not definitive proof',
    'Advanced forensic detection requires specialized ML/backend processing',
  ];

  const indicators = {
    aiIndicators: 0,
    authenticIndicators: 0,
    strongAiSignals: 0,
    strongAuthenticSignals: 0,
  };

  const fileName = file.name.toLowerCase();
  const fileSize = file.size;
  let pixelAnalysis: PixelAnalysis | null = null;

  if (fileSize < 50000) {
    indicators.aiIndicators++;
    signals.push({
      name: 'File Size',
      impact: 'increased',
      value: `Small file size (${(fileSize / 1024).toFixed(1)} KB) may indicate compressed or generated content`,
    });
  } else if (fileSize > 10000000) {
    indicators.authenticIndicators++;
    indicators.strongAuthenticSignals++;
    signals.push({
      name: 'File Size',
      impact: 'decreased',
      value: `Large file size (${(fileSize / 1024 / 1024).toFixed(1)} MB) may suggest camera capture`,
    });
  } else {
    signals.push({
      name: 'File Size',
      impact: 'neutral',
      value: `Normal file size (${(fileSize / 1024).toFixed(1)} KB)`,
    });
  }

  const suspiciousNames = [
    'ai',
    'generated',
    'synthetic',
    'midjourney',
    'dalle',
    'stable-diffusion',
    'chatgpt',
    'fake',
    'gan',
  ];

  if (suspiciousNames.some((word) => fileName.includes(word))) {
    indicators.aiIndicators++;
    indicators.strongAiSignals++;
    signals.push({
      name: 'File Name Pattern',
      impact: 'increased',
      value: 'Filename contains AI-related keywords',
    });
  }

  const authenticNames = ['img', 'dsc', 'dcim', 'photo', 'screenshot'];

  if (authenticNames.some((word) => fileName.includes(word))) {
    indicators.authenticIndicators++;
    signals.push({
      name: 'File Name Pattern',
      impact: 'decreased',
      value: 'Filename resembles camera or screenshot naming',
    });
  }

  try {
    const imageData = await getImageData(file);
    const { width, height } = imageData.dimensions;
    const aspectRatio = width / height;

    signals.push({
      name: 'Image Dimensions',
      impact: 'neutral',
      value: `${width}×${height}px`,
    });

    const isSquare = Math.abs(aspectRatio - 1) < 0.02;
    const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

    if ((isSquare && width >= 512) || isPowerOfTwo(width) || isPowerOfTwo(height)) {
      indicators.aiIndicators++;
      indicators.strongAiSignals++;
      signals.push({
        name: 'Dimension Pattern',
        impact: 'increased',
        value: 'Square or power-of-two dimensions are common in generated images',
      });
    }

    pixelAnalysis = analyzePixelPatterns(imageData.pixels, width, height);

    if (pixelAnalysis.smoothness > 0.72) {
      indicators.aiIndicators++;
      indicators.strongAiSignals++;
      signals.push({
        name: 'Pixel Smoothness',
        impact: 'increased',
        value: `High smoothness (${Math.round(pixelAnalysis.smoothness * 100)}%) may indicate AI generation`,
      });
    } else if (pixelAnalysis.smoothness < 0.4) {
      indicators.authenticIndicators++;
      indicators.strongAuthenticSignals++;
      signals.push({
        name: 'Pixel Smoothness',
        impact: 'decreased',
        value: `Natural variation (${Math.round(pixelAnalysis.smoothness * 100)}%) suggests authentic capture`,
      });
    }

    if (pixelAnalysis.colorUniformity > 0.68) {
      indicators.aiIndicators++;
      indicators.strongAiSignals++;
      signals.push({
        name: 'Color Distribution',
        impact: 'increased',
        value: `High color uniformity (${Math.round(pixelAnalysis.colorUniformity * 100)}%) suggests synthetic patterns`,
      });
    } else if (pixelAnalysis.colorUniformity < 0.35) {
      indicators.authenticIndicators++;
      indicators.strongAuthenticSignals++;
      signals.push({
        name: 'Color Distribution',
        impact: 'decreased',
        value: `Rich color variation (${Math.round(pixelAnalysis.colorUniformity * 100)}%) suggests organic content`,
      });
    }

    if (pixelAnalysis.edgeSharpness > 0.78) {
      indicators.aiIndicators++;
      signals.push({
        name: 'Edge Characteristics',
        impact: 'increased',
        value: `Sharp edge pattern (${Math.round(pixelAnalysis.edgeSharpness * 100)}%) may indicate generated or processed content`,
      });
    }

    if (pixelAnalysis.noiseLevel < 0.18) {
      indicators.aiIndicators++;
      indicators.strongAiSignals++;
      signals.push({
        name: 'Noise Pattern',
        impact: 'increased',
        value: `Very low noise (${Math.round(pixelAnalysis.noiseLevel * 100)}%) may suggest synthetic generation`,
      });
    } else if (pixelAnalysis.noiseLevel > 0.45) {
      indicators.authenticIndicators++;
      indicators.strongAuthenticSignals++;
      signals.push({
        name: 'Noise Pattern',
        impact: 'decreased',
        value: `Visible noise (${Math.round(pixelAnalysis.noiseLevel * 100)}%) suggests camera capture`,
      });
    }
  } catch {
    limitations.push('Pixel analysis could not be completed');
    signals.push({
      name: 'Pixel Analysis',
      impact: 'neutral',
      value: 'Pixel-level analysis was unavailable',
    });
  }

  const hasExifData = await checkForExifData(file);

  if (!hasExifData) {
    indicators.aiIndicators++;
    signals.push({
      name: 'EXIF Metadata',
      impact: 'increased',
      value: 'Missing EXIF metadata is common in generated or edited images',
    });
  } else {
    indicators.authenticIndicators++;
    indicators.strongAuthenticSignals++;
    signals.push({
      name: 'EXIF Metadata',
      impact: 'decreased',
      value: 'EXIF metadata suggests camera capture',
    });
  }

  let baseScore =
    indicators.aiIndicators * 10 +
    indicators.strongAiSignals * 15 -
    indicators.authenticIndicators * 8 -
    indicators.strongAuthenticSignals * 12;

  let score = 50 + baseScore;

  if (pixelAnalysis && pixelAnalysis.smoothness > 0.75 && pixelAnalysis.noiseLevel < 0.2) {
    score += 15;
  }

  if (pixelAnalysis && pixelAnalysis.colorUniformity > 0.65) {
    score += 10;
  }

  if (!hasExifData) {
    score += 10;
  }

  score = Math.max(10, Math.min(90, score));

  let label: 'Low' | 'Medium' | 'High';
  let explanation: string;

  if (score >= 70) {
    label = 'High';
    explanation =
      'Strong multi-signal indicators suggest the image is likely AI-generated or heavily synthetic.';
  } else if (score >= 45) {
    label = 'Medium';
    explanation =
      'Mixed indicators were detected. The image may contain AI-generated, edited, or synthetic characteristics.';
  } else {
    label = 'Low';
    explanation =
      'The detected indicators suggest the image is likely authentic or minimally synthetic.';
  }

  return {
    score: Math.round(score),
    label,
    explanation,
    signals,
    limitations,
  };
}

function getImageData(
  file: File
): Promise<{ pixels: Uint8ClampedArray; dimensions: { width: number; height: number } }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const maxDimension = 512;

      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);

      resolve({
        pixels: imageData.data,
        dimensions: { width, height },
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image failed to load'));
    };

    img.src = url;
  });
}

function analyzePixelPatterns(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): PixelAnalysis {
  const totalPixels = Math.floor(pixels.length / 4);
  const sampleSize = Math.min(10000, totalPixels);
  const step = Math.max(1, Math.floor(totalPixels / sampleSize));

  let totalVariation = 0;
  let edgeCount = 0;
  let noiseSum = 0;
  let samples = 0;

  const colorBuckets = new Array(8).fill(0);

  for (let i = 0; i < sampleSize; i++) {
    const pixelIndex = i * step;
    const idx = pixelIndex * 4;

    const rightIdx = idx + 4;
    const belowIdx = idx + width * 4;

    if (belowIdx + 2 >= pixels.length || rightIdx + 2 >= pixels.length) break;

    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];

    const brightness = (r + g + b) / 3;
    const bucket = Math.min(7, Math.floor(brightness / 32));
    colorBuckets[bucket]++;

    const rRight = pixels[rightIdx];
    const gRight = pixels[rightIdx + 1];
    const bRight = pixels[rightIdx + 2];

    const rBelow = pixels[belowIdx];
    const gBelow = pixels[belowIdx + 1];
    const bBelow = pixels[belowIdx + 2];

    const horizontalDiff =
      Math.abs(r - rRight) + Math.abs(g - gRight) + Math.abs(b - bRight);

    const verticalDiff =
      Math.abs(r - rBelow) + Math.abs(g - gBelow) + Math.abs(b - bBelow);

    totalVariation += horizontalDiff + verticalDiff;

    if (horizontalDiff > 100 || verticalDiff > 100) {
      edgeCount++;
    }

    noiseSum += Math.abs(horizontalDiff - verticalDiff);
    samples++;
  }

  if (samples === 0) {
    return {
      smoothness: 0.5,
      colorUniformity: 0.5,
      edgeSharpness: 0.5,
      noiseLevel: 0.5,
    };
  }

  const avgVariation = totalVariation / (samples * 2 * 255 * 3);
  const smoothness = 1 - Math.min(1, avgVariation * 2);

  const bucketTotal = colorBuckets.reduce((a, b) => a + b, 0);

  const entropy = colorBuckets.reduce((sum, count) => {
    if (count === 0 || bucketTotal === 0) return sum;
    const p = count / bucketTotal;
    return sum - p * Math.log2(p);
  }, 0);

  const colorUniformity = 1 - entropy / Math.log2(8);
  const edgeSharpness = edgeCount / samples;
  const noiseLevel = Math.min(1, (noiseSum / (samples * 255 * 3)) * 3);

  return {
    smoothness: clamp01(smoothness),
    colorUniformity: clamp01(colorUniformity),
    edgeSharpness: clamp01(edgeSharpness),
    noiseLevel: clamp01(noiseLevel),
  };
}

async function checkForExifData(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 65536).arrayBuffer();
    const view = new DataView(buffer);

    if (view.byteLength < 4) return false;

    const jpegStart = view.getUint16(0, false);

    if (jpegStart !== 0xffd8) return false;

    let offset = 2;

    while (offset < view.byteLength - 4) {
      const marker = view.getUint16(offset, false);

      if (marker === 0xffe1) {
        const exifHeader = view.getUint32(offset + 4, false);

        if (exifHeader === 0x45786966) {
          return true;
        }
      }

      if (marker === 0xffda || marker === 0xffd9) break;

      const length = view.getUint16(offset + 2, false);

      if (length <= 0) break;

      offset += length + 2;
    }

    return false;
  } catch {
    return false;
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}