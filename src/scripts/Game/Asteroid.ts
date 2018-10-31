import { extend } from '../utils';
import DrawableClass from './DrawableClass';

interface AsteroidOptionsModel {
	origin?: PointModel;
	rSize?: number;
	offSet?: number;
	rotationVector?: number; // speed & direction of the rotation
	translateX?: number;
	translateY?: number;
	color?: string;
	sides?: number;
	spacer?: number; // extra padding space used to reframe asteroids offscreen
}

// TODO: make an interface for this const
const defaultSetting = {
	color: 'rgba(48, 128, 232, 0.6)',
	animate: true,
	spacer: 1, // additional padding space added when calculating off frame reset
	level: 1,
	scoreValue: 5,
};

export class Asteroid extends DrawableClass {
	options: AsteroidOptionsModel;
	translateX: number;
	translateY: number;
	rSize: number;
	rotationVector: number; // signed number, direction of the rotation
	sides: number;
	offSet: number;
	spacer: number;

	static defaultSetting = defaultSetting;

	constructor(options: AsteroidOptionsModel = {}) {
		super(options);

		this.options = extend(Asteroid.defaultSetting, options);
		// THESE THINGS SHOULD GET ABSTRACTED OUT:
		this.rSize = options.rSize || 45;
		this.translateX = options.translateX || getRandomSpeed('x');
		this.translateY = options.translateY || getRandomSpeed('y');
		this.offSet = options.offSet || 0;

		this.rotationVector = options.rotationVector || -1;
		this.sides = options.sides || 10;
		this.spacer = options.spacer || 1;

		this.init();
	}

	private init() {
		// If provided with an origin, don't randomly create another one
		if (!!this.origin) {
			return;
		}

		// Default: no origin, determine which quadrant offscreen to originate from:
		let quadrant;
		if (this.translateX > 0) {
			quadrant = this.translateY > 0 ? 2 : 3;
		} else {
			quadrant = this.translateY > 0 ? 1 : 4;
		}

		const width = Asteroid.gameRef.canvasElem.width;
		const height = Asteroid.gameRef.canvasElem.height;

		switch (quadrant) {
			case 1:
				this.origin = {
					x: width + 10,
					y: -10,
				};
				break;
			case 2:
				this.origin = {
					x: -10,
					y: -10,
				};
				break;
			case 3:
				this.origin = {
					x: -10,
					y: height + 10,
				};
				break;
			case 4:
				this.origin = {
					x: width + 10,
					y: height + 10,
				};
				break;
		}
	}

	public calcPoints(ticks: number): PointModel[] {
		const moveXBy = ticks * this.translateX;
		const moveYBy = ticks * this.translateY;

		if (!this.origin) {
			throw new Error(`Cannot calcPoints if origin is null`);
		}
		this.origin.x = this.origin.x + moveXBy;
		this.origin.y = this.origin.y + moveYBy;

		this.offSet += this.rotationVector;

		this.currPoints = [];
		// TODO: make sides an option
		const angleUnit = 360 / this.sides;
		for (let i = 0; i < this.sides; i += 1) {
			const angle = angleUnit * i + this.offSet;
			const newX =
				this.origin.x + Math.sin((Math.PI * angle) / 180) * this.rSize;
			const newY =
				this.origin.y + Math.cos((Math.PI * angle) / 180) * this.rSize;
			this.currPoints.push({
				x: newX,
				y: newY,
			});
		}

		if (!this.onScreen && this.isVisible()) {
			this.onScreen = true;
		} else if (this.isHidden()) {
			this.onScreen = false;
			this.reframe();
		}
		return this.currPoints;
	}

	public drawPoints(): void {
		const ctx = Asteroid.gameRef.ctx;

		ctx.save();
		ctx.fillStyle = this.options.color;
		ctx.beginPath();
		this.currPoints.forEach((pt, i) => {
			// Draw points:
			if (i === 0) {
				ctx.moveTo(pt.x, pt.y);
			} else {
				ctx.lineTo(pt.x, pt.y);
			}
		});
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	private reframe() {
		const xLimit = Asteroid.gameRef.canvasElem.width;
		const yLimit = Asteroid.gameRef.canvasElem.height;
		let adjustXBy = 0;
		let adjustYBy = 0;

		// Determine left, right, top, bottom bounds of our shape:
		const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();

		// ===== ADJUST X-coordinates =====
		// CASE: moving right
		if (this.translateX > 0) {
			// Check to see if the trailing edge (far left x-coord on shape) is off screen
			if (leftBound > xLimit) {
				// then adjust all the x-coordinates
				adjustXBy = -1 * (rightBound + this.spacer);
			}
		} else {
			// CASE: moving left
			// checkt to see if shape may be off the canvas on the left-side
			if (rightBound < 0) {
				// all x-coordinates are off the screen & we need to update
				adjustXBy = Math.abs(leftBound) + xLimit + this.spacer;
			}
		}

		// ===== ADJUST Y-coordinates =====
		// CASE: moving down
		if (this.translateY > 0) {
			// Case: moving down, could potentially be below canvas
			if (upperBound > yLimit) {
				adjustYBy = -1 * (lowerBound + this.spacer);
			}
		} else {
			// Case; moving up
			// check if the entire shape is above the canvas
			if (lowerBound < 0) {
				adjustYBy = Math.abs(upperBound) + yLimit + this.options.spacer;
			}
		}

		if (!this.origin) {
			throw new Error(`Cannot reframe() if origin is null`);
		}

		this.origin.x = this.origin.x + adjustXBy;
		this.origin.y = this.origin.y + adjustYBy;

		this.currPoints.forEach(pt => {
			pt.x += adjustXBy;
			pt.y += adjustYBy;
		});
	}
}

export function initAsteroidFactory(creationDelay: number = 3000) {
	let timerRef: null | number = null;

	return (blnForce = false, asteroidOptions = {}) => {
		const asteroidArray: Asteroid[] = [];

		if (blnForce || timerRef === null) {
			// Case: can make asteroid
			console.log('creating an asteroid');
			asteroidArray.push(new Asteroid(asteroidOptions));

			// reset the timer
			if (timerRef) {
				window.clearTimeout(timerRef);
			}
			timerRef = window.setTimeout(() => {
				timerRef = null;
			}, creationDelay);
		}
		return asteroidArray;
	};
}

function getRandomSpeed(axis = 'x', blnDir = true) {
	const speedOptions = {
		xUpperSpeedBound: 4,
		xLowerSpeedBound: 3,
		yUpperSpeedBound: 3,
		yLowerSpeedBound: 2,
	};
	let min;
	let max;
	if (axis === 'x') {
		min = speedOptions.xLowerSpeedBound;
		max = speedOptions.xUpperSpeedBound;
	} else {
		min = speedOptions.yLowerSpeedBound;
		max = speedOptions.yUpperSpeedBound;
	}

	// ? - has to be any for weird reason
	let velocity: any = Math.random() * (max - min) + min;
	velocity = velocity.toFixed(2);
	const negDirection = blnDir ? Math.random() > 0.5 : false;
	return negDirection ? velocity * -1 : velocity;
}
