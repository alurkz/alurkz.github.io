// *******************************************************
// The UCLA Shapes library - An attempt to generate the largest diversity of primitive 3D shapes using the smallest amount of code.   
// CS 174a Graphics Example Code (Javascript or C++ versions)

// Custom_Shapes.js - Defines a number of objects that inherit from class Shape.  All Shapes have certain arrays.  Each array manages either the Shape's 3D vertex 
// positions, vertex normal vectors, 2D texture coordinates, and any other per-vertex quantity.  All subclasses of Shape inherit all these arrays.  
// Upon instantiation, any Shape subclass populates these lists in their own way, and then automatically makes GL calls -- special kernel
// functions to copy each of the lists one-to-one into new buffers in the graphics card's memory.


// *********** TUTORIAL SHAPES ***********
//
// These stand alone; other code won't break if you change them.  Mimic these when making your own Shapes.  You'll have an easier time than managing GL vertex arrays yourself.
//  - Triangle   
//  - Square   
//  - Tetrahedron    
//  - Windmill
//  - Load shape from .obj file

// *** PIANO *** //

Make_Shape_Subclass( "Piano", Shape);
    Piano.prototype.populate = function()
    {
        //define piano parameters
        var W = 1;
        var w = 5.1/7*W;
        var t = 0.1/7*W;
        var l = 4/7*W;
        var l2 = 0.95*l;
        var l3 = l2-0.5*(W-w);
        var l4 = l2-W+w; 
        var h = 0.5/7*W;
        
        //parameters for circle parts of piano
        var circSample = 30; //sets up how many samples are used for circles
        var xCirc, yCirc, r, dx, dy;
        
        /*OUTER SHELL*/
        
        for (var z = 0; z < 2; z++) {
            
            start = this.positions.length;
            
            for (var i = h; i >= 0; i-=h) {

                /*LEFT SIDE*/

                this.positions.push(vec3(0+z*t,0+z*t,i), vec3(0+z*t,l,i));
                this.normals.push(vec3(z*2-1,0,0),vec3(z*2-1,0,0));
                this.texture_coords.push(vec2((0+z*t)/W,z*t/(l+0.5*w)), vec2(0+z*t,l/(l+0.5*w)));

                /*BACK END*/

                for (var j = 1; j < circSample; j++) {

                    xRotComp = Math.cos(j*Math.PI/circSample);
                    yRotComp = Math.sin(j*Math.PI/circSample);

                    r = 0.5*w;
                    dx = t*xRotComp;
                    dy = t*yRotComp;
                    xCirc = r*(1 - xRotComp) + dx*z;
                    yCirc = l + r*yRotComp - dy*z;

                    this.positions.push(vec3(xCirc, yCirc, i));
                    this.normals.push(vec3(xRotComp*(z*2-1), yRotComp*(1-z*2), 0));
                    this.texture_coords.push(vec2(xCirc/W, yCirc/(l+0.5*w)));
                }

                /*RIGHT SIDE*/

                this.positions.push(vec3(w-z*t,l,i), vec3(w-z*t,l2,i));
                this.normals.push(vec3(1-2*z,0,0), vec3(1-2*z,0,0));
                this.texture_coords.push(vec2((w-z*t)/W,l/(l+0.5*w)), vec2((w-z*t)/W,l2/(l+0.5*w)));

                //inner curve
                for (j = 0; j <= circSample; j++) {

                    xRotComp = Math.cos(j*Math.PI/2/circSample);
                    yRotComp = Math.sin(j*Math.PI/2/circSample);

                    r = 0.5*(W-w);
                    dx = t*xRotComp;
                    dy = t*yRotComp;
                    xCirc = r*(1-xRotComp) + w - z*dx;
                    yCirc = l2 - r*yRotComp - z*dy;

                    this.positions.push(vec3(xCirc, yCirc, i));
                    this.normals.push(vec3(xRotComp*(1-2*z), yRotComp*(1-2*z), 0));
                    this.texture_coords.push(vec2(xCirc/W, yCirc/(l+0.5*w)));
                }

                //outer curve
                for (j = 0; j <= circSample; j++) {

                    xRotComp = Math.sin(j*Math.PI/2/circSample);
                    yRotComp = Math.cos(j*Math.PI/2/circSample);

                    r = 0.5*(W-w);
                    dx = t*xRotComp;
                    dy = t*yRotComp
                    xCirc = r*xRotComp + 0.5*(w+W) - z*dx;
                    yCirc = (l3-0.5*(W-w)) + 0.5*(W-w)*yRotComp - z*dy;


                    this.positions.push(vec3(xCirc, yCirc, i));
                    this.normals.push(vec3(xRotComp*(1-2*z), yRotComp*(1-2*z), 0));
                    this.texture_coords.push(vec2(xCirc/W, yCirc/(l+0.5*w)));
                }

                this.positions.push(vec3(W-z*t,l3-0.5*(W-w),i), vec3(W-z*t,0+z*t,i));
                this.normals.push(vec3(1-2*z,0,0), vec3(1-2*z,0,0));
                this.texture_coords.push(vec2((W-z*t)/W,(l3-0.5*(W-w))/(l+0.5*w)), vec2((W-z*t)/W,(0+z*t)/(l+0.5*w)));   

                /*FRONT SIDE*/

                this.positions.push(vec3(W-z*t,0+z*t,i), vec3(0+z*t,0+z*t,i));
                this.normals.push(vec3(0,-1+2*z,0),vec3(0,-1+2*z,0));
                this.texture_coords.push(vec2((w-z*t)/W,z*t/(l+0.5*w)), vec2(z*t/W,z*t/(l+0.5*w)));
                
            }
        
        }
        
        //group indices
        var c = 0.50*this.positions.length;
        var k = 0.25*this.positions.length;
        for (i = 0; i < this.positions.length - c - k -1; i++) {
            
            this.indices.push(i, i+k, i+k+1);
            this.indices.push(i, i+1, i+k+1);
            
            this.indices.push(i+c, i+c+k, i+c+k+1);
            this.indices.push(i+c, i+c+1, i+c+k+1);
            
            this.indices.push(i, i+c, i+c+1);
            this.indices.push(i, i+1, i+c+1);
            
        }
        
        /*BOTTOM FACE*/
        
        i = this.positions.length;
        this.positions.push(vec3(0,0,0));
        this.normals.push(vec3(0,0,-1))
        this.texture_coords.push(vec2(0,0));
        
        //back end
        for (j = 0; j <= circSample; j++) {
                
            xRotComp = Math.cos(j*Math.PI/circSample);
            yRotComp = Math.sin(j*Math.PI/circSample);

            xCirc = 0.5*w*(1-xRotComp);
            yCirc = l + 0.5*w*yRotComp;

            this.positions.push(vec3(xCirc, yCirc, 0));
            this.normals.push(vec3(0, 0, -1));
            this.texture_coords.push(vec2(xCirc/W, yCirc/(l+0.5*w)));
        }
        
        //inner curve
        for (j = 0; j <= circSample; j++) {

            xRotComp = Math.cos(j*Math.PI/2/circSample);
            yRotComp = Math.sin(j*Math.PI/2/circSample);

            xCirc = 0.5*(W-w)*(1-xRotComp) + w;
            yCirc = 0.5*(W-w)*(1-yRotComp) + l3;

            this.positions.push(vec3(xCirc, yCirc, 0));
            this.normals.push(vec3(0,0,-1));
            this.texture_coords.push(vec2(xCirc/W, yCirc/(l+0.5*w)));
        }

        //outer curve
        for (j = 0; j <= circSample; j++) {

            xRotComp = Math.sin(j*Math.PI/2/circSample);
            yRotComp = Math.cos(j*Math.PI/2/circSample);

            xCirc = 0.5*(W-w)*xRotComp + 0.5*(w+W);
            yCirc = (l3-0.5*(W-w)) + 0.5*(W-w)*yRotComp;

            this.positions.push(vec3(xCirc, yCirc, 0));
            this.normals.push(vec3(0,0,-1));
            this.texture_coords.push(vec2(xCirc/W, yCirc/(l+0.5*w)));
        }
        
        this.positions.push(vec3(W,0,0));
        this.normals.push(vec3(0,0,-1));
        this.texture_coords.push(vec2(1,0));
        
        cpos = i; //set up anchor point
        for (i; i < this.positions.length - 2; i++)
            this.indices.push(cpos, i+1, i+2);
        
    }
    
Make_Shape_Subclass( "InsidePiano", Shape)
    InsidePiano.prototype.populate = function()
    {
        //define piano parameters
        var W = 1;
        var w = 5.1/7*W;
        var t = 0.1/7*W;
        var l = 4/7*W;
        var l2 = 0.95*l;
        var l3 = l2-0.5*(W-w); //0.5(W-w) = l2-l3 constraint must be maintained for correct geometry
        var l4 = l2-W+w; 
        var h = 0.25/7*W;
        var xNorm = W - 2*t;
        var yNorm = l + 0.5*w - 2*t;
        
        //parameters for circle parts of piano
        var circSample = 30; //sets up how many samples are used for circles
        var xCirc, yCirc, r, dx, dy; //
        
        /*BOTTOM FACE*/
        
        i = this.positions.length;
        this.positions.push(vec3(t,t,h));
        this.normals.push(vec3(0,0,1))
        this.texture_coords.push(vec2(0,0));
        
        //back end
        for (j = 0; j <= circSample; j++) {
                
            xRotComp = Math.cos(j*Math.PI/circSample);
            yRotComp = Math.sin(j*Math.PI/circSample);

            r = 0.5*w;
            dx = t*xRotComp;
            dy = t*yRotComp;
            xCirc = r*(1 - xRotComp) + dx;
            yCirc = l + r*yRotComp - dy;

            this.positions.push(vec3(xCirc, yCirc, h));
            this.normals.push(vec3(0, 0, 1));
            this.texture_coords.push(vec2((xCirc-t)/xNorm, (yCirc-t)/yNorm));
        }
        
        //inner curve
        for (j = 0; j <= circSample; j++) {

            xRotComp = Math.cos(j*Math.PI/2/circSample);
            yRotComp = Math.sin(j*Math.PI/2/circSample);

            r = 0.5*(W-w);
            dx = t*xRotComp;
            dy = t*yRotComp;
            xCirc = r*(1-xRotComp) + w - dx;
            yCirc = l2 - r*yRotComp - dy;

            this.positions.push(vec3(xCirc, yCirc, h));
            this.normals.push(vec3(0,0,1));
            this.texture_coords.push(vec2((xCirc-t)/xNorm, (yCirc-t)/yNorm));
        }

        //outer curve
        for (j = 0; j <= circSample; j++) {

            xRotComp = Math.sin(j*Math.PI/2/circSample);
            yRotComp = Math.cos(j*Math.PI/2/circSample);

            r = 0.5*(W-w);
            dx = t*xRotComp;
            dy = t*yRotComp
            xCirc = r*xRotComp + 0.5*(w+W) - dx;
            yCirc = (l3-0.5*(W-w)) + 0.5*(W-w)*yRotComp - dy;

            this.positions.push(vec3(xCirc, yCirc, h));
            this.normals.push(vec3(0,0,1));
            this.texture_coords.push(vec2((xCirc-t)/xNorm, (yCirc-t)/yNorm));
        }
        
        this.positions.push(vec3(W-t,t,h));
        this.normals.push(vec3(0,0,1));
        this.texture_coords.push(vec2(1,0));
        
        cpos = i; //set up anchor point
        for (i; i < this.positions.length - 2; i++)
            this.indices.push(cpos, i+1, i+2);
        
        
    }
    
// *** BLACK HOLE *** //
    
Make_Shape_Subclass( "BlackHole", Shape);
    BlackHole.prototype.populate = function()
    {
        /* NORMAL DISTRIBUTION FUNCTION IMPLEMENTATION */
            
            var sig = 1.5;
            var pi = Math.PI;
            var samples = 200;
            var angle = 2*Math.PI/samples; // angle per sample
            var d = 1/Math.sqrt(sig*pi); // depth
            var dy = d / samples;
            var w = 2*Math.sqrt(-sig*Math.log(1/samples)); // width
            var t = w; //outer ring radius
            var r, x, y, z, arg;
            
            for (var i = 1; i < samples; i++) {

                y = dy*i;
                arg = -sig*Math.log(Math.sqrt(1/d)*y);
                

                for (var j = 0; j < samples; j++) {

                    r = Math.sqrt(arg);
                    x = r*Math.cos(j*angle);
                    z = -r*Math.sin(j*angle);

                    this.positions.push(vec3(x,-20*y,z));
                    this.normals.push(vec3(x/r,0,z/r));
                    this.texture_coords.push(vec2(0.5*x/t+0.5, -0.5*z/t+0.5));

                }
            }
        
        // defining points for flat face
        var cur = this.positions.length;
        for (var i = 0; i <= samples; i++) {

            arg = -sig*Math.log(Math.sqrt(1/d)*dy);
            r = Math.sqrt(arg) + i*(t-Math.sqrt(arg))/samples;

            for (var j = 0; j <= samples; j++) {

                x = r*Math.cos(j*angle);
                z = -r*Math.sin(j*angle);

                this.positions.push(vec3(x,-20*dy,z));
                this.normals.push(vec3(0,1,0));
                this.texture_coords.push(vec2(0.5*x/t+0.5, -0.5*z/t+0.5));

            }
        }
        
        //group indices
        var len = this.positions.length;
        for (i = 0; i < len-samples-2; i++) {
            
            this.indices.push( i, i+1, i+samples+2);
            this.indices.push( i, i+samples+1, i+samples+2);
            
        }
            
/* PARABOLIC IMPLEMENTATION */
        
//            var d = 200; // depth of black hole
//            var a = Math.sqrt(20); // width of black hole
//            var samples = 100; // no of samples per circle
//            var dy = d/samples;
//            var angle = 2*Math.PI/samples; // angle per sample
//            var r, x, y, z, pos;
//            var t = 30;
//
//            // defining points for main trench
//            for (var i = 0; i <= samples; i++) {
//
//                y = -dy*i;
//
//                for (var j = 0; j <= samples; j++) {
//
//                    r = Math.pow(a*a/d*(y + d), 0.5);
//                    x = r*Math.cos(j*angle);
//                    z = -r*Math.sin(j*angle);
//
//                    this.positions.push(vec3(x,y,z));
//                    this.normals.push(vec3(x/r,0,z/r));
//                    this.texture_coords.push(vec2(x/t+0.5, -z/t+0.5));
//
//                }
//            }
//
//            // defining points for flat face
//            var cur = this.positions.length;
//            for (var i = 0; i <= samples; i++) {
//
//                r = a + i*(t-a)/samples;
//
//                for (var j = 0; j <= samples; j++) {
//
//                    x = r*Math.cos(j*angle);
//                    z = -r*Math.sin(j*angle);
//
//                    this.positions.push(vec3(x,0,z));
//                    this.normals.push(vec3(0,1,0));
//                    this.texture_coords.push(vec2(0.5*x/t+0.5, -0.5*z/t+0.5));
//
//                }
//            }
//        }
        
//        //group indices
//        var len = this.positions.length;
//        for (i = 0; i < len-samples-2; i++) {
//            
//            this.indices.push( i, i+1, i+samples+2);
//            this.indices.push( i, i+samples+1, i+samples+2);
//            
//        }
        
    }

// *********** TRIANGLE ***********
// First, the simplest possible Shape – one triangle.  It has 3 vertices, each having their own 3D position, normal vector, and texture-space coordinate.

Make_Shape_Subclass( "Triangle", Shape );
    Triangle.prototype.populate = function()
    {
       this.positions     .push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0) );   // Specify the 3 vertices -- the point cloud that our Triangle needs.
       this.normals       .push( vec3(0,0,1), vec3(0,0,1), vec3(0,0,1) );   // ...
       this.texture_coords.push( vec2(0,0),   vec2(0,1),   vec2(1,0)   );   // ...
       this.indices       .push( 0, 1, 2 );                                 // Index into our vertices to connect them into a whole Triangle.
    };
    
    
// *********** SQUARE ***********
// A square, demonstrating shared vertices.  On any planar surface, the interior edges don't make any important seams.  In these cases there's no reason not 
// to re-use values of the common vertices between triangles.  This makes all the vertex arrays (position, normals, etc) smaller and more cache friendly.
  
Make_Shape_Subclass( "Square", Shape );
    Square.prototype.populate = function()
    {
       this.positions     .push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0), vec3(1,1,0) ); // Specify the 4 vertices -- the point cloud that our Square needs.
       this.normals       .push( vec3(0,0,1), vec3(0,0,1), vec3(0,0,1), vec3(0,0,1) ); // ...
       this.texture_coords.push( vec2(0,0),   vec2(0,1),   vec2(1,0),   vec2(1,1)   ); // ...
       this.indices       .push( 0, 1, 2,     1, 3, 2 );                               // Two triangles this time, indexing into four distinct vertices.
    };
    

// *********** TETRAHEDRON *********** 
// A demo of flat vs smooth shading.  Also our first 3D, non-planar shape.

Make_Shape_Subclass( "Tetrahedron", Shape );
  Tetrahedron.prototype.populate = function( using_flat_shading )   // Takes a boolean argument 
  {  
    var a = 1/Math.sqrt(3);   
    
    if( !using_flat_shading )
    {
      // Method 1:  A tetrahedron with shared vertices.  Compact, performs better, but can't produce flat shading or discontinuous seams in textures.
        this.positions     .push( vec3(0,0,0),    vec3(0,1,0), vec3(1,0,0), vec3(0,0,1) );
        this.normals       .push( vec3(-a,-a,-a), vec3(0,1,0), vec3(1,0,0), vec3(0,0,1) );
        this.texture_coords.push( vec2(0,0),      vec2(0,1),   vec2(1,0),   vec2(1,1)   );
        this.indices.push( 0, 1, 2,   0, 1, 3,   0, 2, 3,    1, 2, 3 );          // Vertices are shared multiple times with this method.
    }   
    else
    {
      // Method 2:  A tetrahedron with four independent triangles.  
        this.positions.push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0) );
        this.positions.push( vec3(0,0,0), vec3(0,1,0), vec3(0,0,1) );
        this.positions.push( vec3(0,0,0), vec3(1,0,0), vec3(0,0,1) );
        this.positions.push( vec3(0,0,1), vec3(0,1,0), vec3(1,0,0) );

        this.normals.push( vec3(0,0,1), vec3(0,0,1), vec3(0,0,1) );       // Method 2 is flat shaded, since each triangle has its own normal.
        this.normals.push( vec3(1,0,0), vec3(1,0,0), vec3(1,0,0) );
        this.normals.push( vec3(0,1,0), vec3(0,1,0), vec3(0,1,0) );
        this.normals.push( vec3(a,a,a), vec3(a,a,a), vec3(a,a,a) );
    
      // Each face in Method 2 also gets its own set of texture coords (half the image is mapped onto each face).  We couldn't do
      // this with shared vertices -- after all, it involves different results when approaching the same point from different directions.
        this.texture_coords.push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0) );
        this.texture_coords.push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0) );
        this.texture_coords.push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0) );
        this.texture_coords.push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0) );
        
        this.indices.push( 0, 1, 2,    3, 4, 5,    6, 7, 8,    9, 10, 11 );      // Notice all vertices are unique this time.
    }
  };    
  

// *********** WINDMILL *********** 
// As our shapes get more complicated, we begin using matrices and flow control (including loops) to generate nontrivial point clouds and connect them.

Make_Shape_Subclass( "Windmill", Shape );
    Windmill.prototype.populate = function( reserved_parameter, num_blades )
    {
        for( var i = 0; i < num_blades; i++ )     // A loop to automatically generate the triangles.
        {
            var spin = rotation( i * 360/num_blades, 0, 1, 0 );             // Rotate around a few degrees in XZ plane to place each new point.
            var newPoint = mult_vec( spin, vec4( 1, 0, 0, 1 ) );            // Apply that XZ rotation matrix to point (1,0,0) of the base triangle.
            this.positions.push( vec3( newPoint[0], 0, newPoint[2] ) );     // Store this XZ position.  This is point 1.
            this.positions.push( vec3( newPoint[0], 1, newPoint[2] ) );     // Store it again but with higher y coord:  This is point 2.
            this.positions.push( vec3( 0, 0, 0 ) );                         // All triangles touch this location.  This is point 3.
            
            var newNormal = mult_vec( spin, vec3( 0, 0, 1 ) );              // Rotate our base triangle's normal (0,0,1) to get the new one.  Careful! 
            this.normals.push( vec3( newNormal ) );                         // Normal vectors are not points; their perpendicularity constraint gives them 
            this.normals.push( vec3( newNormal ) );                         // a mathematical quirk that when applying matrices you have to apply the 
            this.normals.push( vec3( newNormal ) );                         // transposed inverse of that matrix instead.  But right now we've got a pure 
                                                                            // rotation matrix, where the inverse and transpose operations cancel out.
            this.texture_coords.push( vec2( 0, 0 ) );                       
            this.texture_coords.push( vec2( 0, 1 ) );                       // Repeat the same arbitrary texture coords for each fan blade.
            this.texture_coords.push( vec2( 1, 0 ) );                       
            this.indices.push ( 3 * i );     this.indices.push ( 3 * i + 1 );        this.indices.push ( 3 * i + 2 ); // Procedurally connect the new
        }                                                                                                             // vertices into triangles.
    };
    
    
// *********** SHAPE FROM FILE ***********
// Finally, here's a versatile standalone shape that imports all its arrays' data from an .obj file.  See webgl-obj-loader.js for the rest of the relevant code.

function Shape_From_File( filename, points_transform )		
	{
		Shape.call(this);
			
		this.draw = function( graphicsState, model_transform, material ) 	{
		 	if( this.ready ) Shape.prototype.draw.call(this, graphicsState, model_transform, material );		}	
		
		this.filename = filename;     this.points_transform = points_transform;

		this.webGLStart = function(meshes)
			{
				for( var j = 0; j < meshes.mesh.vertices.length/3; j++ )
				{
					this.positions.push( vec3( meshes.mesh.vertices[ 3*j ], meshes.mesh.vertices[ 3*j + 1 ], meshes.mesh.vertices[ 3*j + 2 ] ) );
          
					this.normals.push( vec3( meshes.mesh.vertexNormals[ 3*j ], meshes.mesh.vertexNormals[ 3*j + 1 ], meshes.mesh.vertexNormals[ 3*j + 2 ] ) );
					this.texture_coords.push( vec2( meshes.mesh.textures[ 2*j ],meshes.mesh.textures[ 2*j + 1 ]  ));
				}
				this.indices  = meshes.mesh.indices;	  
        
        for( var i = 0; i < this.positions.length; i++ )                         // Apply points_transform to all points added during this call
        { this.positions[i] = vec3( mult_vec( this.points_transform, vec4( this.positions[ i ], 1 ) ) );    
          this.normals[i]  = vec3( mult_vec( transpose( inverse( this.points_transform ) ), vec4( this.normals[ i ], 1 ) ) );     }
          
				this.init_buffers();
				this.ready = true;
			}                                                 // Begin downloading the mesh, and once it completes return control to our webGLStart function
		OBJ.downloadMeshes( { 'mesh' : filename }, (function(self) { return self.webGLStart.bind(self) }(this) ) );
	}
inherit( Shape_From_File, Shape );
