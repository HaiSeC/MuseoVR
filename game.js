import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import AmmoLib from "ammo-es";

let Ammo, physicsWorld;

//Create scene
const scene = new THREE.Scene();

//Create render
const renderer = new THREE.WebGLRenderer();

let environmentProxy = null;

//set render's size
renderer.setSize(window.innerWidth, innerHeight);

//create camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);

//add renderer
document.body.appendChild(renderer.domElement);

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

	// Positions evenly in a circle pointed at the origin
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

/******************************************************/

// hashmap to keep movement
let movement = {moveForward: false, moveBackward: false, moveLeft: false, moveRight: false, moveUp: false, moveDown: false};


/*********** Reading keyboard and mouse *****************/
document.addEventListener('keydown', function(event){
	Joystick.onKeyDown(event,movement);
});
document.addEventListener('keyup', function(event){
	Joystick.onKeyUp(event,movement);
});
document.addEventListener('mousemove', function(event) {
	Joystick.onDocumentMouseMove(event, camera, isCursorLocked);
});


/*********************************************** */

/* Creating keyboard movement */
Joystick.initializeEvents = function() {
	Joystick.initialize();

}
Joystick.initializeEvents();

/************************************************ */

camera.position.set( -3, 30, 100);

document.body.addEventListener('click', lockCursor);  
  // desactivar la restricción del cursor al presionar escape
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
	  unlockCursor();
	}
  });

  let isCursorLocked = false;
  // bloquear el cursor dentro de un área específica
  function lockCursor() {
	// Pide el acceso al cursor del mouse
	document.body.requestPointerLock();
	  isCursorLocked = true;
  }
  
  // desbloquear el cursor
  function unlockCursor() {
	 // Libera el acceso al cursor del mouse
	 document.exitPointerLock();
	  isCursorLocked = false;
  }

function animate() {
	requestAnimationFrame( animate );
	Joystick.updatePosition(isCursorLocked, camera, movement);
	renderer.render( scene, camera );
	if (load) {
		Meteorito.PfAutoRotate(meterF, count);
	}


};

function setupPhysicsWorld() {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
}

function init() {
    AmmoLib().then((re) => {
        Ammo = re;
		console.log(Ammo);
        setupPhysicsWorld();
        animate();
    });
}

init();