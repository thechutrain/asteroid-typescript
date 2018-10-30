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
export const defaultSetting = {
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
	origin: PointModel | {};
	r: number;
	offSet: number;

	static defaultSetting = defaultSetting;

	constructor(options: AsteroidOptionsModel = {}) {
		super();
		this.options = extend(Asteroid.defaultSetting, options);
		this.onScreen = true;
		this.isActive = true;
		this.currPoints = [];
		this.origin = options.origin || {};
		this.r = options.r || 45;
		this.offSet = options.offSet || 0;

		this.init();
	}

	private init() {
		// If provided with an origin, don't randomly create another one
		if (this.origin.hasOwnProperty('x') && this.origin.hasOwnProperty('y')) {
			return;
		}
	}

	public calcPoints(ticks: number): PointModel[] {
		throw new Error('Method not implemented.');
	}
	public drawPoints(): void {
		throw new Error('Method not implemented.');
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
