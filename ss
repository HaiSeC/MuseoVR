
import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';


let scene;
let camera;
let renderer;
let renderTarget;

let environmentProxy = null;

//Creates a variable to use as an Async function constructor
let AsyncFunction = Object.getPrototypeOf(async function () { }).constructor

//Creates the function to load the fragment asynchronously
let initObject = new AsyncFunction('a','b', 'return await Meteorito.initailize(a,b)');

let getobject = new AsyncFunction('a', 'b','c', 'return await Meteorito.loadFragment(a,b,c)');

let meterF;

let count = 0;

let load = false;

let movement = { moveForward: false, moveBackward: false, moveLeft: false, moveRight: false, moveUp: false, moveDown: false };

let isCursorLocked = false;

let pBodie = [];

var collisionConfiguration
var dispatcher
var overlappingPairCache
var solver
var world


function X() {
	//Ammo = AmmoLib;

	// Create a collision configuration
	collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
	// Create a collision dispatcher
	dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
	// Create a broadphase interface
	const broadphase = new Ammo.btDbvtBroadphase();
	// Create a constraint solver
	solver = new Ammo.btSequentialImpulseConstraintSolver();
	// Create a physics world
	world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
	// Set the gravity of the physics world
	world.setGravity(new Ammo.btVector3(0, -9.8, 0));

	INIT();
	animate();

};
X()

async function INIT() {



	initGraphics();

	//createPhysics();
	//lights()
	setVR();

	setEvents();

	//await loadFBX('../assets/fbx/SueloMusero/SueloMuseoBlender.fbx', 0, true, { x: 0.08, y: 0.1, z: 0.08 });
	//await loadFBX('../assets/fbx/MuseoBlender.fbx', 0, false)

	loadGBL('../assets/glb/WholeMuseum.gltf', 0, true, { x: 0.08, y: 100, z: 0.08 });
	debugger
	//loadGBL('../assets/glb/WholeMuseum2.gltf');
	Meteorito.initializeEvents();
	Joystick.initializeEvents();


}

function initGraphics() {
	//Create scene
	scene = new THREE.Scene();

	//create camera
	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

	//Create render
	renderer = new THREE.WebGLRenderer();

	scene.background = new THREE.Color("white")

	//set render's size
	renderer.setSize(window.innerWidth, innerHeight);

	renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);


	renderer.toneMapping = THREE.ACESFilmicToneMapping;
//	renderer.toneMappingExposure = 0.17;
//	renderer.toneMappingExposure = 0.25;


	camera.position.set(0, 5,10);
}

function createPhysics() {
	// Initialize physics engine
	collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
	dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
	broadphase = new Ammo.btDbvtBroadphase();
	solver = new Ammo.btSequentialImpulseConstraintSolver();
	physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
	physicsWorld.setGravity(new Ammo.btVector3(0, - gravityConstant, 0));

	transformAux1 = new Ammo.btTransform();
	tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);

	/* Codigo de fisicas */



	/****Carga de modelos ****/


}

function setVR() {
	renderer.xr.enabled = true;
	// controllers



	const controller1 = renderer.xr.getController(0);
	scene.add(controller1);

	const controller2 = renderer.xr.getController(1);
	scene.add(controller2);

	const controllerModelFactory = new XRControllerModelFactory();
	const handModelFactory = new XRHandModelFactory();

	// Hand 1
	const controllerGrip1 = renderer.xr.getControllerGrip(0);
	controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
	scene.add(controllerGrip1);

	const hand1 = renderer.xr.getHand(0);
	hand1.add(handModelFactory.createHandModel(hand1));

	scene.add(hand1);

	// Hand 2
	const controllerGrip2 = renderer.xr.getControllerGrip(1);
	controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
	scene.add(controllerGrip2);

	const hand2 = renderer.xr.getHand(1);
	hand2.add(handModelFactory.createHandModel(hand2));
	scene.add(hand2);

	//

	const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)]);

	const line = new THREE.Line(geometry);
	line.name = 'line';
	line.scale.z = 5;

	controller1.add(line.clone());
	controller2.add(line.clone());

	//
}


function setEvents() {
	/********* Control VR **********/

	document.body.appendChild(renderer.domElement);

	document.body.appendChild(VRButton.createButton(renderer));


	window.addEventListener('resize', onWindowResize);
	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}




	document.addEventListener('pointerlockchange', function () {
		if (document.pointerLockElement === null) {
			isCursorLocked = false;
		} else {
			isCursorLocked = true;
		}
	});

	document.addEventListener('keydown', function (event) {

		if (isCursorLocked) {
			Joystick.onKeyDown(event, movement);
		}
	});
	document.addEventListener('keyup', function (event) {
		Joystick.onKeyUp(event, movement);
	});
	document.addEventListener('mousemove', function (event) {
		if (isCursorLocked) {
			Joystick.onDocumentMouseMove(event, camera, isCursorLocked);
		}
	});



	document.body.addEventListener('click', (event) => {
		lockCursor(event);
	});
}


function lights() {

	/******************* LIGHTS ************************/
	let lightCount = 6;
	let lightDistance = 30;

	let lights = [];

	const lightValues = [
		{ colour: 0x14D14A },
		{ colour: 0xBE61CF },
		{ colour: 0x00FFFF },
		{ colour: 0x00FF00 },
		{ colour: 0x16A7F5 },
		{ colour: 0x90F615 }
	];

	for (let i = 0; i < lightCount; i++) {

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
		scene.add(new THREE.PointLightHelper(light, .5, lightValues[i]['colour']));

	}
}

/******************* Loading Objects **********************/

async function loadGBL(path, mass, physics, scale) {

	//Create GLTLoader (.glb 3d objects loader)
	const gltfLoader = new GLTFLoader();


	const [museoData] = await Promise.all([
		gltfLoader.loadAsync([path])
	])

//	const models = museoData.scene.children
	const modelsData = museoData.scene

	let models = []
	modelsData.traverse(modelData => {
		if ( modelData.name == 'Scene' ) {
			if (physics) {
				addPhysics(modelData, mass)
			}
			models.push(modelData)
		} else if (modelData.isLight) {
			const light = new THREE.SpotLight(modelData.color, modelData.intensity);
			scene.add(light)

		}
	})
	
	console.log(models)
	for (let index = 0; index < models.length; index++) {
		const model = models[index];
		console.log(model)
			scene.add(model)
	}

}



function loadFBX(path, mass, physics, scale) {
	const fbxLoader = new FBXLoader();

	fbxLoader.load(path, (gltf) => {
		const root = gltf; //get the scene of the museum from glb
		root.scale.set(1, 1, 1); // set the scale to 1,1,1
		scene.add(root); //add the museum to the main scene
		
		/*Still not sure about this xd */
		root.traverse(function (child) {
			if (child.isMesh) {
				if (physics) {
					addPhysics(child, mass)
				}
				if (child.name.includes('main')) {
					child.castShadow = true;
					child.receiveShadow = true;
				} else if (child.name.includes('Cube')) {
					//child.material.visible = true;
					environmentProxy = child;
				}
			}
		});
	});

}



function addPhysics(mesh, mass) {
	const boundingBox = new THREE.Box3().setFromObject(mesh);
	
	const size = boundingBox.getSize(new THREE.Vector3());

	// Next, create a physics body in Ammo.js with the same size
	const width = size.x;
	const height = size.y;
	const depth = size.z;
	const shape = new Ammo.btBoxShape(new Ammo.btVector3(width / 2, height / 3, depth / 2));

	// Create a wireframe geometry based on the shape
	const wireframeGeometry = new THREE.WireframeGeometry(new THREE.BoxGeometry(width, height / 3, depth));
	const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
	const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

	// Set the position and rotation of the wireframe to match the mesh
	wireframe.position.copy(mesh.position);
	//wireframe.quaternion.copy(mesh.quaternion);

	// Add the wireframe to the scene
	scene.add(wireframe);

	// Finally, create a physics object and add it to the world
	const transform = new Ammo.btTransform();
	const position = mesh.position;
	const quaternion = mesh.quaternion;
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
	//transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

	const localInertia = new Ammo.btVector3(0, 0, 0);
	shape.calculateLocalInertia(mass, localInertia);

	const motionState = new Ammo.btDefaultMotionState(transform);
	const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
	const body = new Ammo.btRigidBody(rbInfo);

	pBodie.push({ object: mesh, objectBody: body })

	world.addRigidBody(body);
	return body;
}


//Start the fragment load process
Meteorito.initializeEvents = function () {

	//Condition that reconognices the state of the page
	console.log('dafuq')
	if (!load) {
		//Gets the material of the fragment asynchronously
		initObject(new MTLLoader(), '../assets/Fragmento_Principal/Fragmento_Principal.mtl').then(materials => {
			//load the fragment while sending the materials and the OBJLoader
			getobject(new OBJLoader(), materials, '../assets/Fragmento_Principal/Fragmento_Principal.obj').then(object => {
				meterF = object;
				meterF.position.set(0, 5, 2)
				meterF.userData = addPhysics(meterF, 10000)
				meterF.name = meterF.children[0].name
				
				//adds the fragment to the scene || Still thinking "meterF" is unnecesary but it helps to avoid getting confused
				scene.add(meterF);

				load = true;
			});
		});


	}
}


/* Creating keyboard movement */
Joystick.initializeEvents = function () {
	Joystick.initialize();

}


function lockCursor(event) {

	document.body.requestPointerLock();

}

// desbloquear el cursor
function unlockCursor() {
	// Libera el acceso al cursor del mouse
	document.exitPointerLock();
}


//INIT();
function animate() {

	renderer.setAnimationLoop(render);

}

function render() {
	// First rendering pass - render scene to texture
	renderer.setRenderTarget(renderTarget);
	renderer.render(scene, camera);

	// Second rendering pass - render texture to screen
	renderer.setRenderTarget(null);
	//material.map = renderTarget.texture;

	world.stepSimulation(1 / 120, 10); // Actualiza la simulación física (60 FPS)
	// Actualiza la posición y rotación de los objetos según sus cuerpos rígidos
	pBodie.forEach((meshData) => {
		const body = meshData.objectBody;
		const motionState = body.getMotionState();
		if (motionState) {
			const transform = new Ammo.btTransform();
			motionState.getWorldTransform(transform);

			const position = transform.getOrigin();
			const rotation = transform.getRotation();
			meshData.object.position.set(position.x(), position.y(), position.z() + 0.7);
			//meshData.object.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());

		}
	})
	
	spinFragment();
	if (!renderer.xr.isPresenting) {
		Joystick.updatePosition(isCursorLocked, camera, movement);
	}

	renderer.render(scene, camera);

}

function spinFragment() {
	if (load) {
		Meteorito.PfAutoRotate(meterF, count);
	}
}

//animate();
