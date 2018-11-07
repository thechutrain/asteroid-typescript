import DrawableClass from './DrawableClass';

interface BulletArgsModel {
	origin: PointModel;
	offSet: number;
}

// TODO: add static default class properties (color, size etc.)
const defaultSettings = {
	fillColor: 'white',
};

export class Bullet extends DrawableClass {
	static defaultSettings = defaultSettings;

	// ??: instead of passing in specific k:v --> pass in the spaceship ref
	constructor(bulletArgs: BulletArgsModel) {
		const demoV = {
			translateX: 4,
			translateY: 3,
			rotation: 0,
		};

		// NOTE: What if I call getInitVelocity before super? b/c if I let the parent class call t
		super({ origin: bulletArgs.origin, velocity: demoV });
	}

	// TODO: use velocity to get new origin point
	public calcPoints(ticks: number): PointModel[] {
		return [this.origin];
	}

	public drawPoints(): void {
		const ctx = DrawableClass.gameRef.ctx;

		ctx.save();
		ctx.strokeStyle = 'white';
		ctx.beginPath();
		ctx.arc(this.origin.x, this.origin.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.restore();
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
