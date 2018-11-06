import DrawableClass from './DrawableClass';

interface BulletArgsModel {
	origin: PointModel;
	offSet: number;
}

export class Bullet extends DrawableClass {
	// TODO: add static default class properties (color, size etc.)

	constructor(bulletArgs: BulletArgsModel) {
		debugger;
		const demoV = {
			translateX: 4,
			translateY: 3,
			rotation: 0,
		};
		super({ origin: bulletArgs.origin, velocity: demoV });
	}

	// TODO: use velocity to get new origin point
	public calcPoints(ticks: number): PointModel[] {
		return [this.origin];
	}

	// TODO: use fill to
	public drawPoints(): void {
		return;
	}
	public getInitOrigin(options: any): PointModel {
		if (!this.origin) {
			throw new Error(
				'Initial Origin must be supplied as argument for Bullet Class',
			);
		}
		return this.origin;
	}
	public getInitVelocity(options: any): VelocityModel {
		if (!this.velocity) {
			throw new Error(
				'Initial Velocity must be supplied as argument for Bullet Class',
			);
		}
		return this.velocity;
	}
}
