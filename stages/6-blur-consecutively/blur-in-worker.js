let worker;
const queuedJobs = [];

createWorker();

function createWorker() {
  worker = new Worker('worker.js', { type: 'module' });
  worker.addEventListener('message', handleMessage);
}

const responseReceivers = new Map();
let nextMessageId = 0;

function handleMessage(e) {
  const { type, id } = e.data;
  const { receiver, showBlurProgress, reportProgress } = responseReceivers.get(id);

  if (type === 'done') {
    console.log('finished job', id);
    receiver(e.data.result);
    responseReceivers.delete(id);
    if (queuedJobs.length > 0) {
      const message = queuedJobs.shift();
      console.log('proceeding with job', message.id);
      message.imageData = e.data.result;
      worker.postMessage(message);
    }
  } else if (type === 'progress' && reportProgress) {
    showBlurProgress(e.data.current);
    reportProgress(e.data.progress);
  }
}


export function blurImageData(imageData, n = 3, reportProgress, showBlurProgress) {
  const message = {
    imageData: imageData,
    n,
    id: nextMessageId,
  };
  nextMessageId += 1;

  if (responseReceivers.has(message.id - 1)) {
    console.log('holding job', message.id);
    queuedJobs.push(message);
  } else {
    console.log('submitting job', message.id);
    worker.postMessage(message);
  }

  return new Promise((resolve, reject) => {
    responseReceivers.set(message.id, { receiver: resolve, reject, reportProgress, showBlurProgress });
  });
}

export function terminateWorker() {
  // stop ongoing work
  worker.terminate();

  // notify all callers that their jobs are cancelled
  const cancelled = new Error('blur cancelled');
  for (const [id, responseReceiver] of responseReceivers.entries()) {
    responseReceiver.reject(cancelled);
    console.log('cancelled job', id);
  }
  responseReceivers.clear();

  // create a new worker ready for jobs
  createWorker();
}
