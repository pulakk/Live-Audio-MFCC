// setup init variables
var DEFAULT_MFCC_VALUE = [0,0,0,0,0,0,0,0,0,0,0,0,0]
var FEATURE_NAME_MFCC = 'mfcc'
var FEATURE_NAME_RMS = 'rms'

var THRESHOLD_RMS = 0.002 // threshold on rms value
var MFCC_HISTORY_MAX_LENGTH = 60

var BOX_WIDTH = 25
var BOX_HEIGHT = 20

var silence = true

var cur_mfcc = DEFAULT_MFCC_VALUE
var cur_rms = 0
var mfcc_history = []


function 
/* get new audio 
context object */
createAudioCtx(){
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    return new AudioContext();
}


function
/* create microphone
audio input source from 
audio context */
createMicSrcFrom(audioCtx){
    /* get microphone access */
    return new Promise((resolve, reject)=>{
        /* only audio */
        let constraints = {audio:true, video:false}

        navigator.mediaDevices.getUserMedia(constraints)
        .then((stream)=>{
            /* create source from
            microphone input stream */
            let src = audioCtx.createMediaStreamSource(stream)
            resolve(src)
        }).catch((err)=>{reject(err)})
    })
}



function
/* call given function
on new microphone analyser
data */
onMicDataCall(features, callback){
    return new Promise((resolve, reject)=>{
        let audioCtx = createAudioCtx()

        createMicSrcFrom(audioCtx)
        .then((src) => {
            let analyzer = Meyda.createMeydaAnalyzer({
                'audioContext': audioCtx,
                'source':src,
                'bufferSize':512,
                'featureExtractors':features,
                'callback':callback
            })
            resolve(analyzer)
        }).catch((err)=>{
            reject(err)
        })
    })
    
}


function setup() {
    // canvas setup
    createCanvas(BOX_WIDTH * MFCC_HISTORY_MAX_LENGTH, BOX_HEIGHT * cur_mfcc.length)
    background(255, 230, 150)

    // create meyda analyzer 
    // and connect to mic source
    onMicDataCall([FEATURE_NAME_MFCC, FEATURE_NAME_RMS], show)
    .then((meydaAnalyzer) => {
        meydaAnalyzer.start()
    }).catch((err)=>{
        alert(err)
    })
}

function show(features){
    // update spectral data size
    cur_mfcc = features[FEATURE_NAME_MFCC]
    cur_rms = features[FEATURE_NAME_RMS]
}



function draw () {
    clear ()
    background ( 255, 230, 150 )

    /* append new mfcc values */
    if ( cur_rms > THRESHOLD_RMS ) {
        mfcc_history.push ( cur_mfcc )
        silence = false
    } else {
        // push an empty mfcc value 
        // to signify end of utterance
        if ( silence == false ) {
            mfcc_history.push(DEFAULT_MFCC_VALUE)
            silence = true
        }
    }

    // only store the last n 
    if(mfcc_history.length > MFCC_HISTORY_MAX_LENGTH)
        mfcc_history.splice(0,1)
    
    plot(mfcc_history)
}


let plot = (data) => {
    for(let i = 0; i < data.length; i++ ) {
        for(let j = 0; j < data [i].length; j++ ) {
            let color_strength = data[i][j] * 100

            // setting color
            if ( data [i] [j] >= 0 )
                fill ( 100, color_strength, 100 )
            else
                fill( 100, 100, - color_strength )
            
            noStroke();
            
            // drawing the rectangle
            rect(i * BOX_WIDTH, j * BOX_HEIGHT, BOX_WIDTH, BOX_HEIGHT)
        }
    }
}
