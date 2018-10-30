import { extend } from '../utils';
import DrawableClass from './DrawableClass';

interface AsteroidOptionsModel {
	origin?: PointModel;
	r?: number;
	offSet?: number;
	translateX?: number;
	translateY?: number;
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
	onScreen: boolean; // when true, means at least one point is on the canvas
	isActive: boolean; // determines if its been hit or not
	currPoints: PointModel[];
	origin: PointModel | null;
	translateX: number;
	translateY: number;
	r: number;
	offSet: number;

	static defaultSetting = defaultSetting;

	constructor(options: AsteroidOptionsModel = {}) {
		super();
		this.options = extend(Asteroid.defaultSetting, options);
		this.onScreen = true;
		this.isActive = true;
		this.currPoints = [];
		this.origin = options.origin || null;
		this.r = options.r || 45;
		this.translateX = options.translateX || getRandomSpeed('x');
		this.translateY = options.translateY || getRandomSpeed('y');
		this.offSet = options.offSet || 0;

		this.init();
	}

	private init() {
		// If provided with an origin, don't randomly create another one
		if (!this.origin) {
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

		this.offSet += 2;

		this.currPoints = [];
		// TODO: make sides an option
		const sides = 8;
		const angleUnit = 360 / sides;
		for (let i = 0; i < sides; i += 1) {
			const angle = angleUnit * i + this.offSet;
			const newX = this.origin.x + Math.sin((Math.PI * angle) / 180) * this.r;
			const newY = this.origin.y + Math.cos((Math.PI * angle) / 180) * this.r;
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
		throw new Error('Method not implemented.');
	}

	private reframe() {}
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
