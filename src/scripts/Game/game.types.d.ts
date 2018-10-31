interface PointModel {
	x: number;
	y: number;
}

interface VelocityModel {
	translateX: number;
	translateY: number;
	rotation: number; // rotation that changes the offSet
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
