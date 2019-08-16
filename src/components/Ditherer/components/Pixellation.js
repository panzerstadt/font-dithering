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
