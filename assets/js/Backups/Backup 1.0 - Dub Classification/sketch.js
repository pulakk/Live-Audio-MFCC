var mfcc = [0,0,0,0,0,0,0,0,0,0,0,0,0]
// var prevMfcc_1 = mfcc
// var prevMfcc_2 = mfcc
var rms = 0
var featureType = 'mfcc'
var featureType2 = 'rms'
var reading = false
var threshold = 0.02 // threshold on rms value
var mfccThreshold = 0.1 // threshold on mffc feature values
var state = false

// var bass = [1.034324505541008, 0.9907758320841706, 0.9153548764860876, 0.7798779575242434, 0.6186216436790466, 0.43838340114155605, 0.2582400567181015, 0.09427142903433147, -0.04436422603344166, -0.1471289743789906, -0.21224018080444912, -0.23967428575033828, -0.23412634789164352]
// var snare = [0.05932414117933149, 0.001698733847200927, -0.05609176186544851, -0.008178087293111667, 0.05325815987622464, 0.012282362606420886, -0.04771664244852446, -0.01578292258254501, 0.04144511475183407, 0.0175096232808872, -0.03428355066399493, -0.01801918734392172, 0.0271414787855924]
// var crash = [0.06539901988435304, -0.03537511388909906, -0.015719899502762993, 0.04486651843973512, -0.02292602869562979, -0.017080900143896693, 0.03953526328476157, -0.019868169506403494, -0.014460830446770963, 0.03180835512376682, -0.014819585994620028, -0.01571055674505072, 0.02993233950938755]

function setup() {
    // initialisations
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    var context = new AudioContext()
    var source = null
    var startButton = null
    var stopButton = null

    // canvas setup
    createCanvas(1000, 500)
    background(255, 230, 150)
    fill(140,140,255)


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
            if(reading == false){
                meydaAnalyzer.start([featureType, featureType2])
                reading = true
                startButton.html('Stop')
                startButton.style('background:#aa0')
            }else{
                meydaAnalyzer.stop()
                reading = false
                startButton.html('Start')
                startButton.style('background:#aaf')
            }
        })

    },function(error){
        console.log(error)
    })
}

function show(features){
    // update spectral data size
    mfcc = features[featureType]
    rms = features[featureType2]
    // console.log(mfcc)
    // console.log(rms)
    if(state==false && rms>threshold){
        state = true
    }else if(state==true && rms<threshold){
        console.log('Pause found')
        state = false
    }
}

function check(x){
    return mfcc[x] > mfccThreshold
}

// function distance(x, y){
//     let distance = 0
//     for(var i=0;i<x.length;i++){
//         distance += (x[i]-y[i])*(x[i]-y[i])
//     }
//     return distance
// }

function draw(){
    clear()
    cols = 13
    // mfcc data
    for(var i = 0;i<cols;i++){
        var color = null
        if(mfcc[i]>=0){
            red = mfcc[i]*1000*255
            blue = 0
        }else{
            blue = -mfcc[i]*1000*255
            red = 0
        }
        fill(red, 0, blue)
        var x = 30
        var y = i*30
        rect(x,y, 30, 30)
    }

    // classification
    var size = 50
    if(check(0)&check(1)&check(2)&check(4)){
        // default
        fill(140,140,140)
        ellipse(800, 50, 50, 50)
        // colored
        fill(140,140,255)
        size += rms*3000
        ellipse(900, 50, size, size)
    }
    else if(check(0)&(check(3)|| check(4) || check(5))){
        // default
        fill(140,140,140)
        ellipse(900, 50, 50, 50)
        // colored
        fill(255,140,140)
        size += rms*3000
        ellipse(800, 50, size, size)
    }else{
        fill(140,140,140)
        ellipse(800, 50, size, size)
        ellipse(900, 50, size, size)
    }
}
