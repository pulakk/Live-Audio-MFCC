# Introduction

For proper explanation of the code, refer to [this tutorial webpage](https://mizimo.github.io/Live-Audio-MFCC/tutorial).

We shall be visualizing Mel-frequency cepstral coefficients (MFCC) in the browser by receiving live audio input from the microphone using Javascript [Web Audio API](https://github.com/WebAudio/web-audio-api), [meyda.js](https://github.com/meyda/meyda) and [p5.js](https://p5js.org/) (for sketching)


<img src="https://github.com/mizimo/Live-Audio-MFCC/raw/master/screenshot.png" width="100%">

## Setup The Server
* Download and Install [Node.js](https://nodejs.org/en/) and Node Package Manager. 
* Run `npm install express` on the command line in the root directory. 
* Then either run the app using `node app.js` or ( `npm install -g nodemon` and `nodemon app.js` ). 
* Connect to `localhost:3000` in your favorite browser. The port may be changed in the app.js file if required.
* The microphone input can be allowed for localhost, but for deployment purposes we need a secured HTTPS connection for allowing the input from the microphone to be passed on to client-side scripts.

## Understanding the visualisations

The main file of interest is the sketch.js file located in `assets/js` folder.

13 MFCC features are extracted for each sample across the time domain in real time. Each sample forms one column i.e. along the horizontal axis while each row represents a unique mfcc feature. 

Audio input is taken from the `Audio Context` using `navigator.mediaDevices.getUserMedia(...)` function which passes on the `Stream` object which is used to create a audio source from where `Meyda.createMeydaAnalyzer(...)` is used to extract audio mfcc features. If the rms value of the recieved audio signal is greater than a threshold, mfcc features are depicted in the diagram using p5.js.
