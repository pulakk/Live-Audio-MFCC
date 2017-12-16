var express = require('express')
var app = express()

// assets folder
app.use('/assets', express.static('assets'))

// requests handling
app.get('/',function(req, res){
    res.sendFile(__dirname+"/templates/spectral.html")
})

// set port listener
app.listen(3000)
