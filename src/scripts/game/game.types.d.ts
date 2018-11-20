/** Simple Types
 *
 */
interface PointModel {
	x: number;
	y: number;
}

interface VelocityModel {
	magnitude?: number; // total magnitude, if supplied --> used to calc x & y
	translateX: number;
	translateY: number;
	rotation: number; // rotation that changes the offSet, Zero if no rotation
}

/** Class Arguments Models
 *  - DrawableClass
 *  - Spaceship
 *  - Asteroid
 *  - Bullet
 *  - Game
 */
interface DrawableClassArguments {
	rSize: number;
	currPoints?: PointModel[];
	strokeStyle?: string;
	origin?: PointModel;
	offSet?: number;
	velocity?: VelocityModel;
	isActive?: boolean;
	canvasElem?: {
		width: number;
		height: number;
	};
	// onScreen?: boolean;
}

interface SpaceshipArguments {
	strokeStyle?: string;
	invincible?: boolean;
	canvasElem?: {
		width: number;
		height: number;
	};
}

interface AsteroidArguments {
	origin?: PointModel;
	rSize?: number;
	offSet?: number;
	// rotationVector?: number; // speed & direction of the rotation
	// translateX?: number;
	// translateY?: number;
	velocity?: VelocityModel;
	strokeStyle?: string; // string representing the stroke color
	sides?: number;
	spacer?: number; // extra padding space used to reframe asteroids offscreen
	canvasElem?: {
		width: number;
		height: number;
	};
}

interface BulletArguments {
	origin: PointModel;
	velocity: VelocityModel;
	offSet: number;
	bulletSpeed?: number;
	canvasElem?: {
		width: number;
		height: number;
	};
}

// Question: I don't think this getting evaluated in the way I had hoped for
interface MergedBulletArguments extends DrawableClassArguments {
	// Can you shorthand this?
	origin: PointModel;
	velocity: VelocityModel;
	offSet: number;
	// bulletSpeed: string;
}

// Pending Deprecation, really don't need an optional argument for constructor function
interface GameArguments {
	tickLength?: number; // ms times in between frames
	numTicksBeforePausing?: number;
	maxAsteroids?: number;
	maxChildAsteroids?: number; // max depth level of the child asteroids
	asteroidDelay?: number; // delay in creating asteroid, from last creation
	firingDelay?: number; // minimum time between fired bullets

	// DOM related settings
	canvasSelector?: string; // selector for canvas element
	scoreSelector?: string;
	livesSelector?: string;
}
