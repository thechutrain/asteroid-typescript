interface PointModel {
	x: number;
	y: number;
}

interface DrawableModel {
	currPoints: PointModel[];
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
