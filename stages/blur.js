export function blurImageData(imageData, n = 3, reportProgress) {
  const data = new RGBADataWrapper(imageData);

  const outputData = Uint8ClampedArray.from(imageData.data);
  const output = new RGBADataWrapper({
    data: outputData,
    width: data.width,
    height: data.height,
  });

  const halfSize = Math.round((n - 1) / 2);

  const convolve = (x, y, offset) => {
    let pixelCount = 0;
    let sum = 0;

    for (let i = -halfSize; i <= halfSize; i += 1) {
      for (let j = -halfSize; j <= halfSize; j += 1) {
        const val = data.get(x + i, y + j, offset);
        if (val != null) {
          pixelCount += 1;
          sum += val;
        }
      }
    }

    output.set(x, y, offset, sum / pixelCount);
  };

  const { width, height } = imageData;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      convolve(x, y, 0); // red channel
      convolve(x, y, 1); // green
      convolve(x, y, 2); // blue
      // not blurring transparency
    }
    reportProgress(y / height, new ImageData(outputData, width, height));
  }
  const finalImage = new ImageData(outputData, width, height);
  reportProgress(1, finalImage);

  return finalImage;
}

class RGBADataWrapper {
  constructor(imageData) {
    this.data = imageData.data;
    this.width = imageData.width;
    this.height = imageData.height;
  }

  // returns null outside image boundaries
  get(x, y, offset) {
    const pos = this.pos(x, y, offset);
    if (pos == null) {
      return null;
    }

    return this.data[pos];
  }

  set(x, y, offset, newVal) {
    const pos = this.pos(x, y, offset);
    if (pos == null) {
      throw new TypeError('coordinates out of bounds');
    }

    this.data[pos] = newVal;
  }

  pos(x, y, offset) {
    if (x < 0 || x >= this.width || y < 0 || y > this.height) {
      return null;
    }
    return (x + y * this.width) * 4 + offset;
  }
}
