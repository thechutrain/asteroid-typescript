import DrawableClass from './DrawableClass';
import { deepClone, extend } from '../Utils';

interface BulletArgsModel {
	origin: PointModel;
	velocity: VelocityModel;
	offSet: number;
}

// TODO: add static default class properties (color, size etc.)
const defaultSettings = extend(DrawableClass.defaultSettings, {
	fillColor: 'white',
	bulletSpeed: 11,
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
		this.origin.x += this.velocity.translateX;
		this.origin.y -= this.velocity.translateY;

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

		const startingVelocity = deepClone(options.velocity); // defensive coding, repeated clone
		const magnitude = (startingVelocity.magnitude =
			Bullet.defaultSettings.bulletSpeed);

		const translateX = magnitude * Math.sin((Math.PI * options.offSet) / 180);
		const translateY = magnitude * Math.cos((Math.PI * options.offSet) / 180);

		startingVelocity.translateX = translateX;
		startingVelocity.translateY = translateY;

		return startingVelocity;
	}
}
