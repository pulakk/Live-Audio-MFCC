// setup init variables
var defaultMfcc = [0,0,0,0,0,0,0,0,0,0,0,0,0]
var mfcc = defaultMfcc
var rms = 0
var listening = false
var featureType = 'mfcc'
var featureType2 = 'rms'
var threshold = 0.002 // threshold on rms value
var mfccThreshold = 0.1 // threshold on mffc feature values
var silence = true

// draw init variables
var magnify = 100
var data = []
var rectWidth = 10
var rectHeight = 5
var maxDataLength = 60
var featureSize = 13


function setup() {
    // initialisations
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    var context = new AudioContext()
    var source = null
    var startButton = null
    var stopButton = null

    // canvas setup
    createCanvas(rectWidth*maxDataLength, rectHeight*featureSize)
    background(255, 230, 150)

    // get microphone
    navigator.getUserMedia({audio:true, video:false},function(stream){
        // get audio stream data
        source = context.createMediaStreamSource(stream)

        // analyser setup
        meydaAnalyzer = Meyda.createMeydaAnalyzer({
            'audioContext':context,
            'source':source,
            'bufferSize':512,
            'featureExtractors':[featureType, featureType2],
            'callback':show
        })

        // buttons
        startButton = createButton('Start')
        startButton.mousePressed(function(){
            // start audio analyzer
            if(listening == false){
                meydaAnalyzer.start([featureType, featureType2])
                listening = true
                startButton.html('Stop')
                startButton.style('background:#aa0')
            }else{
                meydaAnalyzer.stop()
                listening = false
                startButton.html('Start')
                startButton.style('background:#aaf')
            }
        })

    }, function(error){
        console.log(error)
    })
}

function show(features){
    // update spectral data size
    mfcc = features[featureType]
    rms = features[featureType2]
}

function check(x){
    return mfcc[x] > mfccThreshold
}

function draw(){
    clear()
    background(255, 230, 150)

    // if valid sound frame recieved add to data
    if(rms>threshold){
        data.push(mfcc)
        silence = false
        rms = 0
    }else{
        if(silence == false){
            data.push(defaultMfcc)
            silence = true
        }
    }
    if(data.length>maxDataLength){
        data.splice(0,1)
    }

    // print data
    for(i=0;i<data.length;i++){
        for(j=0;j<data[i].length;j++){
            var value = data[i][j]*magnify
            if(data[i][j]>=0){
                fill(0,value,0)
            }else{
                fill(0,0,-value)
            }
            rect(i*rectWidth, j*rectHeight, rectWidth, rectHeight)
        }
    }


}
