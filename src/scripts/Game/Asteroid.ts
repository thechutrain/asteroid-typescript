import { extend } from '../utils';
import DrawableClass from './DrawableClass';

interface AsteroidOptionsModel {
	origin?: PointModel;
	rSize?: number;
	offSet?: number;
	rotationVector?: number; // speed & direction of the rotation
	translateX?: number;
	translateY?: number;
	strokeStyle?: string; // string representing the stroke color
	sides?: number;
	spacer?: number; // extra padding space used to reframe asteroids offscreen
}

// TODO: make an interface for this const
// TODO: move this to the parent level inside Asteroid, so they aren't static properties
const defaultSetting = {
	animate: true,
	// spacer: 1, // additional padding space added when calculating off frame reset
	level: 1,
	scoreValue: 5,
	defaultStrokeStyle: 'white',
	// TODO: should be positive and negative inputs
	velocityOptions: {
		x: {
			max: 4,
			min: 3,
		},
		y: {
			max: 3,
			min: 2,
		},
		rotation: {
			max: 1,
			min: -2,
		},
	},
};

export class Asteroid extends DrawableClass {
	options: AsteroidOptionsModel;
	rSize: number;
	sides: number;
	offSet: number;
	spacer: number;
	strokeStyle: string;

	static defaultSetting = defaultSetting;

	constructor(options: AsteroidOptionsModel = {}) {
		super(options);
		this.options = extend(Asteroid.defaultSetting, options);
		// THESE THINGS SHOULD GET ABSTRACTED OUT:
		this.rSize = options.rSize || 45;
		this.offSet = options.offSet || 0;
		this.sides = options.sides || 10;
		this.spacer = options.spacer || 1;
		this.strokeStyle =
			options.strokeStyle || Asteroid.defaultSetting.defaultStrokeStyle;
	}

	public containsPoint(testPoint: PointModel) {
		if (!this.currPoints.length) return false;

		const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();

		// TODO: should save this as a property of the asteroids object, instead of recalculating??
		// How would I want to cache the value here?
		if (
			testPoint.x < leftBound ||
			testPoint.x > rightBound ||
			testPoint.y < upperBound ||
			testPoint.y > lowerBound
		) {
			return false;
		}

		let isOnLine = false; // bln flag to check if its on the line, then containsPoints ==> true!
		const lineResults = this.currPoints.map((pt1, index, coordArr) => {
			const x1 = pt1.x;
			const y1 = pt1.y;
			const x2 =
				index + 1 < coordArr.length ? coordArr[index + 1].x : coordArr[0].x;
			const y2 =
				index + 1 < coordArr.length ? coordArr[index + 1].y : coordArr[0].y;
			const m = (y1 - y2) / (x1 - x2);
			const b = y1 - m * x1;

			// Edge Case: slope is a vertical line
			if (m === Infinity) {
				if (testPoint.x === x1) {
					isOnLine = true;
					return true; // this really doesn't matter
				}
				return testPoint.x < x1;
			}
			if (testPoint.y === m * testPoint.x + b) {
				isOnLine = true;
				return true; // this really doesn't matter
			}
			return testPoint.y < m * testPoint.x + b;
		});

		if (isOnLine) {
			return true;
		}

		// check how many lines it was below
		let numLinesBelow = 0;
		const shouldEqual = Math.ceil(lineResults.length / 2);
		lineResults.forEach(res => {
			if (res) {
				numLinesBelow += 1;
			}
		});

		return numLinesBelow === shouldEqual;
	}

	public getInitVelocity(options: any): VelocityModel {
		// If a velocity is given, just use that instead of calc new one:
		if (options.velocity) {
			return options.velocity;
		}

		function getRandomSpeed(axis = 'x', blnDir = true) {
			const { x, y, rotation } = Asteroid.defaultSetting.velocityOptions;

			let min;
			let max;
			switch (axis) {
				case 'x':
					max = x.max;
					min = x.min;
					break;
				case 'y':
					max = y.max;
					min = y.min;
					break;
				case 'rotation':
					max = rotation.max;
					min = rotation.min;
					break;
				default:
					throw new Error('Cannot get initVelocity: axis not valid');
			}

			let velocity = Math.random() * (max - min) + min;
			velocity = Math.round(velocity * 100) / 100; // NOTE: toFixed(n), returns string

			const negDirection = blnDir ? Math.random() > 0.5 : false;
			return negDirection ? velocity * -1 : velocity;
		}

		return {
			translateX: getRandomSpeed('x'),
			translateY: getRandomSpeed('y'),
			rotation: getRandomSpeed('rotation'),
		};
	}

	public getInitOrigin(options: any): PointModel {
		if (options.origin) {
			return options.origin;
		}

		// Note: prevents foot gun, where the order in which you call initializer fn does not matter
		if (!this.velocity) {
			this.velocity = this.getInitVelocity(options);
		}

		let quadrant;
		if (this.velocity.translateX > 0) {
			quadrant = this.velocity.translateY > 0 ? 2 : 3;
		} else {
			quadrant = this.velocity.translateY > 0 ? 1 : 4;
		}

		const width = DrawableClass.gameRef.canvasElem.width;
		const height = DrawableClass.gameRef.canvasElem.height;
		let origin;

		switch (quadrant) {
			case 1:
				origin = {
					x: width + 10,
					y: -10,
				};
				break;
			case 2:
				origin = {
					x: -10,
					y: -10,
				};
				break;
			case 3:
				origin = {
					x: -10,
					y: height + 10,
				};
				break;
			case 4:
				origin = {
					x: width + 10,
					y: height + 10,
				};
				break;
			default:
				throw new Error(
					'Error: could not determine the right quadrant for asteroid',
				);
				break;
		}

		return origin;
	}

	public calcPoints(ticks: number): PointModel[] {
		const moveXBy = ticks * this.velocity.translateX;
		const moveYBy = ticks * this.velocity.translateY;

		if (!this.origin) {
			throw new Error(`Cannot calcPoints if origin is null`);
		}
		this.origin.x = this.origin.x + moveXBy;
		this.origin.y = this.origin.y + moveYBy;

		this.offSet += this.velocity.rotation;

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
		const ctx = DrawableClass.gameRef.ctx;

		ctx.save();
		ctx.strokeStyle = this.strokeStyle;
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
		ctx.stroke();
		ctx.restore();
	}

	private reframe() {
		const xLimit = DrawableClass.gameRef.canvasElem.width;
		const yLimit = DrawableClass.gameRef.canvasElem.height;
		let adjustXBy = 0;
		let adjustYBy = 0;

		// Determine left, right, top, bottom bounds of our shape:
		const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();

		// ===== ADJUST X-coordinates =====
		// CASE: moving right
		if (this.velocity.translateX > 0) {
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
		if (this.velocity.translateY > 0) {
			// Case: moving down, could potentially be below canvas
			if (upperBound > yLimit) {
				adjustYBy = -1 * (lowerBound + this.spacer);
			}
		} else {
			// Case; moving up
			// check if the entire shape is above the canvas
			if (lowerBound < 0) {
				adjustYBy = Math.abs(upperBound) + yLimit + this.spacer;
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
