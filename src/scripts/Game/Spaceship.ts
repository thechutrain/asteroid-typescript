import DrawableClass from './DrawableClass';

export class Spaceship extends DrawableClass {
	gameRef: any;
	thrustersOn: boolean;
	turningRight: boolean;
	turningLeft: boolean;
	throttleTimer: any;
	isFiring: boolean;

	static settings = {
		maxSpeed: 9,
		minThrust: 3,
		rotationSpeed: 8,
		acceleration: 1,
		rSize: 25, // controls the size of the spaceship
	};

	constructor(shipOptions: SpaceshipArgsModel = {}) {
		super(shipOptions);
		this.thrustersOn = false;
		this.turningRight = false;
		this.turningLeft = false;
		this.isFiring = false;
		this.throttleTimer;
		this.velocity;
	}
	getInitOrigin(options: any): PointModel {
		const x = Math.floor(DrawableClass.gameRef.canvasElem.width / 2);
		const y = Math.floor(DrawableClass.gameRef.canvasElem.height / 2);
		return { x, y };
	}
	getInitVelocity(options: any): VelocityModel {
		return { translateX: 0, translateY: 0, rotation: 0 };
	}
	public calcPoints(ticks: number): PointModel[] {
		if (!this.isActive) return [];

		this.velocity = this.calcVelocity(ticks);

		// Determine 3 points of triangle here:
		const h = 2 * Spaceship.settings.rSize * Math.cos((Math.PI * 30) / 180);

		const angle1 = this.offSet;
		const x1 = this.origin.x - (Math.sin((Math.PI * angle1) / 180) * h) / 2;
		const y1 = this.origin.y - (Math.cos((Math.PI * angle1) / 180) * h) / 2;

		const angle2 = this.offSet + 60;
		const x2 = this.origin.x + (Math.sin((Math.PI * angle2) / 180) * h) / 2;
		const y2 = this.origin.y + (Math.cos((Math.PI * angle2) / 180) * h) / 2;

		const angle3 = this.offSet - 60;
		const x3 = this.origin.x + (Math.sin((Math.PI * angle3) / 180) * h) / 2;
		const y3 = this.origin.y + (Math.cos((Math.PI * angle3) / 180) * h) / 2;

		this.currPoints = [];
		this.currPoints.push({
			x: x1,
			y: y1,
		});
		this.currPoints.push({
			x: x2,
			y: y2,
		});
		this.currPoints.push({
			x: x3,
			y: y3,
		});

		if (!this.onScreen && this.isVisible()) {
			this.onScreen = true;
		} else if (this.isHidden()) {
			this.onScreen = false;
			this.reframe();
		}

		return this.currPoints;
	}
	public drawPoints(): void {
		if (!this.isActive) {
			return;
		}

		const ctx = DrawableClass.gameRef.ctx;

		// Draw the main triangle
		ctx.globalCompositeOperation = 'source-over';
		ctx.save();
		ctx.fillStyle = 'black';
		ctx.beginPath();
		this.currPoints.forEach((pt, i) => {
			// Draw points:
			if (i === 0) {
				ctx.moveTo(pt.x, pt.y);
			} else {
				ctx.lineTo(pt.x, pt.y);
			}
		});
		ctx.closePath();
		ctx.fill();
		ctx.restore();

		// Draw the opaque bottom triangle
		ctx.globalCompositeOperation = 'destination-out';
		ctx.beginPath();
		ctx.moveTo(this.origin.x, this.origin.y);
		ctx.lineTo(this.currPoints[1].x, this.currPoints[1].y);
		ctx.lineTo(this.currPoints[2].x, this.currPoints[2].y);
		ctx.closePath();
		ctx.fill();
		ctx.globalCompositeOperation = 'source-over';
	}

	private reframe() {}

	private calcVelocity(ticks: number): VelocityModel {
		let { magnitude, translateX, translateY, rotation } = this.velocity;

		// Get the Magnitude:
		if (this.thrustersOn) {
			if (!magnitude || magnitude < Spaceship.settings.minThrust) {
				magnitude = Spaceship.settings.minThrust;
			} else {
				magnitude += ticks * Spaceship.settings.acceleration;
				magnitude = Math.min(magnitude, Spaceship.settings.maxSpeed);
			}
		}
		// TODO: add a throttleOff here??

		// get the Rotation && apply to offSet
		if (this.turningLeft && !this.turningRight) {
			rotation = ticks * Spaceship.settings.rotationSpeed;
		} else if (!this.turningLeft && this.turningRight) {
			rotation = -1 * ticks * Spaceship.settings.rotationSpeed;
		} else {
			rotation = 0;
		}
		this.offSet += rotation;

		// get the X & Y translation
		if (magnitude && magnitude > 0) {
			translateX = magnitude * Math.sin((Math.PI * this.offSet) / 180);
			translateY = magnitude * Math.cos((Math.PI * this.offSet) / 180);
		} else {
			translateX = 0;
			translateY = 0;
		}

		return {
			magnitude,
			translateX,
			translateY,
			rotation,
		};
	}
}

// export function initSpaceshipFactory(): () => Spaceship {
// 	return () => new Spaceship();
// }

export function initSpaceshipFactory(): () => Promise<Spaceship> {
	return (delay: number = 1000) => {
		return new Promise(resolve => {
			setTimeout(() => {
				console.log('resolving promise');
				resolve(new Spaceship());
			}, delay);
		});
	};
}
