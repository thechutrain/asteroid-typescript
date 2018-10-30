interface DrawableClassArguments {
	currPoints?: PointModel[];
	isActive?: boolean;
	onScreen?: boolean;
}

/**
 * could put various other properties on DrawableClass: origin, rSize?
 */
abstract class DrawableClass {
	currPoints: PointModel[];
	onScreen: boolean;

	static gameRef = (<any>window).Game;

	constructor(options: DrawableClassArguments = {}) {
		/** NOTE: this is necessary, because there's a race condition where
		 * this abstract class may be created prior to the Game creation
		 */
		if (!DrawableClass.gameRef) {
			DrawableClass.gameRef = (<any>window).Game;
		}
		this.currPoints = options.currPoints || [];
		this.onScreen = this.isVisible();
	}

	protected isVisible(): boolean {
		const xLimit = DrawableClass.gameRef.canvasElem.width;
		const yLimit = DrawableClass.gameRef.canvasElem.height;

		return this.currPoints.every(pt => {
			const { x, y } = pt;
			return x >= 0 && x < xLimit && y >= 0 && y <= yLimit;
		});
	}

	protected isHidden(): boolean {
		const xLimit = DrawableClass.gameRef.canvasElem.width;
		const yLimit = DrawableClass.gameRef.canvasElem.height;

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

	public abstract calcPoints(ticks: number): PointModel[];
	public abstract drawPoints(): void;
}

export default DrawableClass;
