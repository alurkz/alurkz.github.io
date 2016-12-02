//KEY CLASS

function Color( r, g, b, a ) { return vec4( r, g, b, a ); }     // Colors are just special vec4s expressed as: ( red, green, blue, opacity )

var white = new Material( Color(1, 1, 1, 1), 1, 1, 1, 1);
var black = new Material( Color(0, 0, 0, 1), .01, .4, .2, 20);

function key() {
    
        this.position = [];
        this.note = [];
        this.wDim = [1/88, 10/3/88, 2/3/88]
        this.bDim = [1.5/3/88, 0.66*10/3/88, 0.7/88];
        this.angle = 0;
    
    }
    
    key.prototype.draw = function(shape, graphicsState, model) {
       
        model = mult(model, translation(0.5*this.wDim[0], 0, 0));
        var modelTemp = mult(model, rotation(this.angle, 1, 0, 0));
        modelTemp = mult(modelTemp, translation(0, -0.5*this.wDim[1], 0));
        modelTemp = mult(modelTemp, scale(this.wDim[0], this.wDim[1], this.wDim[2]));
        shape.draw(graphicsState, modelTemp, white);
        return model = mult(model, translation(0.5*this.wDim[0], 0, 0));
        
    }
    
    key.prototype.on = function() {
        
        this.angle = 5;
        
    }
    
    key.prototype.off = function() {
        
        this.angle = 0;
        
    }
    
    class middleKey extends key {
        
        draw(shape, graphicsState, model) {
            
        var upDim = [this.wDim[0] - this.bDim[0], this.bDim[1], this.wDim[2]];
        var lowDim = [this.wDim[0], this.wDim[1] - this.bDim[1], this.wDim[2]];
            
        var modStack = [];
          
        model = mult(model, translation(0.5*upDim[0], 0, 0));
        var modelTemp = mult(model, rotation(this.angle, 1, 0, 0));
        modelTemp = mult(modelTemp, translation(0, -upDim[1] / 2, 0));
        modelTemp = mult(modelTemp, scale(upDim[0], upDim[1], upDim[2]));
        shape.draw(graphicsState, modelTemp, white);
        modelTemp = mult(modelTemp, scale(1 / upDim[0], 1 / upDim[1], 1 / upDim[2]));
        modelTemp = mult(modelTemp, translation(0, -upDim[1] / 2 - lowDim[1] / 2, 0));
        modelTemp = mult(modelTemp, scale(lowDim[0], lowDim[1], lowDim[2]));
        shape.draw(graphicsState, modelTemp, white); 
        return model = mult(model, translation(0.5*upDim[0], 0, 0));
            
        }
    } 

    class sideKey extends key {
        constructor(orientation) {
            super();
            this.orientation = orientation; // 0 for L, 1 for R   
        }
        
        draw(shape, graphicsState, model) {
            
        var upDim = [this.wDim[0] - 0.5*this.bDim[0], this.bDim[1], this.wDim[2]];
        var lowDim = [this.wDim[0], this.wDim[1] - this.bDim[1], this.wDim[2]];
        
        model = mult(model, translation(0.5*upDim[0], 0, 0));    
            
        var modelTemp = model;
        if (this.orientation == 1)
            modelTemp = mult(modelTemp, scale(-1, 1, 1));
            
        var modStack = [];
            
        modelTemp = mult(modelTemp, rotation(this.angle, 1, 0, 0));
        modelTemp = mult(modelTemp, translation(0, -upDim[1] / 2, 0));
        modelTemp = mult(modelTemp, scale(upDim[0], upDim[1], upDim[2]));
        shape.draw(graphicsState, modelTemp, white);
        modelTemp = mult(modelTemp, scale(1 / upDim[0], 1 / upDim[1], 1 / upDim[2]));
        modelTemp = mult(modelTemp, translation(0.25*this.bDim[0], -upDim[1] / 2 - lowDim[1] / 2, 0));
        modelTemp = mult(modelTemp, scale(lowDim[0], lowDim[1], lowDim[2]));
        shape.draw(graphicsState, modelTemp, white); 
        return model = mult(model, translation(0.5*upDim[0], 0, 0));
            
        }
    }
    
    class blackKey extends key {
        
        draw(shape, graphicsState, model) {
            
        model = mult(model, translation(0.5*this.bDim[0], 0, 0));
        var modelTemp = mult(model, rotation(this.angle, 1, 0, 0));
        modelTemp = mult(modelTemp, translation(0, -0.5*this.bDim[1], 0.5*  this.bDim[2]));
        modelTemp = mult(modelTemp, scale(this.bDim[0], this.bDim[1], this.bDim[2]));
        shape.draw(graphicsState, modelTemp, black);
        return model = mult(model, translation(0.5*this.bDim[0], 0, 0));
            
        }
    }

//OCTAVE CLASS

function octave(number) {
    
    this.number = number;
    this.keySpacing = 0.05/3/88;
    this.width = []; 
    this.key = [];
    
    var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G#', 'G', 'A', 'A#', 'B'];
    
    if (this.number == 0) {
        
        this.key[0]  = new sideKey(0);
        this.key[1]  = new blackKey();
        this.key[2]  = new sideKey(1);
        this.width = 3*this.key[0].wDim[0] + 3*this.keySpacing;
        
        for (i = 0; i < 3; i++) {
            
            this.key[i].note = notes[i + 9] + this.number.toString();
            this.key[i].position = i + 1;
            
        }
        
    }
    
    else if (this.number == 8) {
        
        this.key[0] = new key();
        this.key[0].note = 'C8';
        this.key[0].position = 88;
        this.width = this.key[0].wDim[0] + 2*this.keySpacing;
        
    }

    else {
        
        this.key[0]  = new sideKey(0);
        this.key[1]  = new blackKey();
        this.key[2]  = new middleKey();
        this.key[3]  = new blackKey();
        this.key[4]  = new sideKey(1);
        this.key[5]  = new sideKey(0);
        this.key[6]  = new blackKey();
        this.key[7]  = new middleKey();
        this.key[8]  = new blackKey();
        this.key[9]  = new middleKey();
        this.key[10] = new blackKey();
        this.key[11] = new sideKey(1);
        this.width = 7*this.key[0].wDim[0] + 7*this.keySpacing;
        
        for (i = 0; i < 12; i++) {

            this.key[i].note = notes[i] + this.number.toString();
            this.key[i].position = 12*(this.number - 1) + i + 1 + 3;

        }
    }
    
}

octave.prototype.draw = function(shape, graphicsState, model) {
    
    var modelTemp = model;
    var lim = this.key.length;
    
    for (var i = 0; i < lim; i++) {
        
        modelTemp = mult(modelTemp, translation(this.keySpacing, 0, 0));
        modelTemp = this.key[i].draw(shape, graphicsState, modelTemp);
        
    }
    
    return modelTemp;
          
}

octave.prototype.pressKey = function(k) {
    
    this.key[k-1].on();
    
}

octave.prototype.releaseKey = function(k) {
    
    this.key[k-1].off();
    
}

//KEYBOARD CLASS

function keyboard() {
    
    this.octave = [];
    this.width = 0;
    
    for (var i = 0; i < 9; i++) {
        
        this.octave[i] = new octave(i);
        this.width += this.octave[i].width;
    }
        
}

keyboard.prototype.draw = function(shape, graphicsState, model) {
    
    var modelTemp = model;
    modelTemp = mult(modelTemp, translation(0,0,0.5*this.octave[0].key[0].wDim[2]));
    
    for (var i = 0; i < 9; i++) {
        
        modelTemp = this.octave[i].draw(shape, graphicsState, modelTemp);
        
    }
    
}

keyboard.prototype.pressKey = function(k) {
    
    if (k == 88)
        this.octave[8].key[0].on();
    
    if (0 < k && k < 4)
        this.octave[0].key[k-1].on();
    
    else {
        var oct = Math.ceil((k-3)/12);
        var pos = k - (12*(oct - 1) + 4);
        this.octave[oct].key[pos].on();
        this.octave[oct].key[pos].position;
        }
    
}

keyboard.prototype.releaseKey = function(k) {
    
    if (k == 88)
        this.octave[8].key[0].off();
    
    if (0 < k && k < 4)
        this.octave[0].key[k-1].off();
    
    else {
        var oct = Math.ceil((k-3)/12);
        var pos = k - (12*(oct - 1) + 4);
        this.octave[oct].key[pos].off();
        }
    
}

