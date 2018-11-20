import Game from './Game';

// Question: alternative, as a static property in the class, any difference?
// const defaultSettings = {
// 	offSet: 0,
// 	strokeStyle: 'white',
// };

// const fakeCanvas = {
// 	width: 300,
// 	height: 150,
// };
abstract class DrawableClass {
	currPoints: PointModel[] = [];
	origin: PointModel;
	rSize: number;
	offSet: number; // the angle in degrees, counter clockwise from 12
	strokeStyle: string;
	onScreen: boolean; // when true, means at least one point is on the canvas
	isActive: boolean; // determines if its been hit or not
	velocity: VelocityModel;

	static canvasElem: { width: number; height: number };
	static ctx: any;
	static defaultSettings: any = {
		offSet: 0,
		strokeStyle: 'white',
	};

	constructor(options: DrawableClassArguments) {
		/** NOTE: this is necessary, because there's a race condition where
		 * this abstract class may be created prior to the Game creation
		 */
		if (!DrawableClass.canvasElem) {
			DrawableClass.canvasElem = options.canvasElem
				? options.canvasElem
				: (<any>window).Game.canvasElem;
		}

		if (!DrawableClass.ctx) {
			DrawableClass.ctx = options.ctx ? options.ctx : (<any>window).Game.ctx;
		}

		this.velocity = this.getInitVelocity(options);
		this.origin = this.getInitOrigin(options);
		this.rSize = options.rSize;
		this.strokeStyle =
			options.strokeStyle || DrawableClass.defaultSettings.strokeStyle;
		this.offSet =
			Object.prototype.hasOwnProperty.call(options, 'offSet') &&
			options.offSet !== undefined
				? options.offSet
				: DrawableClass.defaultSettings.offSet; // Note: overkill, but prevents footgun if default settings were not 0, and we were trying to pass in 0 as an options.offSet

		// TODO: convert this into getters & setters
		this.onScreen = this.isVisible();
		this.isActive = options.isActive || true;
	}

	public abstract getInitOrigin(options: { origin?: PointModel }): PointModel;

	// ?? If I want flexibility in the options argument here for classes that implement this, should I use the intersect on child classes?
	public abstract getInitVelocity(options: {
		velocity?: VelocityModel;
		offSet?: number;
	}): VelocityModel;

	/**
	 * Transforms origin & then recalculates all the currPoints afterwards
	 * @param ticks
	 */
	public abstract calcPoints(ticks: number): PointModel[];

	/**
	 * Draws all the points from currPoints[] onto ctx (stored off of static gameRef property)
	 * @return {boolean} - whether the drawable class was drawn or not
	 */
	public abstract drawPoints(): boolean;

	protected isVisible(): boolean {
		const xLimit = DrawableClass.canvasElem.width;
		const yLimit = DrawableClass.canvasElem.height;

		return this.currPoints.every(pt => {
			const { x, y } = pt;
			return x >= 0 && x < xLimit && y >= 0 && y <= yLimit;
		});
	}

	// TODO: make this a property, & invokes function instead
	// made the mistake of doing if (isHidden) --> which is always true
	protected isHidden(): boolean {
		const xLimit = DrawableClass.canvasElem.width;
		const yLimit = DrawableClass.canvasElem.height;

		return this.currPoints.every(pt => {
			const { x, y } = pt;
			return x < 0 || x > xLimit || y < 0 || y > yLimit;
		});
	}
	protected getBounds() {
		let leftBound: number;
		let rightBound: number;
		let upperBound: number;
		let lowerBound: number;

		this.currPoints.forEach((pt, i) => {
			const { x, y } = pt;
			// Set default:
			if (i === 0) {
				leftBound = rightBound = x;
				upperBound = lowerBound = y;
			} else {
				leftBound = Math.min(leftBound, x);
				rightBound = Math.max(rightBound, x);
				upperBound = Math.min(upperBound, y);
				lowerBound = Math.max(lowerBound, y);
			}
		});

		/**
		 * WEIRD ERROR: Variable 'leftBound' is used before being assigned
		 */
		return {
			// @ts-ignore
			leftBound,
			// @ts-ignore
			rightBound,
			// @ts-ignore
			upperBound,
			// @ts-ignore
			lowerBound,
		};
	}
}

export default DrawableClass;
