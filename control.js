var Joystick = {
	property: 10,

	initialize: function () {
		this.moveSpeed = 0.1;
		this.movement = { moveForward: false, moveBackward: false, moveLeft: false, moveRight: false, moveUp: false, moveDown: false };
		this.mouseX = 0;
		this.mouseY = 0;
		this.lastMouseX = 0;
		this.lastMouseY = 0;


	},

	initializeEvents: function () {

	},

	onKeyDown: function (event, movement) {
		event.preventDefault();
		switch (event.keyCode) {
			case 87: // w
				movement.moveForward = true;
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
			case 32: //space bar
				movement.moveUp = true;
				break;
			case 17: //control
				movement.moveDown = true;
				break;

		}
	},
	onKeyUp: function (event, movement) {
		event.preventDefault();
		switch (event.keyCode) {
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

			case 32: //space bar
				movement.moveUp = false;
				break;
			case 17: //control
				movement.moveDown = false;
				break;
		}
	},

	checkeys: function (movement) {
		let checker = false;
		let remain = false;
		Object.keys(movement).forEach(function (key) {

			if (!movement[key] && !remain || movement[key] && !remain) {
				remain = movement[key];
			} else if (movement[key] && remain) {
				checker = true;
			}
		});
		if (checker) {
			this.moveSpeed = 0.1;
		} else {
			this.moveSpeed = 0.1;
		}
	},

	updatePosition: function (isCursorLocked, camera, movement, motionState, body) {
		if (motionState) {
			const transform = new Ammo.btTransform();
			motionState.getWorldTransform(transform);
			const position = transform.getOrigin();
			const rotation = transform.getRotation();

			if (isCursorLocked) {
				Joystick.checkeys(movement);
				if (movement.moveForward) {
					position.setX(position.x() - (this.moveSpeed * Math.sin(rotation.y())));
					position.setZ(position.z() - (this.moveSpeed * Math.cos(rotation.y())));
				}
				if (movement.moveBackward) {
					position.setX(position.x() + (this.moveSpeed * Math.sin(rotation.y())));
					position.setZ(position.z() + (this.moveSpeed * Math.cos(rotation.y())));
				}
				if (movement.moveLeft) {
					position.setX(position.x() - (this.moveSpeed * Math.sin(rotation.y() - Math.PI / 2)));
					position.setZ(position.z() - (this.moveSpeed * Math.cos(rotation.y() - Math.PI / 2)));
				}
				if (movement.moveRight) {
					position.setX(position.x() - (this.moveSpeed * Math.sin(rotation.y() + Math.PI / 2)));
					position.setZ(position.z() - (this.moveSpeed * Math.cos(rotation.y() + Math.PI / 2)));
				}
				if (movement.moveUp) {
					position.setY(position.y() + this.moveSpeed);
				}
				if (movement.moveDown) {
					position.setY(position.y() - this.moveSpeed);
				}

				// Update the physics body's position and motion state
				body.setWorldTransform(transform);
				//motionState.setWorldTransform(transform);
			}

			// Update camera position and rotation
			camera.position.set(position.x(), position.y(), position.z());
			//camera.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
		}
	}
	,
	onDocumentMouseMove: function (event, camera, isCursorLocked) {
		if (isCursorLocked) {

			if (document.pointerLockElement === document.body) {
				// Si se tiene acceso al cursor, actualiza la posición
				this.mouseX += event.movementX / 100;
				this.mouseY += event.movementY / 100;

			}
			const maxVerticalRotation = Math.PI / 12;
			const minVerticalRotation = -Math.PI / 12;
			const maxHorizontalRotation = Math.PI;
			const minHorizontalRotation = -Math.PI;


			camera.rotation.y += -(this.mouseX - this.lastMouseX);

			if (camera.rotation.y > -1 && camera.rotation.y < 1) {
				camera.rotation.x += -(this.mouseY - this.lastMouseY);
			} else if ((camera.rotation.y < -1 && camera.rotation.y > -4) || (camera.rotation.y > 1 && camera.rotation.y < 4)) {
				camera.rotation.x += (this.mouseY - this.lastMouseY);
			}

			// Limit vertical rotation
			camera.rotation.x = Math.max(minVerticalRotation, Math.min(maxVerticalRotation, camera.rotation.x));

			// Limit horizontal rotation
			camera.rotation.y = Math.max(minHorizontalRotation, Math.min(maxHorizontalRotation, camera.rotation.y));
			if (camera.rotation.y == maxHorizontalRotation) {
				camera.rotation.y = minHorizontalRotation
			} else if (camera.rotation.y == minHorizontalRotation) {
				camera.rotation.y = maxHorizontalRotation
			}

			this.lastMouseX = this.mouseX;
			this.lastMouseY = this.mouseY;

		}
	}




}



