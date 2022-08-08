import { blurImageData } from './blur.js';

addEventListener('message', (e) => {
  const message = e.data;

  const reportProgress = (fraction, currentImage) => {
    const progressMessage = {
      type: 'progress',
      current: currentImage,
      progress: fraction,
      id: message.id,
    };
    postMessage(progressMessage);
  };

  console.log('working on job', message.id);
  const result = blurImageData(message.imageData, message.n, reportProgress);
  console.log('work done on job', message.id);

  const responseMessage = {
    type: 'done',
    result,
    id: message.id,
  };
  postMessage(responseMessage);
});
