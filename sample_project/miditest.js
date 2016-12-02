window.onload = function init() {	

    //loads MIDI soundbank and proceeds to run animation
    MIDI.loadPlugin({
        soundfontUrl: "../Common/MIDI.js-master/examples/soundfont/",
        instrument: "acoustic_grand_piano",
        onprogress: function(state, progress) {
            console.log(state, progress);
        },
        onsuccess: function() {
            MIDI.setVolume(0, 127);
            
             var song = 		['data:audio/mid;base64,TVRoZAAAAAYAAQABAMBNVHJrAAAAXwD/WAQEAhgIAP9RAwehIAD/AwlOZXcgVHJhY2sAwAAAkDxkgRCAPDAwkDxkgRCAPDAwkDxkAJBAZACQQ2QHkEhkgQmAPDAAgEAwAIBDMACASDAwkDxkgT+APDAm/y8A',"../Common/MIDI.js-master/build/129 Albanna Alex Due 5-2-2016 Rhythms.mid"];
            var player = MIDI.Player;
            player.timeWarp = 1; // speed the song is played back
            player.loadFile(song[1], player.start);
            player.addListener(function(data) {
                
                self.context = new GL_Context( "gl-canvas", Color( 0, 0, 0, 1 ) );    // Set your background color here
		//self.context.register_display_object( self );
                
                self.m_piano       = new Piano();
               self.m_keyboard    = new keyboard(); 
               self.m_cube        = new Cube();
               self.graphicsState = new GraphicsState( translation(0, 0,-25), perspective(45, canvas.width/canvas.height, .1, 1000), 0 );
		
    shaders = { "Default":     new Shader( "vertex-shader-id", "fragment-shader-id" ), 
                "Demo_Shader": new Shader( "vertex-shader-id", "demo-shader-id"     )  };
                
               
               var state = this.graphicsState;
               var t = this.graphicsState.animation_time/1000;
               var white = new Material( Color(1, 1, 1, 1), 1, 1, 1, 1);
               var black = new Material( Color(0, 0, 0, 1), .01, .4, .2, 20);
               //var piano = new Material( Color( .5,.5,.5,1 ), .5,  0.3,  0.3, 20, "insidepiano.png" );
               var keyboardWidth = this.m_keyboard.width;
                
               var model_transform = mat4();
               
                m_keyboard.pressKey(data.note);
                
                model_transform = mult(model_transform, translation(-10,-10,-20));
                model_transform = mult(model_transform, scale(50,50,50));
                this.m_keyboard.draw(this.m_cube, state, model_transform);
                model_transform = mult( model_transform, scale( keyboardWidth, keyboardWidth, keyboardWidth ) );
                this.m_piano.draw(state, model_transform, white);
                
                
                
                   
            
            })
                                    
            
           // var anim = new Animation();
        }
	});

}