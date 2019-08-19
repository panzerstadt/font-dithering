export function rgb(r, g, b) {
  if (g === undefined) g = r;
  if (b === undefined) b = r;
  return (
    "rgb(" +
    clamp(Math.round(r), 0, 255) +
    ", " +
    clamp(Math.round(g), 0, 255) +
    ", " +
    clamp(Math.round(b), 0, 255) +
    ")"
  );
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
}

export function remap(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

export const pixellate = (ctx, sampleSize, w, h) => {
  const data = ctx.getImageData(0, 0, w, h).data;

  for (let y = 0; y < h; y += sampleSize) {
    // loop through all columns from left to right
    for (let x = 0; x < w; x += sampleSize) {
      // do something

      // the data array is a continuous array of red, blue, green
      // and alpha values, so each pixel takes up four values
      // in the array
      var pos = (x + y * w) * 4;

      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];

      ctx.fillStyle = rgb(r, g, b);
      ctx.fillRect(x, y, sampleSize, sampleSize);
    }
  }
};

export const pixellateText = (
  ctx,
  text,
  pixelSize,
  textSettings,
  isColor,
  debug
) => {
  pixelSize = Number(pixelSize.toFixed(1));
  const { fontSize, fontFamily } = textSettings;

  // characters that need more padding
  const LOW_CHARACTERS = Array.from("gjpqy");
  const hasLowCharacters = Array.from(text).some(v =>
    LOW_CHARACTERS.some(c => c === v)
  );

  // only works for sample sizes at .5 increments !?
  // when reading text, shift sampling by .5
  let h = fontSize * (hasLowCharacters ? 1.3 : 1.1);
  let w = 640;

  ctx.canvas.height = h;
  ctx.canvas.width = w;

  // if the font is too small, it gets lost
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillText(text, 0, fontSize);

  //pixellate(ctx, pixelSize, w, h);
  let data, sourceBuffer32;
  if (isColor) {
    data = ctx.getImageData(0, 0, w, h).data;
  } else {
    sourceBuffer32 = new Uint32Array(ctx.getImageData(0, 0, w, h).data.buffer);
  }

  !debug && ctx.clearRect(0, 0, w, h);

  // let dataExists = {};
  // Array.from(data).map((v, i) => v > 0 && (dataExists[i] = v));
  // console.log(dataExists);

  for (let y = 0; y < h; y += pixelSize) {
    for (let x = 0; x < w; x += pixelSize) {
      // the data array is a continuous array of red, blue, green
      // and alpha values, so each pixel takes up four values
      // in the array

      let r, g, b, pos;
      if (isColor) {
        sourceBuffer32 = [];
        pos = y * (w * 4) + x * 4 - 1;
        // this is the right formula
        // ref: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas

        //var pos = (x + y * w) * 4;
        // this is the wrong one
        // ref: https://hackernoon.com/creating-a-pixelation-filter-for-creative-coding-fc6dc1d728b2

        r = data[pos];
        g = data[pos + 1];
        b = data[pos + 2];
      } else {
        data = [];
        pos = y * w + x;

        // this is the sourcebuffer version

        r = sourceBuffer32[pos] >> 0 && 0xff;
        g = sourceBuffer32[pos] >> 8 && 0xff;
        b = sourceBuffer32[pos] >> 16 && 0xff;
      }

      ctx.fillStyle = rgb(r, g, b);

      !debug && ctx.centreFillRect(x, y, pixelSize, pixelSize);
    }
  }
};
