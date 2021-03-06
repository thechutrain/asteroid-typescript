import { extend } from '../utils';
import DrawableClass from './DrawableClass';

import { SpaceshipArguments, PointModel, VelocityModel } from './game.types';

export class Spaceship extends DrawableClass {
	protected static defaultSettings = {
		// For Drawable Class properties
		rSize: 25, // controls the size of the spaceship

		// Unique to Spaceship
		maxSpeed: 8,
		minThrust: 3, // starting Magnitude of velocity as soon as throttleOn
		rotationSpeed: 6,
		acceleration: 1,
		deceleration: 0.9, // must be less than one
		adjustedH: 0.7, // used to calculate the distance of the trailing tail points
	};

	public throttleTimer: any;
	public thrustersOn: boolean = false;
	public turningRight: boolean = false;
	public turningLeft: boolean = false;
	public isFiring: boolean = false;
	public maxSpeed: number;
	public minThrust: number;
	public rotationSpeed: number;
	public acceleration: number;
	public deceleration: number;

	constructor(argOptions: SpaceshipArguments = {}) {
		super(extend(Spaceship.defaultSettings, argOptions)); // Note: main reason I need to do this is to pass in the rSize value

		// Note: Since, A 'super' call must be the first statement in the constructor when a class contains initialized properties or has parameter properties.
		// I have to extend the obj twice
		const shipSettings = extend(Spaceship.defaultSettings, argOptions);
		this.maxSpeed = shipSettings.maxSpeed;
		this.minThrust = shipSettings.minThurst;
		this.rotationSpeed = shipSettings.rotationSpeed;
		this.acceleration = shipSettings.acceleration;
		this.deceleration = shipSettings.deceleration;

		// Properties Unique to Spaceship:
		// this.throttleTimer;
	}

	public throttleOff(): any {
		this.thrustersOn = false;
	}
	public throttleOn(): any {
		this.thrustersOn = true;
	}

	public calcPoints(numTicks: number): PointModel[] {
		if (!this.isActive) return [];

		// Transform Origin:
		this.velocity = this.calcVelocity(numTicks);
		this.origin.x += this.velocity.translateX;
		this.origin.y -= this.velocity.translateY; // subtract, because canvas coordinates have inverted y-axis

		this.calcPointsFromOrigin();

		if (!this.onScreen && this.isVisible()) {
			this.onScreen = true;
		} else if (this.isHidden()) {
			this.onScreen = false;
			this.reframe();
		}

		return this.currPoints;
	}

	public drawPoints(): boolean {
		if (!this.isActive) {
			return false;
		}

		const ctx = DrawableClass.ctx;

		// Draw the main triangle
		ctx.globalCompositeOperation = 'source-over';
		ctx.save();
		ctx.strokeStyle = this.strokeStyle;
		// ctx.lineWidth = 2;
		ctx.beginPath();
		this.currPoints.forEach((pt: PointModel, i: number) => {
			// Draw points:
			if (i === 0) {
				ctx.moveTo(pt.x, pt.y);
			} else {
				ctx.lineTo(pt.x, pt.y);
			}
		});
		ctx.closePath();
		ctx.stroke();
		ctx.restore();

		// TODO: make the two tails on the ship

		return true;
	}

	public getInitOrigin(options: any): PointModel {
		if (options.origin) {
			return options.origin;
		}
		const x = Math.floor(DrawableClass.canvasElem.width / 2);
		const y = Math.floor(DrawableClass.canvasElem.height / 2);
		return { x, y };
	}

	public getInitVelocity(options: any): VelocityModel {
		return { translateX: 0, translateY: 0, rotation: 0 };
	}

	// TODO: should this be abstracted & put on the drawableClass instead?
	/**
	 * calculates all the currPoints given the origin
	 * should get invoked after the origin has been transformed
	 */
	private calcPointsFromOrigin() {
		const h = this.rSize;
		this.currPoints = [];
		for (let angle = 0; angle < 360; angle += 120) {
			const adjustedH =
				angle === 0 ? h : h * Spaceship.defaultSettings.adjustedH;
			const currAngle = ((angle + this.offSet) * Math.PI) / 180;
			const x = this.origin.x + Math.sin(currAngle) * adjustedH;
			const y = this.origin.y - Math.cos(currAngle) * adjustedH;
			this.currPoints.push({ x, y });
		}
	}

	private reframe() {
		const xLimit = DrawableClass.canvasElem.width;
		const yLimit = DrawableClass.canvasElem.height;
		let adjustXBy = 0;
		let adjustYBy = 0;

		// Determine left, right, top, bottom bounds of our shape:
		const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();

		// Determine X-axis adjustment:
		if (leftBound > xLimit) {
			adjustXBy = -1 * xLimit;
		} else if (rightBound < 0) {
			adjustXBy = Math.abs(leftBound) + xLimit;
		}

		// Determine y-axis adjustment:
		if (upperBound > yLimit) {
			adjustYBy = -1 * lowerBound;
		} else if (lowerBound < 0) {
			adjustYBy = Math.abs(upperBound) + yLimit;
		}

		this.origin.x += adjustXBy;
		this.origin.y += adjustYBy;

		this.calcPointsFromOrigin();
	}

	private calcVelocity(numTicks: number): VelocityModel {
		let { magnitude, translateX, translateY, rotation } = this.velocity;
		magnitude = magnitude || 0; // magnitude required for spaceship, since translateX & y are derived from it

		if (!this.thrustersOn) {
			// Case: Throttle is not on, slowly decrease speed
			if (magnitude > 1) {
				magnitude = magnitude * numTicks * this.deceleration;
			} else {
				magnitude = 0;
			}
		} else {
			// Case: Throttle ON --> increase speed
			if (magnitude < this.minThrust) {
				magnitude = this.minThrust;
			} else {
				magnitude += this.acceleration * numTicks;
				magnitude = Math.min(magnitude, this.maxSpeed);
			}
		}

		// Get the Rotation && apply to offSet:
		if (this.turningLeft && !this.turningRight) {
			// Case: turning Left
			rotation = -1 * numTicks * this.rotationSpeed;
		} else if (!this.turningLeft && this.turningRight) {
			// Case: turning Right
			rotation = numTicks * this.rotationSpeed;
		} else {
			rotation = 0;
		}
		this.offSet += rotation;

		// Get the X & Y translation:
		if (magnitude && magnitude > 0) {
			translateX = magnitude * Math.sin((Math.PI * this.offSet) / 180);
			translateY = magnitude * Math.cos((Math.PI * this.offSet) / 180);
		} else {
			translateX = 0;
			translateY = 0;
		}

		return {
			magnitude,
			translateX,
			translateY,
			rotation,
		};
	}
}

export function initSpaceshipFactory(): () => Promise<Spaceship> {
	return (delay: number = 1000) => {
		return new Promise((resolve: any) => {
			setTimeout(() => {
				// console.log('resolving promise');
				resolve(new Spaceship());
			}, delay);
		});
	};
}
