import DrawableClass from './DrawableClass';

export class Spaceship extends DrawableClass {
	gameRef: any;
	thrustersOn: boolean;
	turningRight: boolean;
	turningLeft: boolean;
	throttleTimer: any;

	// static gameRef: Game;

	constructor(shipOptions: SpaceshipArgsModel = {}) {
		super(shipOptions);
		this.thrustersOn = false;
		this.turningRight = false;
		this.turningLeft = false;
		this.throttleTimer;
		this.velocity;
	}
	getInitOrigin(options: any): PointModel {
		return {
			x: 0,
			y: 0,
		};
		const width = Spaceship.gameRef.canvasElem.width;
		const height = Spaceship.gameRef.canvasElem.height;

		const x = Math.floor(Spaceship.gameRef.canvasElem.width / 2);
		const y = Math.floor(Spaceship.gameRef.canvasElem.height / 2);
		return { x, y };
	}
	getInitVelocity(options: any): VelocityModel {
		return { translateX: 0, translateY: 0, rotation: 0 };
	}
	public calcPoints(ticks: number): PointModel[] {
		throw new Error('Method not implemented.');
	}
	public drawPoints(): void {
		throw new Error('Method not implemented.');
	}
}

export function initSpaceshipFactory(): () => Spaceship {
	return () => new Spaceship();
}
