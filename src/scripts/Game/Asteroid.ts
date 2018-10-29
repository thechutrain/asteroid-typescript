import { extend } from '../utils';

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

class Asteroid extends DrawableClass {
	public calcPoints(ticks: number): PointModel[] {
		throw new Error('Method not implemented.');
	}
	public drawPoints(): void {
		throw new Error('Method not implemented.');
	}
	options: AsteroidOptionsModel;
	onScreen: boolean; // when true, means at least one point is on the canvas
	isActive: boolean; // determines if its been hit or not
	currPoints: PointModel[];
	origin: PointModel;
	r: number;
	offSet: number;

	static defaultSetting = defaultSetting;

	constructor(options: AsteroidOptionsModel = {}) {
		super();
		this.options = extend(Asteroid.defaultSetting, options);
		this.onScreen = true;
		this.isActive = true;
		this.currPoints = [];
		this.origin = this.getOrigin();
		this.r = options.r || 45;
		this.offSet = options.offSet || 0;
	}

	getOrigin() {
		return { x: 0, y: 0 };
	}
}

export default Asteroid;
