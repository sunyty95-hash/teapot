var canvas;
var gl;

var program;
var vertexShader, fragmentShader;

var delay = 200;

var NumTeapotIndices = teapot_indices.length;

var camera_position = vec3(0., 100., 100.);
var up_position = vec3(camera_position[0], camera_position[1] + 1, camera_position[2]);
var look_at = vec3(0.,0.,0.);

var cube_verts  = []; 
var cube_vert_cols = [];
var cube_element_indices = [];

var vBuffer, cBuffer, iBuffer;
var vColor, vPosition;

var M_model_loc;
var M_Camera_loc;
var M_Persp_loc;

var M_model = mat4();
var M_Camera = mat4();
var M_Persp = mat4();

var rotateMat = mat4();

var maxX, minX, maxY, minY, maxZ, minZ;
var teapotCenter;


var window_width, window_height, near, far;

var rotate_X = 0;
var rotate_Y = 0
var rotate_Z = 0;

var rotate_X_before;
var rotate_Y_before;
var rotate_Z_before;

var near = 6.;
var far = 300.;
var width = 5.;
var height = 5.;

// all initializations
window.onload = function init() {
	// get canvas handle
	canvas = document.getElementById( "gl-canvas" );

	// WebGL Initialization
	gl = initWebGL(canvas);
	if (!gl ) {
		alert( "WebGL isn't available" );
	}

	// set up viewport
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.8, 0.8, 0.0, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT );

	// create shaders, compile and link program
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// create the colored teapot
	createColorTeapot();

    // buffers to hold teapot vertices, colors and indices
	vBuffer = gl.createBuffer();
	cBuffer = gl.createBuffer();
	iBuffer = gl.createBuffer();

	// allocate and send vertices to buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(teapot_vertices), gl.STATIC_DRAW);

    // variables through which shader receives vertex and other attributes
	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );	

	// similarly for color buffer
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(teapot_vert_cols), gl.STATIC_DRAW );

	vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vColor );

	// index buffer 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(teapot_indices),
								 gl.STATIC_DRAW);

	M_model_loc = gl.getUniformLocation(program, "M_model");
    M_Camera_loc = gl.getUniformLocation(program, "M_Camera");
    M_Persp_loc = gl.getUniformLocation(program, "M_Persp");

	// must enable Depth test for 3D viewing in GL
	gl.enable(gl.DEPTH_TEST);

    teapotCenter = negate(getTeapotCenter());
    
    // Rotate X 
    document.getElementById("x-rotate").addEventListener("input", function(event){
        rotate_X_before = rotate_X;
        rotate_X = event.target.value;
        console.log(`X Rotate: ${rotate_X}`);
        cumulative_rotate('x');
        gl.uniformMatrix4fv(M_model_loc, false, flatten(M_model));
        render();
    });

    // Rotate Y
    document.getElementById("y-rotate").addEventListener("input", function(event){
        rotate_Y_before = rotate_Y;
        rotate_Y = event.target.value;
        console.log(`Y Rotate: ${rotate_Y}`);
        cumulative_rotate('y');
        gl.uniformMatrix4fv(M_model_loc, false, flatten(M_model));
        render();
    });

    // Rotate Z
    document.getElementById("z-rotate").addEventListener("input", function(event){
        rotate_Z_before = rotate_Z;
        rotate_Z = event.target.value;
        console.log(`Z Rotate: ${rotate_Z}`);
        cumulative_rotate('z');
        gl.uniformMatrix4fv(M_model_loc, false, flatten(M_model));
        render();
    });

    // Change width
    document.getElementById("window_width").addEventListener("input", function(event){
        width = event.target.value;
        console.log(`Width: ${width}`);
        perspectiveMat();
        gl.uniformMatrix4fv(M_Persp_loc, false, flatten(M_Persp));
        render();
    });

    // Change height
    document.getElementById("window_height").addEventListener("input", function(event){
        height = event.target.value;
        console.log(`Height: ${height}`);
        perspectiveMat();
        gl.uniformMatrix4fv(M_Persp_loc, false, flatten(M_Persp));
        render();
    });

    // Change far
    document.getElementById("far").addEventListener("input", function(event){
        far = event.target.value;
        console.log(`Far: ${far}`);
        perspectiveMat();
        gl.uniformMatrix4fv(M_model_loc, false, flatten(M_model));
        gl.uniformMatrix4fv(M_Camera_loc, false, flatten(M_Camera));
        gl.uniformMatrix4fv(M_Persp_loc, false, flatten(M_Persp));
        render();
    });

    // Near Plane
    document.getElementById("near").addEventListener("input", function(event){
        near = event.target.value;

        console.log(`near: ${near}`);
        perspectiveMat();
        gl.uniformMatrix4fv(M_Persp_loc, false, flatten(M_Persp));
        render();
    });

    modelMat();
    cameraMat();
    perspectiveMat();
    
    gl.uniformMatrix4fv(M_model_loc, false, flatten(M_model));
    gl.uniformMatrix4fv(M_Camera_loc, false, flatten(M_Camera));
    gl.uniformMatrix4fv(M_Persp_loc, false, flatten(M_Persp));
    render();
}

// Render function
function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES, NumTeapotIndices, gl.UNSIGNED_SHORT, 0);

	setTimeout(
      function (){requestAnimFrame(render);}, delay
 	);
}

// Gets teapot indices, color, and vertices
function createColorTeapot() {
	teapot_vertices;
	teapot_vert_cols = getTeapotVertexColors();
	teapot_indices;
    //console.log("Teapot Indices: ")
    //console.log(NumTeapotIndices);
    //console.log("Teapot Vertices:");
    //console.log(teapot_vertices.length);
}

// Get teapot color
function getTeapotVertexColors() {
	let cols = [];
	for (let k = 0; k < teapot_vertices.length; k++)
		cols.push (Math.random(), Math.random(), Math.random(), 1.);

	return cols;
}

// Get Teapot Center
function getTeapotCenter(){
    let xValues = teapot_vertices.map(point => point[0]);
    let yValues = teapot_vertices.map(point => point[1]);
    let zValues = teapot_vertices.map(point => point[2]);

    maxX = Math.max(...xValues);
    minX = Math.min(...xValues);
    maxY = Math.max(...yValues);
    minY = Math.min(...yValues);
    maxZ = Math.max(...zValues);
    minZ = Math.min(...zValues);

    //console.log(`X: ${maxX} ${minX}`)
    //console.log(`Y: ${maxY} ${minY}`)
    //console.log(`Z: ${maxZ} ${minZ}`)

    let midX = (maxX + minX) / 2;
    let midY = (maxY + minY) / 2;
    let midZ = (maxZ + minZ) / 2;

    //console.log(`X Mid: ${midX} `)
    //console.log(`Y Mid: ${midY} `)
    //console.log(`Z Mid: ${midZ} `)

    return vec3(midX , midY, midZ)
}

// Get Camera Matrix
function cameraMat(){
    /*
    console.log("look at");
    console.log(look_at);
    console.log("cam position");
    console.log(camera_position);
    console.log("up position");
    console.log(up_position);
    */

    let look_at_direction = getVector(look_at, camera_position);
    let up_direction = getVector(up_position,camera_position);

    //console.log("look at direction");
    //console.log(look_at_direction);
    //console.log("up direction");
    //console.log(up_direction);
    

    look_at_direction = normalize(look_at_direction);
    up_direction = normalize(up_direction);

    
    //console.log("look at direction normal");
    //console.log(look_at_direction);
    //console.log("up direction normal");
    //console.log(up_direction);
    

    let U = (cross_product(look_at_direction,up_direction));
    let V = (cross_product(U,look_at_direction));
    let N = negate(look_at_direction);

    //console.log("U:");
    //console.log(U);
    //console.log("V:");
    //console.log(V);
    //console.log("N:");
    //console.log(N);

    M_Camera = mat4();

    M_Camera[0][0] = U[0];
    M_Camera[0][1] = U[1];
    M_Camera[0][2] = U[2];

    M_Camera[1][0] = V[0];
    M_Camera[1][1] = V[1];
    M_Camera[1][2] = V[2];

    M_Camera[2][0] = N[0];
    M_Camera[2][1] = N[1];
    M_Camera[2][2] = N[2];


    M_Camera[0][3] = -(dot_product(U, camera_position));
    M_Camera[1][3] = -(dot_product(V, camera_position));
    M_Camera[2][3] = -(dot_product(N, camera_position));
    

    console.log(M_Camera);
}

// Get Model Matrix
function modelMat(){
    rotate_X = Number(rotate_X);
    rotate_Y = Number(rotate_Y);
    rotate_Z = Number(rotate_Z);

    rotateMat = matMult(rotate4x4(rotate_Z, 'z'), matMult(rotate4x4(rotate_Y, 'y'), rotate4x4(rotate_X, 'x')));

    M_model = matMult(rotateMat ,translate4x4(teapotCenter[0], teapotCenter[1], teapotCenter[2]));
}

// Sets perspective matrix in NDC
function perspectiveMat() {
    
    //let right = width / 2;
    //let top = height / 2;

    width = Number(width);
    height = Number(height);
    far = Number(far);
    near = Number(near);

    let right = width;
    let top = height;

    M_Persp = mat4();
    M_Persp[0][0] = near / right;  
    M_Persp[1][1] = near / top;     
    M_Persp[2][2] = -((far + near) / (far - near));  
    M_Persp[3][2] = -1;
    M_Persp[2][3] = (-2 * far * near) / (far - near); 
    M_Persp[3][3] = 0;
    
    console.log('persp');
    console.log(M_Persp);
}

// Get vector from two points
function getVector(u,v){
    let result = [];

    if (u.length != v.length){
        throw "getVector(): points are not of same dimension"
    }
    else{
        for(let i = 0; i<u.length ;i++ ){
            result[i] = u[i] - v[i];
        }
    }
    
    return vec3(result[0], result[1], result[2]);
}

// Cumulative rotation, rotating the axis does not rotate the other axis
function cumulative_rotate(axis){
    rotate_X = Number(rotate_X);
    rotate_Y = Number(rotate_Y);
    rotate_Z = Number(rotate_Z);

    rotate_X_before = Number(rotate_X_before);
    rotate_Y_before = Number(rotate_Y_before);
    rotate_Z_before = Number(rotate_Z_before);

    switch(axis){
        case 'z':
            let z_increment = rotate_Z - rotate_Z_before;
            console.log(`Z increment: ${z_increment}`);
            rotateMat = matMult(rotate4x4(z_increment, 'z'), rotateMat);
            M_model = matMult(rotateMat ,translate4x4(teapotCenter[0], teapotCenter[1], teapotCenter[2]));
            break;

        case 'y':
            let y_increment = rotate_Y - rotate_Y_before;
            console.log(`Y increment: ${y_increment}`);
            rotateMat = matMult(rotate4x4(y_increment, 'y'), rotateMat);
            M_model = matMult(rotateMat ,translate4x4(teapotCenter[0], teapotCenter[1], teapotCenter[2]));
            break;

        case 'x':
            let x_increment = rotate_X - rotate_X_before;
            console.log(`X increment: ${x_increment}`);
            rotateMat = matMult(rotate4x4(x_increment, 'x'), rotateMat);
            M_model = matMult(rotateMat ,translate4x4(teapotCenter[0], teapotCenter[1], teapotCenter[2]));
            break;
    }
}