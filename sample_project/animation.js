// *******************************************************
// CS 174a Graphics Example Code
// animation.js - The main file and program start point.  The class definition here describes how to display an Animation and how it will react to key and mouse input.  Right now it has 
// no meaningful scenes to draw - you will fill it in (at the bottom of the file) with all your shape drawing calls and any extra key / mouse controls.  

"use strict"      // Selects strict javascript
var canvas, canvas_size, shaders, gl = null, g_addrs,          // Global variables
	thrust = vec3(), 	origin = vec3( 0, 10, -15 ), looking = false, prev_time = 0, animate = false, animation_time = 0, gouraud = false, color_normals = false;

//state variables
    var pianoFalling = 1;
    var playPiano = 0;
    var pianoDemo = 0;    
    var frameCount = 0;
    var dropPiano = 0;
    var dropStartTime = 0;

//midi file variables
    var song = ["Giesbrecht01.MID","Wind-Beneath-My-Wings.mid","mccoy.mid"];
    var songIdx = 0;
    var instrument = ["acoustic_grand_piano","electric_piano_1"];

// *******************************************************
// IMPORTANT -- Any new variables you define in the shader programs need to be in the list below, so their GPU addresses get retrieved.

var shader_variable_names = [ "camera_transform", "camera_model_transform", "projection_camera_model_transform", "camera_model_transform_normal",
                              "shapeColor", "lightColor", "lightPosition", "attenuation_factor", "ambient", "diffusivity", "shininess", "smoothness", 
                              "animation_time", "COLOR_NORMALS", "GOURAUD", "USE_TEXTURE" ];
   
function Color( r, g, b, a ) { return vec4( r, g, b, a ); }     // Colors are just special vec4s expressed as: ( red, green, blue, opacity )
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( Color( .8,.3,.8,1 ), .1, 1, 1, 40, undefined ) ); }

// *******************************************************
// IMPORTANT -- In the line below, add the filenames of any new images you want to include for textures!

var texture_filenames_to_load = [ "stars.png", "text.png", "earth.gif", "insidepiano3.png", "blackholevig.png", "title2.png" ];

window.onload = function init() {	

    //loads MIDI soundbank and proceeds to run animation
    MIDI.loadPlugin({
        soundfontUrl: "../Common/MIDI.js-master/examples/soundfont/",
        instrument: instrument[0],
        onprogress: function(state, progress) {
            console.log(state, progress);
        },
        onsuccess: function() {    
            
            MIDI.programChange(0, MIDI.GM.byName[instrument[0]].number);
            var anim = new Animation();
            
        }
	});

} 




// *******************************************************	
// When the web page's window loads it creates an "Animation" object.  It registers itself as a displayable object to our other class "GL_Context" -- 
// which OpenGL is told to call upon every time a draw / keyboard / mouse event happens.
function Animation()    // A class.  An example of a displayable object that our class GL_Context can manage.
{
    
	( function init( self )
	{
		self.context = new GL_Context( "gl-canvas", Color( 0, 0, 0, 1 ) );    // Set your background color here
		self.context.register_display_object( self );
		
    shaders = { "Default":     new Shader( "vertex-shader-id", "fragment-shader-id" ), 
                "Demo_Shader": new Shader( "vertex-shader-id", "demo-shader-id"     )  };
    
		for( var i = 0; i < texture_filenames_to_load.length; i++ )
			initTexture( texture_filenames_to_load[i], true );
    self.mouse = { "from_center": vec2() };
		            
    self.m_cube        = new Cube();
    //self.m_obj         = new Shape_From_File( "piano.obj", scale( 1, 1, 1 ) );
    self.m_axis        = new Axis();
    self.m_piano       = new Piano();
    self.m_insidepiano = new InsidePiano();
    self.m_keyboard    = new keyboard();
    self.m_blackhole   = new BlackHole();
        
    //set up intro music    
    self.audio = new Audio('Death Grips - Exmilitary - 9 - 5D.mp3');       
        
// 1st parameter is our starting camera matrix.  2nd parameter is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		self.graphicsState = new GraphicsState( translation(0, 0,-25), perspective(45, canvas.width/canvas.height, .1, 1000), 0 );
		
		self.context.render();	
	} ) ( this );
	
// *** Mouse controls: ***
  var mouse_position = function( e ) { return vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2 ); };   // Measure mouse steering, for rotating the flyaround camera.     
  canvas.addEventListener("mouseup",   ( function(self) { return function(e)	{ e = e || window.event;		self.mouse.anchor = undefined;              } } ) (this), false );
	canvas.addEventListener("mousedown", ( function(self) { return function(e)	{	e = e || window.event;    self.mouse.anchor = mouse_position(e);      } } ) (this), false );
  canvas.addEventListener("mousemove", ( function(self) { return function(e)	{ e = e || window.event;    self.mouse.from_center = mouse_position(e); } } ) (this), false );                                         
  canvas.addEventListener("mouseout", ( function(self) { return function(e)	{ self.mouse.from_center = vec2(); }; } ) (this), false );        // Stop steering if the mouse leaves the canvas. 
}

// *******************************************************	
// init_keys():  Define any extra keyboard shortcuts here
Animation.prototype.init_keys = function()
{
	shortcut.add( "Space", function() { thrust[1] = -1; } );			shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	
    // setting up user input midi
    var del = 0; // note delay
    var vel = 127; // how hard the note hits
    var note = 60; //starting note
    var key = note-20; //starting key
    
    var keyOn = []; // 1 is a key is being held, 0 if not.
    for (var i = 0; i < 88; i++)
        keyOn[i] = 0;
    
    //controlling music keyboard with computer keyboard
	shortcut.add( "a", 
        (function(self) {
            return function () {  
                if (!keyOn[0]) {
                    keyOn[0] = 1;
                    MIDI.noteOn(0, note, vel, 0);                                                              
                    self.m_keyboard.pressKey(key); 
                }
            }
        }
        )(this));
    shortcut.add( "a", 
        (function(self) {
            return function () {
                keyOn[0] = 0;
                MIDI.noteOff(0, note, 0); 
                self.m_keyboard.releaseKey(key);
            }
        })(this), {'type':'keyup'});
    shortcut.add( "w", 
        (function(self) {
            return function () {  
                if (!keyOn[1]) {
                    keyOn[1] = 1;
                    MIDI.noteOn(0, note+1, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+1); 
                }
            }
        }
        )(this));
    shortcut.add( "w", 
        (function(self) {
            return function () {
                keyOn[1] = 0;
                MIDI.noteOff(0, note+1, 0); 
                self.m_keyboard.releaseKey(key+1);
            }
        })(this), {'type':'keyup'});
    shortcut.add( "s", 
        (function(self) {
            return function () {  
                if (!keyOn[2]) {
                    keyOn[2] = 1;
                    MIDI.noteOn(0, note+2, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+2); 
                }
            }
        }
        )(this));
    shortcut.add( "s", 
        (function(self) {
            return function () {
                keyOn[2] = 0;
                MIDI.noteOff(0, note+2, 0); 
                self.m_keyboard.releaseKey(key+2);
            }
        })(this), {'type':'keyup'});
    shortcut.add( "e", 
        (function(self) {
            return function () {  
                if (!keyOn[3]) {
                    keyOn[3] = 1;
                    MIDI.noteOn(0, note+3, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+3); 
                }
            }
        }
        )(this));
    shortcut.add( "e", 
        (function(self) {
            return function () {
                keyOn[3] = 0;
                MIDI.noteOff(0, note+3, 0); 
                self.m_keyboard.releaseKey(key+3);
            }
        })(this), {'type':'keyup'});
    shortcut.add( "d", 
        (function(self) {
            return function () {  
                if (!keyOn[4]) {
                    keyOn[4] = 1;
                    MIDI.noteOn(0, note+4, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+4); 
                }
            }
        }
        )(this));
    shortcut.add( "d", 
        (function(self) {
            return function () {
                keyOn[4] = 0;
                MIDI.noteOff(0, note+4, 0); 
                self.m_keyboard.releaseKey(key+4);
            }
        })(this), {'type':'keyup'});
    shortcut.add( "f", 
        (function(self) {
            return function () {  
                if (!keyOn[5]) {
                    keyOn[5] = 1;
                    MIDI.noteOn(0, note+5, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+5); 
                }
            }
        }
        )(this));
    shortcut.add( "f", 
        (function(self) {
            return function () {
                keyOn[5] = 0;
                MIDI.noteOff(0, note+5, 0); 
                self.m_keyboard.releaseKey(key+5);
            }
        })(this), {'type':'keyup'});
    shortcut.add( "t", 
        (function(self) {
            return function () {  
                if (!keyOn[6]) {
                    keyOn[6] = 1;
                    MIDI.noteOn(0, note+6, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+6); 
                }
            }
        }
        )(this));
    shortcut.add( "t", 
        (function(self) {
            return function () {
                keyOn[6] = 0;
                MIDI.noteOff(0, note+6, 0); 
                self.m_keyboard.releaseKey(key+6);
            }
        })(this), {'type':'keyup'});

    shortcut.add( "g", 
        (function(self) {
            return function () {  
                if (!keyOn[7]) {
                    keyOn[7] = 1;
                    MIDI.noteOn(0, note+7, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+7); 
                }
            }
        }
        )(this));
    shortcut.add( "g", 
        (function(self) {
            return function () {
                keyOn[7] = 0;
                MIDI.noteOff(0, note+7, 0); 
                self.m_keyboard.releaseKey(key+7);
            }
        })(this), {'type':'keyup'});

    shortcut.add( "y", 
        (function(self) {
            return function () {  
                if (!keyOn[8]) {
                    keyOn[8] = 1;
                    MIDI.noteOn(0, note+8, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+8); 
                }
            }
        }
        )(this));
    shortcut.add( "y", 
        (function(self) {
            return function () {
                keyOn[8] = 0;
                MIDI.noteOff(0, note+8, 0); 
                self.m_keyboard.releaseKey(key+8);
            }
        })(this), {'type':'keyup'});

    shortcut.add( "h", 
        (function(self) {
            return function () {  
                if (!keyOn[9]) {
                    keyOn[9] = 1;
                    MIDI.noteOn(0, note+9, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+9); 
                }
            }
        }
        )(this));
    shortcut.add( "h", 
        (function(self) {
            return function () {
                keyOn[9] = 0;
                MIDI.noteOff(0, note+9, 0); 
                self.m_keyboard.releaseKey(key+9);
            }
        })(this), {'type':'keyup'});

    shortcut.add( "u", 
        (function(self) {
            return function () {  
                if (!keyOn[10]) {
                    keyOn[10] = 1;
                    MIDI.noteOn(0, note+10, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+10); 
                }
            }
        }
        )(this));
    shortcut.add( "u", 
        (function(self) {
            return function () {
                keyOn[10] = 0;
                MIDI.noteOff(0, note+10, 0); 
                self.m_keyboard.releaseKey(key+10);
            }
        })(this), {'type':'keyup'});

    shortcut.add( "j", 
        (function(self) {
            return function () {  
                if (!keyOn[11]) {
                    keyOn[11] = 1;
                    MIDI.noteOn(0, note+11, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+11); 
                }
            }
        }
        )(this));
    shortcut.add( "j", 
        (function(self) {
            return function () {
                keyOn[11] = 0;
                MIDI.noteOff(0, note+11, 0); 
                self.m_keyboard.releaseKey(key+11);
            }
        })(this), {'type':'keyup'});
    
    shortcut.add( "k", 
        (function(self) {
            return function () {  
                if (!keyOn[12]) {
                    keyOn[12] = 1;
                    MIDI.noteOn(0, note+12, vel, 0);                                                              
                    self.m_keyboard.pressKey(key+12); 
                }
            }
        }
        )(this));
    shortcut.add( "k", 
        (function(self) {
            return function () {
                keyOn[12] = 0;
                MIDI.noteOff(0, note+12, 0); 
                self.m_keyboard.releaseKey(key+12);
            }
        })(this), {'type':'keyup'});
    
    
    //controlling state variables with keyboard
    shortcut.add( "l", (function(self) {
                            return function () {
                                if (playPiano || pianoDemo) {
                                    dropPiano = !dropPiano;
                                    dropStartTime = self.graphicsState.animation_time/1000;
                                }
                            }
                        })(this));
    
    shortcut.add( "n", (function(self) {
                            return function () {
                                //playPiano = 1; 
                                pianoDemo = 1; 
                                pianoFalling = 0; 
                                self.audio.pause();
                                if (MIDI.Player.playing)
                                    MIDI.Player.stop();
                            }
                        })(this));
    
    shortcut.add( "m", (function(self) {
                            return function () {    
                                pianoDemo = 1; 
                                //playPiano = 0;
                                pianoFalling = 0; 
                                self.audio.pause();
                                MIDI.Player.loadFile(song[songIdx], MIDI.Player.start);
                            }
                        })(this));
    
    //controls to change songs
        shortcut.add( "x", (function(self) {
                            return function () {
                                if (pianoDemo) {
                                    MIDI.Player.stop();
                                    if (songIdx == 0)
                                        songIdx = song.length - 1
                                    else
                                        songIdx = Math.abs(songIdx-1) % song.length;
                                    console.log(songIdx);
                                    MIDI.Player.loadFile(song[songIdx], MIDI.Player.start);
                                }
                            }
                        })(this));
        
        shortcut.add( "c", (function(self) {
                            return function () { 
                                if (pianoDemo) {
                                    MIDI.Player.stop();
                                    songIdx = (songIdx+1) % song.length;
                                    console.log(songIdx);
                                    MIDI.Player.loadFile(song[songIdx], MIDI.Player.start);
                                }
                            }
                        })(this));
    
    //other shortcuts    
    shortcut.add( "up",     function() { thrust[2] =  1; } );			shortcut.add( "up",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "left",     function() { thrust[0] =  1; } );			shortcut.add( "left",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "down",     function() { thrust[2] = -1; } );			shortcut.add( "down",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "right",     function() { thrust[0] = -1; } );			shortcut.add( "right",     function() { thrust[0] =  0; },
    {'type':'keyup'} );                                                                               
    shortcut.add( "ALT+f",     function() { looking = !looking; } );
	shortcut.add( ",",   ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0,  1 ), self.graphicsState.camera_transform       ); } } ) (this) ) ;
	shortcut.add( ".",   ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0, -1 ), self.graphicsState.camera_transform       ); } } ) (this) ) ;
  shortcut.add( "o",   ( function(self) { return function() { origin = vec3( mult_vec( inverse( self.graphicsState.camera_transform ), vec4(0,0,0,1) )                       ); } } ) (this) ) ;
	shortcut.add( "ALT+g", function() { gouraud = !gouraud; } );
	shortcut.add( "ALT+n", function() { color_normals = !color_normals;	} );
	shortcut.add( "ALT+a", ( function(self) { return function() { animate = !animate; if (pianoFalling) self.audio.play(); }; } )                                                                                                                          (this) );
	shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; }; } ) (this) );
	shortcut.add( "/",     ( function(self) { return function() { self.m_axis.basis_selection--; }; } ) (this) );	
}

Animation.prototype.update_strings = function( debug_screen_strings )	      // Strings that this displayable object (Animation) contributes to the UI:	
{
    debug_screen_strings.string_map["fps"]    = "Avg FPS: " + (frameCount/this.graphicsState.animation_time*1000).toFixed(2) + " Hz";
    debug_screen_strings.string_map["fps2"]   = "FPS: " + (1000/this.animation_delta_time).toFixed(2) + " Hz";
    debug_screen_strings.string_map["frame"]  = "Frame: " + frameCount;
	debug_screen_strings.string_map["time"]   = "Animation Time: " + this.graphicsState.animation_time/1000 + " s";
	debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	debug_screen_strings.string_map["thrust"]  = "Thrust: " + thrust;
    debug_screen_strings.string_map["basis"]   = "Showing basis: " + this.m_axis.basis_selection;
}

function update_camera( self, animation_delta_time )
	{
		var leeway = 70,  degrees_per_frame = .0004 * animation_delta_time,
                      meters_per_frame  =   .01 * animation_delta_time;
										
    if( self.mouse.anchor ) // Dragging mode: Is a mouse drag occurring?
    {
      var dragging_vector = subtract( self.mouse.from_center, self.mouse.anchor);           // Arcball camera: Spin the scene around the world origin on a user-determined axis.
      if( length( dragging_vector ) > 0 )
        self.graphicsState.camera_transform = mult( self.graphicsState.camera_transform,    // Post-multiply so we rotate the scene instead of the camera.
            mult( translation(origin),                                                      
            mult( rotation( .05 * length( dragging_vector ), dragging_vector[1], dragging_vector[0], 0 ), 
            translation(scale_vec( -1,origin ) ) ) ) );
    }    
          // Flyaround mode:  Determine camera rotation movement first
		var movement_plus  = [ self.mouse.from_center[0] + leeway, self.mouse.from_center[1] + leeway ];  // mouse_from_center[] is mouse position relative to canvas center;
		var movement_minus = [ self.mouse.from_center[0] - leeway, self.mouse.from_center[1] - leeway ];  // leeway is a tolerance from the center before it starts moving.
		
		for( var i = 0; looking && i < 2; i++ )			// Steer according to "mouse_from_center" vector, but don't start increasing until outside a leeway window from the center.
		{
			var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
			self.graphicsState.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), self.graphicsState.camera_transform );			// On X step, rotate around Y axis, and vice versa.
		}
		self.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), self.graphicsState.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}

    
// *******************************************************	
// display(): Called once per frame, whenever OpenGL decides it's time to redraw.

Animation.prototype.display = function(time)
	{  
		if(!time) time = 0;                                                               // Animate shapes based upon how much measured real time has transpired
		this.animation_delta_time = time - prev_time;                                     // by using animation_time
		if( animate ) this.graphicsState.animation_time += this.animation_delta_time;
		prev_time = time;
		
		update_camera( this, this.animation_delta_time );
			
		var model_transform = mat4();	            // Reset this every frame.
		this.basis_id = 0;	                      // For the "axis" shape.  This variable uniquely marks each axis we draw in display() as it counts them up.
    
    shaders[ "Default" ].activate();                         // Keep the flags seen by the default shader program up-to-date
		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud );		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);    
		
    
		// *** Lights: *** Values of vector or point lights over time.  Arguments to construct a Light(): position or vector (homogeneous coordinates), color, size
    // If you want more than two lights, you're going to need to increase a number in the vertex shader file (index.html).  For some reason this won't work in Firefox.
    this.graphicsState.lights = [];  // First clear the light list each frame so we can replace & update lights.
    
    
			
		/**********************************
		Start coding down here!!!!
		**********************************/                                     
    
    if (animate)
        frameCount += 1; //update number of frames
    
    //general variables
    var state = this.graphicsState;
    var t = this.graphicsState.animation_time/1000;
    var white = new Material( Color(1, 1, 1, 1), 1, 1, 1, 1);
    var black = new Material( Color(0, 0, 0, 1), .01, .4, .2, 20);
    var piano = new Material( Color(0, 0, 0, 1), 1,  0,  0, 20, "insidepiano3.png" );
    var blackHole = new Material( Color( 0, 0, 0, 1 ), 1,  0,  0, 20, "blackholevig.png" );
    var keyboardWidth = this.m_keyboard.width;
    
//    //turns down user inputted midi as piano is falling
//    var vol = Math.round ( 127*Math.exp(-dropPiano*(t-dropStartTime)) );
//    MIDI.setVolume(0, vol);
    
    if (pianoFalling == 1)
        sceneFallingPiano(this, model_transform);
    
//    if (playPiano == 1)
//        scenePlay(this, model_transform);
    
    if (pianoDemo == 1)
        sceneDemo(this, model_transform);
    
    function sceneFallingPiano(self, model_transform) {
        
        var time = t/2;
        
        //go to title scene if time > 8
        if (time > 8)
            sceneTitle(self, model_transform);
        
        //else play intro scene
        else {
            
            //set up motion equations
            var a = 99.8;
            var vi = 100;
            var xi = 300;
            var x = -0.5*a*Math.pow(time, 2) + vi*time + xi;
            var xs = xi - 500;
            var ts = ( vi + Math.sqrt(Math.pow(vi,2) - 2*a*(xs-xi)) ) / a;

            //set up other parameters
            var model = model_transform;
            var stack = [];
            var pianoModel = mat4();

            //draw black hole
            drawBlackHole(self, model);

            //draw piano
            pianoModel = mult( model, translation( 0, 0, x));
            pianoModel = mult( pianoModel, scale( 50, 50, 50) );
            drawPiano(self, pianoModel);

            //set camera
            var origin = vec3( pianoModel[0][3], pianoModel[1][3], pianoModel[2][3] );
            var camPos = vec3();
            var up = vec3();

            if (time < ts) {
                up = vec3(0,0,1);
                camPos = vec3( model[0][3]+300, model[1][3]+300, model[2][3]+300 );
            }

            else {
                up = vec3(0,1,0);
                camPos = vec3( model[0][3]+200, model[1][3], model[2][3]+100 );
            }

            if (!looking)
                self.graphicsState.camera_transform = lookAt(camPos, origin, up);
        }
        
    }
    
    function sceneTitle(self, model_transform) {
        
        //set camera
        var eye = vec3(0,0,0);
        var camPos = vec3(0,0,10);
        var up = vec3(0,1,0);
        self.graphicsState.camera_transform = lookAt(camPos, eye, up);
        
        //set title page
        var model = model_transform;
        var title = new Material( Color( 0,0,0,1 ), 1,  0,  0, 20, "title2.png" );
        model = mult(model, translation(0,-1,0));
        model = mult(model, scale(-11,-11,1));
        self.m_cube.draw(state, model, title);
        
        
    }
    
    /*function scenePlay(self, model_transform) {
        
//        var model = mult(model_transform, translation(-10,-10,-20));
//        
//        var pianoModel;
//        
//        if (dropPiano)
//            pianoModel = dropPianoModel(self, model);
//        else
//            pianoModel = model;
//        
//        pianoModel = mult(pianoModel, scale(50,50,50));
//        drawPiano(self, pianoModel);
//        
//        drawBlackHole(self, model);
//        
//        //set camera
//        var origin = vec3( pianoModel[0][3], pianoModel[1][3], pianoModel[2][3] );
//        var up = vec3(0,1,0);
//        var camPos = vec3( model[0][3], model[1][3], model[2][3]+50 );
//        
//        if (!looking)
//            self.graphicsState.camera_transform = lookAt(camPos, origin, up);
        
    }*/
    
    function sceneDemo(self, model_transform) {
        
        var model = mult(model_transform, translation(-8,-5,-20));

        MIDI.Player.addListener(function(data) {
            
            var note = data.note;
            var message = data.message;
            var key = note-20;
            var noteOn = 144;
            var noteOff = 128;
            
            if (message == noteOn)
                self.m_keyboard.pressKey(key);
            
            else if (message == noteOff)
                self.m_keyboard.releaseKey(key);
            
        })
        
//        //load next song if song ends
//        console.log("CUR" + MIDI.Player.currentTime);
//        console.log("END" + MIDI.Player.endTime);
//        if (MIDI.Player.currentTime == MIDI.Player.endTime) {
//            console.log("HELLO");
//            MIDI.Player.stop();
//            if (songIdx == song.length-1)
//                songIdx = 0;
//            else
//                songIdx += 1;
//            MIDI.Player.loadFile(song[songIdx], MIDI.Player.start);
//        }
        
        var pianoModel;
        
        if (dropPiano)
            pianoModel = dropPianoModel(self, model);
        else
            pianoModel = model;
            
        
        pianoModel = mult(pianoModel, scale(30,30,30));
        drawPiano(self, pianoModel);
        
        drawBlackHole(self, model);
        
        //set camera
        var origin = vec3( pianoModel[0][3]+10, pianoModel[1][3], pianoModel[2][3] );
        var up = vec3(0,1,0);
        var camPos = vec3( model[0][3]+10, model[1][3]-15, model[2][3]+30 );
        
        if (!looking)
            self.graphicsState.camera_transform = lookAt(camPos, origin, up);
        
    }
    
    function drawPiano(self, model) {
        
        var m = model;
        //m = mult(m, translation(-keyboardWidth/30, -keyboardWidth/30, 0));
        self.m_keyboard.draw(self.m_cube, state, m);
        m = mult( m, scale( keyboardWidth, keyboardWidth, keyboardWidth ) );
        self.m_insidepiano.draw(state, m, piano);
        self.m_piano.draw(state, m, black);
        
    }
    
    function drawBlackHole(self, model) {
        
        var bhModel = mult(model, translation(0,0,-500));
        bhModel = mult(bhModel, rotation(90,1,0,0));
        bhModel = mult(bhModel, scale(40,40,40))
        self.m_blackhole.draw(state, bhModel, blackHole);
        
    }
    
    function dropPianoModel(self, model) {
        
        //set up motion equations
        var time = (t-dropStartTime)/2;
        var a = 99.8;
        var vi = 0;
        var xi = 0;
        var x = -0.5*a*Math.pow(time, 2) + vi*time + xi;
        
        var m = model;
        m = mult(m, translation(10,10,x));
        //m = mult(m, scale(t/dropStartTime,1,1));
        m = mult(m, rotation(2000*time,0,0,1));
        m = mult(m, translation(-10,-10,0));
        
        return m;
        
    }
    
	}	