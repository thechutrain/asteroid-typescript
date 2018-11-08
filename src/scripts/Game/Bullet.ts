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

	/** NOTE: since getInitVelocity gets invoked from the abstract class's constructor,
	 * hard to pass in arguments / options (escape hatch, where you pass in options)
	 */
	// ?? question of defining type inline here:
	// public getInitVelocity(options: { bulletSpeed?: number }): VelocityModel {
	public getInitVelocity(options: any): VelocityModel {
		if (!options.velocity) {
			throw new Error(
				'Initial Velocity of Spaceship must be supplied as argument for Bullet Class',
			);
		}
		// Assume starting velocity here is the spaceship's velocity,
		// so we'll need to get the bullet's default speed & spaceship's offset & add that to the ship's velocity:
		// const startingVelocity = deepClone(this.velocity);

		// ?? if I make a statement here: "this.newProperty = 'b'" --> on Bullet obj I assume, not the drawableClass object.
		debugger;
		const bulletSpeed = Bullet.defaultSettings.bulletSpeed;
		const translateX = bulletSpeed * Math.sin((Math.PI * this.offSet) / 180);
		const translateY = bulletSpeed * Math.cos((Math.PI * this.offSet) / 180);
		this.velocity.translateX += translateX;
		this.velocity.translateY += translateY;

		return {
			translateX: 0,
			translateY: 0,
			rotation: 0,
		};
	}
}
