import { extend } from '../utils';
import { initAsteroidFactory, Asteroid } from './Asteroid';
import { initSpaceshipFactory, Spaceship } from './Spaceship';
import { Bullet } from './Bullet';
import { deepClone } from '../Utils';

const gameOptions = {
	tickLength: 50, // ms time in between frames
	numTicksBeforePausing: 5,
	maxAsteroids: 1,
	maxChildAsteroids: 2,
	asteroidDelay: 3 * 1000,
	firingDelay: 300,
	canvasIdSelector: 'bg-canvas',
};

interface GameOptionsModel {
	tickLength?: number; // ms times in between frames
	numTicksBeforePausing?: number;
	maxAsteroids?: number;
	maxChildAsteroids?: number; // max depth level of the child asteroids
	asteroidDelay?: number; // delay in creating asteroid, from last creation
	firingDelay?: number; // minimum time between fired bullets
	canvasIdSelector: string; // id selector for canvas element
}

interface RequiredGameOptionsModel {
	tickLength: number; // ms times in between frames
	numTicksBeforePausing: number;
	maxAsteroids: number;
	maxChildAsteroids: number; // max depth level of the child asteroids
	asteroidDelay: number; // delay in creating asteroid, from last creation
	firingDelay: number; // minimum time between fired bullets
	canvasIdSelector: string; // id selector for canvas element
}

class Game {
	options: RequiredGameOptionsModel;
	canvasElem: HTMLCanvasElement;
	ctx: any;
	lastRender: number;
	isActive: boolean;
	asteroids: Asteroid[];
	makeAsteroid: (blnForce?: boolean, asteroidOptions?: Object) => Asteroid[];
	spaceship: Spaceship | Promise<Spaceship> | null;
	makeSpaceship: (delay: number) => Promise<Spaceship>;
	canFire: boolean;
	isFiring: boolean;
	bullets: Bullet[];

	constructor(options: GameOptionsModel = gameOptions) {
		// NOTE: need to save Game to window prior to creating anything that inherits from the DrawableClass, since it needs a refers to the Game's canvasElem property
		(<any>window).Game = this;

		this.options = extend(options);
		this.canvasElem = <HTMLCanvasElement>(
			document.getElementById(this.options.canvasIdSelector)
		);
		this.ctx;

		// Factory:
		this.makeAsteroid = initAsteroidFactory();
		this.makeSpaceship = initSpaceshipFactory();
		// TODO: add spaceship factory here

		// Dynamic properties:
		this.lastRender = window.performance.now();
		this.isActive = true;
		this.isFiring = false;
		this.canFire = true;
		this.asteroids = [];
		this.spaceship = null;
		this.bullets = [];

		this.init();
	}

	init() {
		// Select canvas from DOM
		const { canvasIdSelector } = this.options;
		// this.canvasElem = <HTMLCanvasElement>(
		// 	document.getElementById(canvasIdSelector)
		// );
		if (!this.canvasElem) {
			throw new Error(`No DOM element with id of "${canvasIdSelector}" found.`);
		}

		// Set canvas size & context:
		this.canvasElem.width = window.innerWidth;
		this.canvasElem.height = window.innerHeight;
		this.ctx = this.canvasElem.getContext('2d');

		// Start looping of our game:
		window.requestAnimationFrame(this.loop.bind(this));
	}

	loop(timeStamp = this.lastRender) {
		if (!this.isActive) return;

		// RequestAnimationFrame as first line, good practice as per se MDN
		window.requestAnimationFrame(this.loop.bind(this));

		// Determine numTicks & if enough time has passed to proceed:
		const { tickLength, numTicksBeforePausing } = this.options;
		const nextTick = this.lastRender + tickLength;
		const timeSinceTick = timeStamp - this.lastRender;
		const numTicks = Math.floor(timeSinceTick / tickLength);

		// Check if render is too early
		if (timeStamp < nextTick) {
			return false;
		}

		// Only render a new frame if its been a few ticks (to avoid jumping)
		if (numTicks < numTicksBeforePausing) {
			this.createFrame(numTicks);
		}
		this.lastRender = timeStamp;
	}

	createFrame(numTicks: number) {
		// Check if you have the make asteroids or not:
		// TODO: build out logic for when I make a new asteroid
		if (this.asteroids.length < 3) {
			this.asteroids = this.asteroids.concat(this.makeAsteroid());
		}

		if (!this.spaceship) {
			this.spaceship = this.makeSpaceship(200);
			this.spaceship.then(spaceship => {
				// Replace the promised Spaceship, with the real spaceship
				this.spaceship = spaceship;
			});
		}

		// TODO: fire bullet
		this.fireBullet();

		// MAIN GAME LOGIC:
		// i) calculate points of all objects
		this.calcAllPoints(numTicks);
		// TODO:
		// ii) look for collisions asteroids w./ spaceship && asteroid w./ bullets
		this.processCollisions();
		// iii) render the updated points & objects:
		this.drawAllPoints();
	}

	calcAllPoints(numTicks: number) {
		// if (!(this.spaceship instanceof Spaceship)) {
		if (this.spaceship instanceof Spaceship) {
			this.spaceship.calcPoints(numTicks);
		}

		this.asteroids.forEach(asteroid => {
			if (asteroid.isActive) {
				asteroid.calcPoints(numTicks);
			}
		});

		this.bullets = this.bullets.filter(bullet => {
			bullet.calcPoints(numTicks);
			return bullet.isActive;
		});
	}

	drawAllPoints() {
		// Clear the box:
		this.ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);

		// Draw new points for all items:
		if (this.spaceship instanceof Spaceship) {
			this.spaceship.drawPoints();
		}

		this.asteroids.forEach(asteroid => {
			if (asteroid.isActive) {
				asteroid.drawPoints();
			}
		});

		this.bullets = this.bullets.filter(bullet => {
			if (bullet.isActive) {
				bullet.drawPoints(); // drawPoints also checks if its Active, dont know where it would be better
			}
			return bullet.isActive;
		});
	}

	fireBullet() {
		if (this.isFiring && this.canFire && this.spaceship instanceof Spaceship) {
			this.canFire = false;
			/** NOTES: two thoughts here, the bullet needs to eventually know the origin to start at or the velocity
			 *  it would be nice if it was at a high-level where I just pass the Spaceship as an argument --> so the getters are all
			 *  internal to the bullet class.
			 *
			 * Alternative, is to create a method on Spaceship to get line of sight or something & pass that in. Require writing a method on Spaceship that returns current momentum line.
			 */

			this.bullets.push(
				new Bullet({
					origin: deepClone(this.spaceship.currPoints[0]),
					velocity: deepClone(this.spaceship.velocity),
					offSet: deepClone(this.spaceship.offSet),
				}),
			);

			console.log('FIRED BULLET');
			setTimeout(() => {
				this.canFire = true;
			}, this.options.firingDelay);
		}
	}

	processCollisions() {
		// Check for any asteroid & bullet collisions
		this.asteroids.forEach(asteroid => {
			// TODO: Optimized VERSION --> clear cached bound values of asteroid, & get current bounds:

			// Check bullet & asteroid collisions:
			this.bullets.forEach(bullet => {
				const asteroidHit = asteroid.containsPoint(bullet.currPoints[0]);
				if (asteroidHit) {
					asteroid.isActive = false;
					bullet.isActive = false;
					this.emitEvent('asteroid-hit');
				}
			});

			// Check spaceship & asteroid collisions:
			if (this.spaceship instanceof Spaceship) {
				this.spaceship.currPoints.forEach(pt => {
					// NOTE: this collision detection can be more finely tuned, by looking at the intersections of the line segments on the asteroid pts & spaceship pts. May encounter edge cases in current detection as Ship size increases
					const shipHit = asteroid.containsPoint(pt);
					if (shipHit) {
						asteroid.isActive = false;
						// @ts-ignore
						this.spaceship.isActive = false;
						this.emitEvent('spaceship-hit');
					}
				});
			}
		});
	}

	// TODO: make an enum of all the event names? --> help with the type hinting
	emitEvent(eventName: string) {
		switch (eventName) {
			case 'right-on':
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.turningRight = true;
				}
				break;
			case 'right-off':
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.turningRight = false;
				}
				break;
			case 'left-on':
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.turningLeft = true;
				}
				break;
			case 'left-off':
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.turningLeft = false;
				}
				break;
			case 'fire-on':
				this.isFiring = true;
				break;
			case 'fire-off':
				this.isFiring = false;
				break;
			case 'throttle-on':
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.throttleOn();
				}
				break;
			case 'throttle-off':
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.throttleOff();
				}
				break;
			case 'toggle-pause':
				this.isActive = !this.isActive;
				if (this.isActive) {
					this.loop();
				}
				break;
			case 'asteroid-hit':
				console.log('hit an asteroid!');
				break;
			case 'spaceship-hit':
				console.log('spaceship hit');
				break;
			default:
				throw new Error(`Cannot emit event: ${eventName}`);
		}
	}
}

export default Game;
