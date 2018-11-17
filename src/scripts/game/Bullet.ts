import DrawableClass from './DrawableClass';
import { deepClone, extend } from '../utils';

export class Bullet extends DrawableClass {
	static defaultSettings = {
		bulletSpeed: 11,
		rSize: 0, // Not applicable for bullet (perhaps shouldnt be in abstract class?)
	};

	constructor(bulletArgs: BulletArguments) {
		super(extend(Bullet.defaultSettings, bulletArgs));
	}

	// TODO: use velocity to get new origin point
	public calcPoints(ticks: number): PointModel[] {
		this.origin.x += this.velocity.translateX;
		this.origin.y -= this.velocity.translateY; // subtract, because canvas coordinates have inverted y-axis

		// Update the currentPoints
		this.currPoints = [this.origin];

		if (this.isHidden()) {
			this.isActive = false;
		}

		return this.currPoints;
	}

	public drawPoints(): boolean {
		if (!this.isActive) {
			return false;
		}
		const ctx = DrawableClass.gameRef.ctx;

		ctx.save();
		ctx.strokeStyle = this.strokeStyle;
		ctx.beginPath();
		ctx.arc(this.origin.x, this.origin.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.restore();

		return true;
	}

	public getInitOrigin(options: any): PointModel {
		if (!options.origin) {
			throw new Error(
				'Initial Origin must be supplied as argument for Bullet Class',
			);
		}
		return options.origin;
	}

	/** NOTE: since getInitVelocity gets invoked from the abstract class's constructor,
	 * hard to pass in arguments / options (escape hatch, where you pass in options)
	 */

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
