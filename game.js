
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
let initObject = new AsyncFunction('a', 'b', 'return await Meteorito.initailize(a,b)');

let getobject = new AsyncFunction('a', 'b', 'c', 'return await Meteorito.loadFragment(a,b,c)');

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



	await initGraphics();

	//lights()
	setVR();

	setEvents();

	await loadGBL('../assets/glb/WholeMuseum.gltf', 0, true, { x: 1000, y: 10, z: 10 });
	await loadGBL('../assets/glb/WholeMuseum2.gltf');
	await Meteorito.initializeEvents();
	Joystick.initializeEvents();
	createScenePhysics();

}

function initGraphics() {
	//Create scene
	scene = new THREE.Scene();

	//create camera
	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

	//Create render
	renderer = new THREE.WebGLRenderer();

	//scene.background = new THREE.Color("white")

	//set render's size
	renderer.setSize(window.innerWidth, innerHeight);

	renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);


	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.17;


	camera.position.set(0, 5, 10);
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
	let lightDistance = 3000;

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
		if (modelData.name == 'Scene') {
			models.push(modelData)
		}
	})

	for (let index = 0; index < models.length; index++) {
		const model = models[index];

		if (physics) {
			addPhysics(model, mass)
		}
		scene.add(model)
	}

}

function createScenePhysics() {
	let models = [];
	//pBodie.push({ object: mesh, objectBody: body })

	const shape = new Ammo.btBoxShape(new Ammo.btVector3(1, 2, 1));
	console.log(shape)
	const transform = new Ammo.btTransform();
	const position = camera.position;
	const quaternion = camera.quaternion;
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

	const localInertia = new Ammo.btVector3(0, 0, 0);
	shape.calculateLocalInertia(1, localInertia);

	const motionState = new Ammo.btDefaultMotionState(transform);
	const rbInfo = new Ammo.btRigidBodyConstructionInfo(100, motionState, shape, localInertia);
	const body = new Ammo.btRigidBody(rbInfo);

	pBodie.push({ object: camera, objectBody: body })

	world.addRigidBody(body);

	scene.traverse((mesh) => {

		
		if (mesh.isMesh && mesh.name != 'Piso' && !mesh.name.includes("Paredes") && !mesh.name.includes("cuadro") && !mesh.name.includes("Puertas") && !mesh.name.includes("Cube") && !mesh.name.includes("Cylinder") && !mesh.name.includes("Sphere") && !mesh.name.includes("Circle") && !mesh.name.includes("Rings")) {
			
			models.push(mesh);
		} else if (mesh.isGroup && !mesh.name.includes("Paredes") && !mesh.name.includes("cuadro") && mesh.name != 'Scene' && mesh.name != '' && mesh.name != 'EntradaPrincipal' && mesh.name != 'baseDog' && mesh.name != 'MesaZinc' && mesh.name != 'MesaMicroscopio') {
			console.log(mesh.name)
			models.push(mesh);

		}
	})

	for (let index = 0; index < models.length; index++) {
		const model = models[index];
		addPhysics2(model, 0)
	}

}


function addPhysics(mesh, mass) {
	const boundingBox = new THREE.Box3().setFromObject(mesh);

	const size = boundingBox.getSize(new THREE.Vector3());

	// Next, create a physics body in Ammo.js with the same size
	const width = size.x;
	const height = size.y;
	const depth = size.z;
	const shape = new Ammo.btBoxShape(new Ammo.btVector3(width, height / 2, depth));

	// Create a wireframe geometry based on the shape
	const wireframeGeometry = new THREE.WireframeGeometry(new THREE.BoxGeometry(width, height, depth));
	const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
	const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

	// Set the position and rotation of the wireframe to match the mesh
	wireframe.position.copy(mesh.position);
	//wireframe.quaternion.copy(mesh.quaternion);

	// Add the wireframe to the scene
	scene.add(wireframe);


	const friction = 0.5; // Adjust the friction value as per your requirements
    const rollingFriction = 0.1; // Adjust the rolling friction value as per your requirements


	// Finally, create a physics object and add it to the world
	const transform = new Ammo.btTransform();
    const position = mesh.position;
    const quaternion = mesh.quaternion;
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

    const localInertia = new Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, localInertia);

    const motionState = new Ammo.btDefaultMotionState(transform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);

    // Set the friction properties on the rigidbody
    body.setFriction(friction);
    body.setRollingFriction(rollingFriction);


	pBodie.push({ object: mesh, objectBody: body })

	world.addRigidBody(body);
	return body;
}

function addPhysics2(mesh, mass) {
	const boundingBox = new THREE.Box3().setFromObject(mesh);

	const size = boundingBox.getSize(new THREE.Vector3());

	// Next, create a physics body in Ammo.js with the same size
	const width = size.x;
	const height = size.y;
	const depth = size.z;
	const shape = new Ammo.btBoxShape(new Ammo.btVector3(width/3, height/2, depth/2));

	// Finally, create a physics object and add it to the world
	const transform = new Ammo.btTransform();
	const position = mesh.position;
	const quaternion = mesh.quaternion;
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(position.x+0.5, position.y, position.z));

	transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

	// Create a wireframe geometry based on the shape
	const wireframeGeometry = new THREE.WireframeGeometry(new THREE.BoxGeometry(width/2, height, depth));
	const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
	const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);


	// Set the position and rotation of the wireframe to match the mesh
	wireframe.position.set(transform.getOrigin().x(), transform.getOrigin().y(), transform.getOrigin().z());
	//wireframe.quaternion.copy(mesh.quaternion);

	// Add the wireframe to the scene
	scene.add(wireframe);


	const localInertia = new Ammo.btVector3(0, 0, 0);
	shape.calculateLocalInertia(mass, localInertia);

	const motionState = new Ammo.btDefaultMotionState(transform);
	const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
	const body = new Ammo.btRigidBody(rbInfo);

	pBodie.push({ objectBody: body })

	world.addRigidBody(body);
	return body;
}

//Start the fragment load process
Meteorito.initializeEvents = function () {
	//Condition that reconognices the state of the page
	if (!load) {
		//Gets the material of the fragment asynchronously
		initObject(new MTLLoader(), '../assets/Fragmento_Principal/Fragmento_Principal.mtl').then(materials => {
			//load the fragment while sending the materials and the OBJLoader
			getobject(new OBJLoader(), materials, '../assets/Fragmento_Principal/Fragmento_Principal.obj').then(object => {
				meterF = object;
				meterF.position.set(0, 5, -1)
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
		if (meshData.object) {
			if (meshData.object.isCamera) {
				let cam = meshData.object;
				if (!renderer.xr.isPresenting) {
					const body = meshData.objectBody;
					const motionState = body.getMotionState();
					let update = false;
					Object.keys(movement).map(movekey => {
						if (movement[movekey] == true){
							update = true;
						}		
					})
					//if(update) {

						Joystick.updatePosition(isCursorLocked, cam, movement, motionState, body );
						//checkMovementArea(cam.position)
						//meshData.object = cam;
					//}					
				}
			} else {
				const body = meshData.objectBody;
				const motionState = body.getMotionState();
				if (motionState) {
					const transform = new Ammo.btTransform();
					motionState.getWorldTransform(transform);

					const position = transform.getOrigin();
					const rotation = transform.getRotation();
					meshData.object.position.set(position.x(), position.y(), position.z());
					//meshData.object.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());

				}
			}
		}
	})

	spinFragment();


	renderer.render(scene, camera);

}

function spinFragment() {
	if (load) {
		Meteorito.PfAutoRotate(meterF, count);
	}
}

function checkMovementArea(position) {
	const raycaster = new THREE.Raycaster();
  const direction = new THREE.Vector3(0, -1, 0); // Cast ray downwards (adjust the direction as needed)
  raycaster.set(position, direction);

  // Set the maximum distance for the raycast based on your scene's dimensions
  const maxDistance = 10; // Adjust this value to fit your scene
  raycaster.far = maxDistance;

  // Create an array to store the valid rigid bodies for raycasting
  const validRigidBodies = pBodie
    .filter(entry => entry.object !== undefined && entry.object !== null)
    .map(entry => entry.object);

  // Perform the raycast against the valid rigid bodies
  const intersects = raycaster.intersectObjects(validRigidBodies);

  // Process the raycast results
  if (intersects.length > 0) {
    // The ray hit a valid rigid body, you can check the intersects array for more details
    console.log("Raycast hit rigid body:", intersects[0].object);
  } else {
    // The ray did not hit any valid rigid body, the area is clear for movement
    console.log("Area is clear for movement");
  }
  }
