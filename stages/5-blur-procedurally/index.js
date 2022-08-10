import { blurImageData, terminateWorker } from './blur-in-worker.js';

const el = {};
let c;
let current;

function drawOriginalImageOnCanvas() {
  if (el.image) c.drawImage(el.image, 0, 0);
  hideCanvas(false);
}

function reportN() {
  el.nValue.textContent = el.n.value;
}

function hideCanvas(val = true) {
  el.imgContainer.classList.toggle('hideCanvas', val);
}

function reportProgress(fraction) {
  const percent = fraction * 100;
  el.progress.value = percent;
  el.progress.textContent = `${Math.round(percent)}%`;
}

function showBlurProgress(currentImage) {
  c.putImageData(currentImage, 0, 0);
}

async function doBlur() {
  try {
    el.blur.disabled = true;
    current = c.getImageData(0, 0, c.canvas.width, c.canvas.height);
    const result = await blurImageData(current, el.n.valueAsNumber, reportProgress, showBlurProgress);
    c.putImageData(result, 0, 0);
  } catch (e) {
    reportProgress(0);
  }
  el.blur.disabled = false;
}

function cancelBlur() {
  terminateWorker();
  c.putImageData(current, 0, 0);
}

function init() {
  // prepare el with all elements that have an ID
  for (const elWithId of document.querySelectorAll('[id]')) {
    el[elWithId.id] = elWithId;
  }

  // set up event handlers
  el.reset.addEventListener('click', drawOriginalImageOnCanvas);
  el.n.addEventListener('input', reportN);
  el.blur.addEventListener('click', doBlur);
  el.cancel.addEventListener('click', cancelBlur);
  el.canvas.addEventListener('mousedown', () => hideCanvas(true));
  el.canvas.addEventListener('mouseup', () => hideCanvas(false));
  el.canvas.addEventListener('mouseleave', () => hideCanvas(false));

  // resize canvas to match the size of the image
  c = el.canvas.getContext('2d');
  el.canvas.width = el.image.naturalWidth;
  el.canvas.height = el.image.naturalHeight;

  // set up initial state of the page
  drawOriginalImageOnCanvas();
  reportN();
}

window.addEventListener('load', init);
