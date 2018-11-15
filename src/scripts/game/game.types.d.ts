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

interface DrawableModel {
	currPoints: PointModel[];
	origin: PointModel | null;
	isActive: boolean;
	onScreen: boolean;
	calcPoints: (ticks: number) => PointModel[];
	drawPoints: () => void;
	getBounds: () => {
		leftBound: number;
		rightBound: number;
		upperBound: number;
		lowerBound: number;
	};
	isVisible: () => boolean;
	isHidden: () => boolean;
}

// TODO: add consistent naming
interface DrawableClassArguments {
	currPoints?: PointModel[];
	isActive?: boolean;
	onScreen?: boolean;
	origin?: PointModel;
	offSet?: number;
	velocity?: VelocityModel;
}

interface SpaceshipArgsModel extends DrawableClassArguments {
	strokeStyle?: string;
	invincible?: boolean;
}

// Pending Deprecation, really don't need an optional argument for constructor function
interface GameOptionsModel {
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
