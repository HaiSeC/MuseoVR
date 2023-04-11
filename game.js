import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();

let environmentProxy = null;

renderer.setSize(window.innerWidth, innerHeight);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);



document.body.appendChild(renderer.domElement);




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


const gltfLoader = new GLTFLoader();

gltfLoader.load('../assets/glb/WholeMuseum.glb', (gltf) => {
	const root = gltf.scene;
	root.scale.set(1,1,1);
	scene.add(root);

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

let movement = {moveForward: false, moveBackward: false, moveLeft: false, moveRight: false};


let moveSpeed = 1;

document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

function onKeyDown(event) {
    switch (event.keyCode) {
        case 87: // w
			movement.moveForward=true;
            break;
        case 65: // a
			movement.moveRight = true;
            break;
        case 83: // s
			movement.moveBackward = true;
            break;
        case 68: // d
			movement.moveLeft = true;
            break;

    }
}

function onKeyUp(event) {
    switch(event.keyCode) {
        case 87: // w
			movement.moveForward = false;
            break;
        case 65: // a
			movement.moveRight = false;
            break;
        case 83: // s
			movement.moveBackward = false;
            break;
        case 68: // d
			movement.moveLeft = false;
            break;
    }
}

function checkeys() {
	let checker = false;
	let remain = false;
	Object.keys(movement).forEach(function(key){
		
		if(!movement[key] && !remain || movement[key] && !remain ){
			remain = movement[key];
		} else if (movement[key] && remain) {
			checker = true;
		}
	});
	if(checker){
		moveSpeed = 0.45;
	} else {
		moveSpeed = 1;
	}
}

function updatePosition() {
	if(isCursorLocked){
		checkeys();
    if (movement.moveForward) {
        camera.position.x -= moveSpeed * Math.sin(camera.rotation.y);
        camera.position.z -= moveSpeed * Math.cos(camera.rotation.y);
    }
    if (movement.moveBackward) {
        camera.position.x += moveSpeed * Math.sin(camera.rotation.y);
        camera.position.z += moveSpeed * Math.cos(camera.rotation.y);
    }
    if (movement.moveLeft) {
        camera.position.x -= moveSpeed * Math.sin(camera.rotation.y - Math.PI/2);
        camera.position.z -= moveSpeed * Math.cos(camera.rotation.y - Math.PI/2);
    }
    if (movement.moveRight) {
        camera.position.x -= moveSpeed * Math.sin(camera.rotation.y + Math.PI/2);
        camera.position.z -= moveSpeed * Math.cos(camera.rotation.y + Math.PI/2);
    }

    // Limitar la posición de la cámara
    if (camera.position.x < -148) camera.position.x = -148;
    if (camera.position.x > 127) camera.position.x = 127;
    if (camera.position.z < -170) camera.position.z = -170;
    if (camera.position.z > 170) camera.position.z = 170;
}
}

document.addEventListener('mousemove', onDocumentMouseMove);

let isCursorLocked = false;

	let mouseX = 0;
	let mouseY = 0;


function onDocumentMouseMove(event) {
	if(isCursorLocked){

		if (document.pointerLockElement === document.body) {
			// Si se tiene acceso al cursor, actualiza la posición
			mouseX += event.movementX/100;
			mouseY += event.movementY/100;
		
		  }
	const maxVerticalRotation = Math.PI/8;
	const minVerticalRotation = -Math.PI/8;
	const maxHorizontalRotation = Math.PI;
	const minHorizontalRotation = -Math.PI;
	
  
	camera.rotation.y += -(mouseX - lastMouseX);

	if (camera.rotation.y > -1 && camera.rotation.y < 1) {
		camera.rotation.x += -(mouseY - lastMouseY);
	} else if ((camera.rotation.y < -1 && camera.rotation.y > -4) || (camera.rotation.y > 1 && camera.rotation.y < 4)) {
		camera.rotation.x += (mouseY - lastMouseY);
	}
  
	// Limit vertical rotation
	camera.rotation.x = Math.max(minVerticalRotation, Math.min(maxVerticalRotation, camera.rotation.x));
  
	// Limit horizontal rotation
	camera.rotation.y = Math.max(minHorizontalRotation, Math.min(maxHorizontalRotation, camera.rotation.y));
  	if (camera.rotation.y == maxHorizontalRotation) {
		camera.rotation.y = minHorizontalRotation
	} else if (camera.rotation.y == minHorizontalRotation){
		camera.rotation.y = maxHorizontalRotation
	}
	
	lastMouseX = mouseX;
	lastMouseY = mouseY;
	
	}
  }

  let lastMouseX = 0;
  let lastMouseY = 0;
	
  camera.lookAt(scene.position);
  camera.position.set( -3, 30, 100);


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

  document.body.addEventListener('click', lockCursor);
  
  // desactivar la restricción del cursor al presionar escape
  document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
	  unlockCursor();
	}
  });


  


function animate() {
	requestAnimationFrame( animate );

	updatePosition();
	console.log(camera.rotation.y)
	renderer.render( scene, camera );
};

animate();