interface PointModel {
	x: number;
	y: number;
}

interface VelocityModel {
	magnitude?: number; // total magnitude, if supplied --> used to calc x & y
	translateX: number;
	translateY: number;
	rotation: number; // rotation that changes the offSet, Zero if no rotation
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

// TODO: add consistent naming
interface DrawableClassArguments {
	currPoints?: PointModel[];
	isActive?: boolean;
	onScreen?: boolean;
	origin?: PointModel;
	offSet?: number;
	velocity?: VelocityModel;
}

interface SpaceshipArgsModel extends DrawableClassArguments {
	invincible?: boolean;
}
