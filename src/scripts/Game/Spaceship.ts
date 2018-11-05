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
		minThrust: 3, // starting Magnitude of velocity as soon as throttleOn
		rotationSpeed: 8,
		acceleration: 1,
		deceleration: 0.9, // must be less than one
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

	public throttleOff(): any {
		this.thrustersOn = false;
	}
	public throttleOn(): any {
		this.thrustersOn = true;
	}

	/** ABSTRACT method implementations from DrawableClass*/

	getInitOrigin(options: any): PointModel {
		const x = Math.floor(DrawableClass.gameRef.canvasElem.width / 2);
		const y = Math.floor(DrawableClass.gameRef.canvasElem.height / 2);
		return { x, y };
	}

	getInitVelocity(options: any): VelocityModel {
		return { translateX: 0, translateY: 0, rotation: 0 };
	}

	// TODO: should this be abstracted & put on the drawableClass instead?
	/**
	 * calculates all the currPoints given the origin
	 * should get invoked after the origin has been transformed
	 */
	private calcPointsFromOrigin() {
		const h = Spaceship.settings.rSize;
		this.currPoints = [];
		for (let angle = 0; angle < 360; angle += 120) {
			const currAngle = ((angle + this.offSet) * Math.PI) / 180;
			const x = this.origin.x + Math.sin(currAngle) * h;
			const y = this.origin.y - Math.cos(currAngle) * h;
			this.currPoints.push({ x, y });
		}
	}

	public calcPoints(numTicks: number): PointModel[] {
		if (!this.isActive) return [];

		// Transform Origin:
		this.velocity = this.calcVelocity(numTicks);
		this.origin.x += this.velocity.translateX;
		this.origin.y -= this.velocity.translateY;

		this.calcPointsFromOrigin();

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

	private reframe() {
		const xLimit = DrawableClass.gameRef.canvasElem.width;
		const yLimit = DrawableClass.gameRef.canvasElem.height;
		let adjustXBy = 0;
		let adjustYBy = 0;

		// Determine left, right, top, bottom bounds of our shape:
		const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();

		// Determine X-axis adjustment:
		if (leftBound > xLimit) {
			adjustXBy = -1 * xLimit;
		} else if (rightBound < 0) {
			adjustXBy = Math.abs(leftBound) + xLimit;
		}

		// Determine y-axis adjustment:
		if (upperBound > yLimit) {
			adjustYBy = -1 * lowerBound;
		} else if (lowerBound < 0) {
			adjustYBy = Math.abs(upperBound) + yLimit;
		}

		this.origin.x += adjustXBy;
		this.origin.y += adjustYBy;

		this.calcPointsFromOrigin;
	}

	private calcVelocity(numTicks: number): VelocityModel {
		let { magnitude, translateX, translateY, rotation } = this.velocity;
		magnitude = magnitude || 0; // magnitude required for spaceship, since translateX & y are derived from it

		if (!this.thrustersOn) {
			// Case: Throttle is not on, slowly decrease speed
			if (magnitude > 1) {
				magnitude = magnitude * numTicks * Spaceship.settings.deceleration;
			} else {
				magnitude = 0;
			}
		} else {
			// Case: Throttle ON --> increase speed
			if (magnitude < Spaceship.settings.minThrust) {
				magnitude = Spaceship.settings.minThrust;
			} else {
				magnitude += Spaceship.settings.acceleration * numTicks;
				magnitude = Math.min(magnitude, Spaceship.settings.maxSpeed);
			}
		}

		// Get the Rotation && apply to offSet:
		if (this.turningLeft && !this.turningRight) {
			// Case: turning Left
			rotation = -1 * numTicks * Spaceship.settings.rotationSpeed;
		} else if (!this.turningLeft && this.turningRight) {
			// Case: turning Right
			rotation = numTicks * Spaceship.settings.rotationSpeed;
		} else {
			rotation = 0;
		}
		this.offSet += rotation;

		// Get the X & Y translation:
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
