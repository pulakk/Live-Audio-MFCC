# Live Audio Feature Visualization

[Web audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) is a high-level Javascript API for processing and synthesizing audio in the browser. Along with [meyda.js](https://meyda.js.org/getting-started), web audio API can be used for processing live audio input from the microphone and extracting audio features like Mel-frequency cepstral coefficients (MFCCs). [P5.js](https://p5js.org/) is a drawing and sketching library for Javascript. It can be used for plotting and visualizing the audio features extracted.

<img src="https://github.com/mizimo/Live-Audio-MFCC/raw/master/screenshot.png" width="100%">

## Listening to Live Audio - Microphone Input

In Web Audio API, the [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) interface represents a graph of [AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode) objects. Each AudioNode Object represents an audio processing node. 

For our purpose, creating two simple nodes shall be enough. One is a source node which returns the audio captured from the microphone. The other is a Meyda Analyzer node, which will extract useful features for us.

Let us start by creating a new audio context.

{% highlight javascript %}

    function createAudioCtx(){
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        return new AudioContext();
    }
{% endhighlight %}

We can create then create a source node using the audio context.

{% highlight javascript %}

    function createMicSrcFrom ( audioCtx ) {
        return new Promise ( ( resolve, reject ) => {
            /* only audio */
            let constraints = { audio : true, video : false }

            /* get microphone access */
            navigator.mediaDevices.getUserMedia ( constraints )
            .then ( ( stream ) => {
                /* create source from microphone input stream */
                let src = audioCtx.createMediaStreamSource ( stream )
                resolve ( src )
            }).catch ( (err ) => { reject ( err ) } )
        })
    }
{% endhighlight %}

## Extracting MFCC Features
 
 The Audio Input source node can then be connected to a Meyda Analyzer to extract MFCC features. A reference to the audio context will be required to create the source node and connect it to the analyzer. The `featureExtractors` parameter is used to specify the various audio features to be extracted from the source node. We will be extracting two features - MFCC and RMS. 
 
During each callback, the MFCC features return 13 different values for each log frequency filter. The RMS value returns the power associated with the audio signal.
 
{% highlight javascript %}

    function setupMeydaAnalzer () {
        let audioCtx = createAudioCtx ()

        createMicSrcFrom ( audioCtx )
        .then ( ( src ) => {
            let analyzer = Meyda.createMeydaAnalyzer ({
                'audioContext': audioCtx,
                'source':src,
                'bufferSize':512,
                'featureExtractors':["mfcc","rms"],
                'callback':callback
            })
            analyzer.start ()
        }).catch ( ( err ) => {
            alert ( err )
        })
    }
{% endhighlight %}

The callback function can be used to process and visualize the extracted features from the audio input. To ensure that the array does not grow too large, past MFCC values are removed after the size of the array grows to a certain value.

{% highlight javascript %}

    function callback ( features ) {
        let mfcc = features ["mfcc"]
        let rms = features ["rms"]    

        if ( rms > THRESHOLD_RMS ) 
            mfcc_history.push ( mfcc ) /* only push mfcc where some audio is present */

        if(mfcc_history.length > MFCC_HISTORY_MAX_LENGTH)
            mfcc_history.splice(0,1) /* remove past mfcc values */
    }
{% endhighlight %}

## Visualizing MFCC Features using P5.js

P5.js provides simple functions to plot data onto a canvas element. It needs two functions to be specified in the JS file. The `setup()` function is called in the beginning while the `draw()` function is called every frame update.

An HTML `<canvas>` element needs to be created in the `setup()` function. We can then setup the meyda analyzer by calling the function.
{% highlight javascript %}

    function setup() {
        createCanvas ( BOX_WIDTH * MFCC_HISTORY_MAX_LENGTH, BOX_HEIGHT * cur_mfcc.length )
        background ( 255, 230, 150 )

        setupMeydaAnalzer ()
    }
{% endhighlight %}

The `mfcc_history` object is a sequence of MFCC arrays (each of size 13) i.e. a 2D array of values for each log-frequency filter in the MFCC. This array is then plotted onto the `<canvas>` element using P5.

{% highlight javascript %}

    function plot(data){
      for(let i = 0; i < data.length; i++ ) {
        for(let j = 0; j < data [i].length; j++ ) {
          // setting fill color
          if ( data [i] [j] >= 0 ) fill ( 100, data[i][j] * 100, 100 )
          else fill( 100, 100, - data[i][j] * 100 )

          noStroke();
          rect(i * BOX_WIDTH, j * BOX_HEIGHT, BOX_WIDTH, BOX_HEIGHT)
        }
      }
    }
{% endhighlight %}

We then call `plot ( mfcc_history )` in the `draw()` function, which dynamically updates the `<canvas>` element every frame and produces visuals similar to the one shown below.

<img src="https://github.com/mizimo/Live-Audio-MFCC/raw/master/screenshot.png" width="100%">
