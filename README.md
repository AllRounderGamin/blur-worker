# Web Workers example: Blurring an Image

Examples for background processing in web apps.

In four stages, we show how to do background processing in Web applications, how to monitor progress and how to cancel the background jobs.

## `1-blur` – blurring in the main thread
- simple box blurring implemented in JavaScript and Canvas
  - it is not the fastest: for better performance, use WebGL or WebAssembly
  - but it illustrates dealing with long-running jobs

## `2-blur-worker` – delegate blurring to a background worker ([see diff](https://github.com/AllRounderGamin/blur-worker/compare/stage-1-blur..stage-2-blur-worker))
- we use one worker
- we pass all parameters to the worker
- the worker sends the result when done
- what happens to new blur messages sent while the worker is working?
- could we simply prevent starting new ones while a blur is already running? (hint: use `el.blur.disabled`)

## `3-blur-progress` – add progress bar ([see diff](https://github.com/AllRounderGamin/blur-worker/compare/stage-2-blur-worker..stage-3-blur-progress))
- the worker reports the fraction done with every scan line
- which means we need to have _message types_ and callbacks

## `4-blur-cancel` – make it possible to cancel running blurs ([see diff](https://github.com/AllRounderGamin/blur-worker/compare/stage-3-blur-progress..stage-4-blur-cancel))
- we clean up all pending jobs, too
  - this isn't necessary if we disable the blur button while blurring, but other scenarios can have multiple pending jobs

## `5-blur-procedual` - show the blurring occurring over time ([see diff](https://github.com/AllRounderGamin/blur-worker/compare/stage-4-blur-cancel..stage-5-blur-procedurally))
- the worker now also reports the current image data after every blur operation
- cancelling a blur will also restore the canvas to it's state before the blur was started
