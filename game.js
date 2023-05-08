
import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';



//Create scene
const scene = new THREE.Scene();

//create camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);

//Create render
const renderer = new THREE.WebGLRenderer();

				renderer.xr.enabled = true;


let environmentProxy = null;

//set render's size
renderer.setSize(window.innerWidth, innerHeight);





/********* Control VR **********/

document.body.appendChild(renderer.domElement);

document.body.appendChild( VRButton.createButton( renderer ) );

// controllers

const controller1 = renderer.xr.getController( 0 );
scene.add( controller1 );

const controller2 = renderer.xr.getController( 1 );
scene.add( controller2 );

const controllerModelFactory = new XRControllerModelFactory();
				const handModelFactory = new XRHandModelFactory();

				// Hand 1
				const controllerGrip1 = renderer.xr.getControllerGrip( 0 );
				controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
				scene.add( controllerGrip1 );

				const hand1 = renderer.xr.getHand( 0 );
				hand1.add( handModelFactory.createHandModel( hand1 ) );

				scene.add( hand1 );

				// Hand 2
				const controllerGrip2 = renderer.xr.getControllerGrip( 1 );
				controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
				scene.add( controllerGrip2 );

				const hand2 = renderer.xr.getHand( 1 );
				hand2.add( handModelFactory.createHandModel( hand2 ) );
				scene.add( hand2 );

//

const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

const line = new THREE.Line( geometry );
line.name = 'line';
line.scale.z = 5;

controller1.add( line.clone() );
controller2.add( line.clone() );

//

window.addEventListener( 'resize', onWindowResize );
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}
//
/******************* LIGHTS *************************/
let lightCount = 6;
let lightDistance = 3000;

let lights = [];

const lightValues = [
	{colour: 0x14D14A},
	{colour: 0xBE61CF},
	{colour: 0x00FFFF},
	{colour: 0x00FF00},
	{colour: 0x16A7F5},
	{colour: 0x90F615}
];

for (let i = 0; i < lightCount; i++){

	// Positions evenly in a circle pointed at the origin.   
	const light = new THREE.PointLight(0xffffff, 1);
	let lightX = lightDistance * Math.sin(Math.PI * 2 / lightCount * i);
	let lightZ = lightDistance * Math.cos(Math.PI * 2 / lightCount * i);

	// Create a light
	light.position.set(lightX, 0, lightZ)
	light.lookAt(0, 0, 0)
	scene.add(light);
	lights.push(light);

	// Visual helpers to indicate light positions   
	scene.add(new THREE.PointLightHelper(light, .5, /*0xff9900*/lightValues[i]['colour']));

}

/******************************************************* */


/******************* Loading Objects **********************/

//Create GLTLoader (.glb 3d objects loader)
const gltfLoader = new GLTFLoader();

//Load Museum
gltfLoader.load('../assets/glb/WholeMuseum.glb', (gltf) => {
	const root = gltf.scene; //get the scene of the museum from glb
	root.scale.set(0.2,0.2,0.2); // set the scale to 1,1,1
	scene.add(root); //add the museum to the main scene

	/*Still not sure about this xd */
	gltf.scene.traverse(function (child) {
		if ( child.isMesh ) {
			if (child.name.includes('main')){
				child.castShadow = true;
				child.receiveShadow = true;
			}else if (child.name.includes('Cube') ){
				//child.material.visible = false;
				environmentProxy = child;
			}}
	});
});

//Creates a variable to use as an Async function constructor
let AsyncFunction = Object.getPrototypeOf(async function(){}).constructor

//Creates the function to load the fragment asynchronously
let getobject = new AsyncFunction('a','b','return await Meteorito.loadFragment(a,b)');

let meterF;

let count = 0;

let load = false;

//Start the fragment load process
Meteorito.initializeEvents = function() {
	//Condition that reconognices the state of the page
	if(!load){
		//Gets the material of the fragment asynchronously
		let initObject = new AsyncFunction('a','return await Meteorito.initailize(a)');
			initObject(new MTLLoader()).then(materials => {
				//load the fragment while sending the materials and the OBJLoader
				getobject(new OBJLoader(), materials).then(object => {
					meterF = object;
					//adds the fragment to the scene || Still thinking "meterF" is unnecesary but it helps to avoid getting confused
					scene.add(meterF);
					load = true;
				});
			});
	

	}
}


Meteorito.initializeEvents();

/******************************************************/

// hashmap to keep movement
let movement = {moveForward: false, moveBackward: false, moveLeft: false, moveRight: false, moveUp: false, moveDown: false};


/*********** Reading keyboard and mouse *****************/

let isCursorLocked = false;

document.addEventListener('pointerlockchange', function() {
	if (document.pointerLockElement === null) {
		isCursorLocked = false;
	} else {
	isCursorLocked = true;
	}
  });

document.addEventListener('keydown', function(event){
	
	if (isCursorLocked) {
	Joystick.onKeyDown(event,movement);
	}
});
document.addEventListener('keyup', function(event){
	Joystick.onKeyUp(event,movement);
});
document.addEventListener('mousemove', function(event) {
	if (isCursorLocked) {
		Joystick.onDocumentMouseMove(event, camera, isCursorLocked);	
	}
});


/*********************************************** */

/* Creating keyboard movement */
Joystick.initializeEvents = function() {
	Joystick.initialize();

}
Joystick.initializeEvents();

/************************************************ */

camera.position.set( -3, 30, 150);

document.body.addEventListener('click', (event)=> {
	lockCursor(event);
});  


function lockCursor(event) {

		document.body.requestPointerLock();
	
} 
  
  // desbloquear el cursor
  function unlockCursor() {
	 // Libera el acceso al cursor del mouse
	 document.exitPointerLock();
  }



function animate() {

	renderer.setAnimationLoop( render );

}

function render() {
	spinFragment();
 if(!VR){
   Joystick.updatePosition(isCursorLocked, camera, movement);
}
	renderer.render( scene, camera );

}

function spinFragment() {
	if (load) {
		Meteorito.PfAutoRotate(meterF, count);
	}
}

animate();







/* todo este comentario está aquí porque lo hice desde el cel, perdón por el desorden, lo arreglo después 
†***********


import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import { VRButton } from 'three/addons/webxr/VRButton.js';



//Create scene
const scene = new THREE.Scene();

//Create render
const renderer = new THREE.WebGLRenderer();


//document.body.appendChild( VRButton.createButton( renderer ) );

const buttonVR = VRButton.createButton( renderer );

console.log(typeof buttonVR)

document.body.appendChild(buttonVR);


renderer.xr.enabled = false;



let environmentProxy = null;

//set render's size
renderer.setSize(window.innerWidth, innerHeight);

//create camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);


/********* Control VR *********

const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);
scene.add(controller1);
scene.add(controller2);

buttonVR.addEventListener('click', () => {

	if(renderer.xr.enabled){
		renderer.xr.enabled = false;
		renderer.setAnimationLoop(animate());
	} else {
		
		renderer.xr.enabled = true;
	}
  });

//add renderer
document.body.appendChild(renderer.domElement);

/******************* LIGHTS ************************
let lightCount = 6;
let lightDistance = 3000;

let lights = [];

const lightValues = [
	{colour: 0x14D14A},
	{colour: 0xBE61CF},
	{colour: 0x00FFFF},
	{colour: 0x00FF00},
	{colour: 0x16A7F5},
	{colour: 0x90F615}
];

for (let i = 0; i < lightCount; i++){

	// Positions evenly in a circle pointed at the origin.   
	const light = new THREE.PointLight(0xffffff, 1);
	let lightX = lightDistance * Math.sin(Math.PI * 2 / lightCount * i);
	let lightZ = lightDistance * Math.cos(Math.PI * 2 / lightCount * i);

	// Create a light
	light.position.set(lightX, 0, lightZ)
	light.lookAt(0, 0, 0)
	scene.add(light);
	lights.push(light);

	// Visual helpers to indicate light positions   
	scene.add(new THREE.PointLightHelper(light, .5, /*0xff9900*/lightValues[i]['colour']));

}

/******************************************************* 


/******************* Loading Objects *********************

//Create GLTLoader (.glb 3d objects loader)
const gltfLoader = new GLTFLoader();

//Load Museum
gltfLoader.load('../assets/glb/WholeMuseum.glb', (gltf) => {
	const root = gltf.scene; //get the scene of the museum from glb
	root.scale.set(1,1,1); // set the scale to 1,1,1
	scene.add(root); //add the museum to the main scene

	/*Still not sure about this xd */
	gltf.scene.traverse(function (child) {
		if ( child.isMesh ) {
			if (child.name.includes('main')){
				child.castShadow = true;
				child.receiveShadow = true;
			}else if (child.name.includes('Cube') ){
				//child.material.visible = false;
				environmentProxy = child;
			}}
	});
});

//Creates a variable to use as an Async function constructor
let AsyncFunction = Object.getPrototypeOf(async function(){}).constructor

//Creates the function to load the fragment asynchronously
let getobject = new AsyncFunction('a','b','return await Meteorito.loadFragment(a,b)');

let meterF;

let count = 0;

let load = false;

//Start the fragment load process
Meteorito.initializeEvents = function() {
	//Condition that reconognices the state of the page
	if(!load){
		//Gets the material of the fragment asynchronously
		let initObject = new AsyncFunction('a','return await Meteorito.initailize(a)');
			initObject(new MTLLoader()).then(materials => {
				//load the fragment while sending the materials and the OBJLoader
				getobject(new OBJLoader(), materials).then(object => {
					meterF = object;
					//adds the fragment to the scene || Still thinking "meterF" is unnecesary but it helps to avoid getting confused
					scene.add(meterF);
					load = true;
				});
			});
	

	}
}


Meteorito.initializeEvents();

/*****************************************************

// hashmap to keep movement
let movement = {moveForward: false, moveBackward: false, moveLeft: false, moveRight: false, moveUp: false, moveDown: false};


/*********** Reading keyboard and mouse ****************

let isCursorLocked = false;

document.addEventListener('pointerlockchange', function() {
	if (document.pointerLockElement === null) {
		isCursorLocked = false;
	} else {
	isCursorLocked = true;
	}
  });

document.addEventListener('keydown', function(event){
	
	if (isCursorLocked) {
	Joystick.onKeyDown(event,movement);
	}
});
document.addEventListener('keyup', function(event){
	Joystick.onKeyUp(event,movement);
});
document.addEventListener('mousemove', function(event) {
	if (isCursorLocked) {
		Joystick.onDocumentMouseMove(event, camera, isCursorLocked);	
	}
});


/*********************************************** 

/* Creating keyboard movement 
Joystick.initializeEvents = function() {
	Joystick.initialize();

}
Joystick.initializeEvents();

/************************************************ 

camera.position.set( -3, 30, 100);

document.body.addEventListener('click', (event)=> {
	lockCursor(event);
});  
  // desactivar la restricción del cursor al presionar escape


  // bloquear el cursor dentro de un área específica
  function lockCursor(event) {
	if (event.target === buttonVR || event.key === 'Escape') { // Si el evento se originó en el botón VR, no hacemos nada
        return;
    }

    // Si el evento no se originó en el botón VR, ejecutamos el código para bloquear el cursor
    if (isCursorLocked) return;

    if (!renderer.xr.enabled) {
		document.body.requestPointerLock();
	}
	
  }
  
  // desbloquear el cursor
  function unlockCursor() {
	 // Libera el acceso al cursor del mouse
	 document.exitPointerLock();
  }




/******************************

function animate() {
	if(!renderer.xr.enabled) {
		console.log("state1");
		requestAnimationFrame( animate );
		Joystick.updatePosition(isCursorLocked, camera, movement);
		spinFragment();
		renderer.render( scene, camera );
	
	} else {
		renderer.setAnimationLoop(() => {
			console.log("state2");
			spinFragment();
		
			renderer.render(scene, camera);
			/*
			controller1.update();
			controller2.update();*/

		  });
	}

	

};

function spinFragment() {
	if (load) {
		Meteorito.PfAutoRotate(meterF, count);
	}
}

animate();
*/
