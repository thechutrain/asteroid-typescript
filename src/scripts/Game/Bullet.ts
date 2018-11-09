import DrawableClass from './DrawableClass';
import { deepClone } from '../Utils';

interface BulletArgsModel {
	origin: PointModel;
	velocity: VelocityModel;
	offSet: number;
}

// TODO: add static default class properties (color, size etc.)
const defaultSettings = {
	fillColor: 'white',
	bulletSpeed: 10,
	offSet: 4, // TESTING
});

export class Bullet extends DrawableClass {
	static defaultSettings = defaultSettings;

	constructor(bulletArgs: BulletArgsModel) {
		super({
			origin: bulletArgs.origin,
			velocity: bulletArgs.velocity,
			offSet: bulletArgs.offSet,
		});
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
		const startingVelocity = deepClone(options.velocity);

		// ?? if I make a statement here: "this.newProperty = 'b'" --> on Bullet obj I assume, not the drawableClass object.
		/**
		 *
		 */
		const parentOffset = DrawableClass.defaultSettings.offSet; // 0
		const currOffset = Bullet.defaultSettings.offSet; // 4
		debugger;

		const bulletSpeed = Bullet.defaultSettings.bulletSpeed;
		const offSet = options.offSet || this.offSet; // fallback, if offSet has already been put on obj

		const translateX = bulletSpeed * Math.sin((Math.PI * offSet) / 180);
		const translateY = bulletSpeed * Math.cos((Math.PI * offSet) / 180);
		startingVelocity.translateX += translateX;
		startingVelocity.translateY += translateY;

		return startingVelocity;
	}
}
