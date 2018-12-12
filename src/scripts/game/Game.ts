import { extend, deepClone } from '../utils';
import { initAsteroidFactory, Asteroid } from './Asteroid';
import { initSpaceshipFactory, Spaceship } from './Spaceship';
import { Bullet } from './Bullet';
// import { fakeJquery as $ } from '../utils/fakeJquery';
import fakeJquery from '../utils/fakeJquery';

import {
	AsteroidArguments,
	GameArguments,
	PointModel,
	IEmitEventsArgs,
} from './game.types';

const defaultSettings = {
	// Game Rendering
	tickLength: 50, // ms time in between frames
	numTicksBeforePausing: 5,
	firingDelay: 300,

	// DOM related settings
	canvasSelector: '#bg-canvas',
	scoreSelector: '#score-counter',
	livesSelector: '#lives-counter',
	startGameSelector: '.screen-overlay--starting',
	pauseGameSelector: '.screen-overlay--paused',
	gameOverSelector: '.screen-overlay--gameover',

	// Game Settings
	startingLives: 2,
	maxChildAsteroids: 2,
	maxAsteroids: process.env.DEBUGGER ? 2 : 15,
};

interface IRequiredGameOptionsModel {
	tickLength: number; // ms times in between frames
	numTicksBeforePausing: number;
	maxAsteroids: number;
	maxChildAsteroids: number; // max depth level of the child asteroids
	asteroidDelay: number; // delay in creating asteroid, from last creation
	firingDelay: number; // minimum time between fired bullets
	startingLives: number;
	// DOM related settings
	canvasSelector: string;
	scoreSelector: string;
	livesSelector: string;
	startGameSelector: string;
	pauseGameSelector: string;
	gameOverSelector: string;
}

class Game {
	public settings: IRequiredGameOptionsModel;
	// DOM related properties:
	public canvasElem: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D;
	// scoreElem: HTMLElement | null;
	// Question: annoying, do I have to always check if its null down the line?
	public scoreElem: HTMLElement | null;
	public livesElem: HTMLElement | null;
	public startGameElem: HTMLElement | null;
	public pauseGameElem: HTMLElement | null;
	public gameOverElem: HTMLElement | null;

	public lastRender: number;
	public initialized: boolean = false;
	public gameOver: boolean = false;
	public isActive: boolean;

	// Drawable Items:
	public asteroids: Asteroid[] = [];
	public pendingAsteroids: Map<number, Promise<Asteroid>> = new Map();
	public bullets: Bullet[] = [];
	public spaceship: Spaceship | Promise<Spaceship> | null = null;

	// Status
	public canFire: boolean = true;
	public isFiring: boolean = false;
	public lives: number;
	public score: number;

	public makeAsteroid: (
		asteroidOptions?: AsteroidArguments,
		minDelay?: number,
		blnForce?: boolean,
	) => Promise<Asteroid>;

	public makeSpaceship: (delay: number) => Promise<Spaceship>;

	constructor(optionalSettings?: GameArguments) {
		// NOTE: need to save Game to window prior to creating anything that inherits from the DrawableClass, since it needs a refers to the Game's canvasElem property
		// TODO: investigate this weird code smell
		(window as any).Game = this;

		this.settings = extend(defaultSettings, optionalSettings);
		this.canvasElem = document.querySelector(
			this.settings.canvasSelector,
		) as HTMLCanvasElement;
		this.ctx = this.canvasElem.getContext('2d') as CanvasRenderingContext2D;

		// Note: not getting "All", just the first element
		this.scoreElem = document.querySelector(this.settings.scoreSelector);
		this.livesElem = document.querySelector(this.settings.livesSelector);
		this.startGameElem = document.querySelector(
			this.settings.startGameSelector,
		);
		this.pauseGameElem = document.querySelector(
			this.settings.pauseGameSelector,
		);
		this.gameOverElem = document.querySelector(this.settings.gameOverSelector);

		// TODO: add spaceship factory here

		// Dynamic properties:
		this.lastRender = window.performance.now();
		this.isActive = false;

		// Factory:
		this.makeAsteroid = initAsteroidFactory();
		this.makeSpaceship = initSpaceshipFactory();

		// Game Score:
		this.lives = this.settings.startingLives;
		this.score = 0;

		this.preInit();
	}

	public preInit() {
		this.isActive = true;
		// NOTE: Do I need to validate that I've selected DOM elements here?
		// Perhaps, check that we've selected things since its possible to select for elements that aren't on the dom
		const domList = [
			this.scoreElem,
			this.livesElem,
			this.startGameElem,
			this.gameOverElem,
		];

		domList.forEach((elem: any) => {
			if (elem === null) {
				throw new Error('Null element');
			}
		});

		// Set canvas size & context:
		this.canvasElem.width = window.innerWidth;
		this.canvasElem.height = window.innerHeight;

		// Update Score
		this.updateScore();

		if (!process.env.DEBUGGER) {
			// Start looping of our game:
			window.requestAnimationFrame(this.loop.bind(this));
		}
	}

	public init() {
		this.initialized = true;

		if (this.startGameElem === null) {
			throw new Error(
				`startGameElem is null, check to make sure it's been properly selected`,
			);
		}

		// Hide the home screen
		fakeJquery.addClass(this.startGameElem, 'hidden');

		// Reset all the asteroids
		this.asteroids = [];
	}

	public loop(timeStamp: number = this.lastRender) {
		if (!this.isActive) return;

		// RequestAnimationFrame as first line, good practice as per se MDN
		window.requestAnimationFrame(this.loop.bind(this));

		this.updateScore();
		// Determine numTicks & if enough time has passed to proceed:
		const { tickLength, numTicksBeforePausing } = this.settings;
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

	public createFrame(numTicks: number) {
		// TODO: Separate this out into preinit mode & init mode

		// Create Asteroid/Promise<Asteroid>:
		const activeAsteroids = this.asteroids.length;
		const pendingAsteroids = this.pendingAsteroids.size;

		// check if we should make a promised asteroid
		if (activeAsteroids + pendingAsteroids < this.settings.maxAsteroids) {
			const asteroidPromise = this.makeAsteroid({}, 2000);
			this._registerPromisedAsteroid(asteroidPromise);
		}

		// MAKING SPACESHIP:
		if (!this.spaceship && this.initialized) {
			this.spaceship = this.makeSpaceship(200);
			this.spaceship.then((spaceship: Spaceship) => {
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

	public calcAllPoints(numTicks: number) {
		// if (!(this.spaceship instanceof Spaceship)) {
		if (this.spaceship instanceof Spaceship) {
			this.spaceship.calcPoints(numTicks);
		}

		this.asteroids = this.asteroids.filter((asteroid: Asteroid) => {
			if (asteroid instanceof Asteroid && asteroid.isActive) {
				asteroid.calcPoints(numTicks);
				return true;
			}
			return !(asteroid instanceof Asteroid);
		});

		this.bullets = this.bullets.filter((bullet: Bullet) => {
			if (bullet.isActive) {
				bullet.calcPoints(numTicks);
			}
			return bullet.isActive;
		});
	}

	public processCollisions() {
		// Check for any asteroid & bullet collisions
		this.asteroids.forEach((asteroid: Asteroid) => {
			// TODO: Optimized VERSION --> clear cached bound values of asteroid, & get current bounds:

			if (!(asteroid instanceof Asteroid)) return;

			// Check bullet & asteroid collisions:
			this.bullets.forEach((bullet: Bullet) => {
				const asteroidHit = asteroid.containsPoint(bullet.currPoints[0]);
				if (asteroidHit) {
					// const clone = Asteroid.clone(asteroid);
					// this.asteroids.push(clone);

					// asteroid.isActive = false;
					// bullet.isActive = false;

					// IDEA: passs in asteroid & bullet in this eventEmitter?
					this.emitEvent(GameEvents.asteroid_hit, { asteroid, bullet });
				}
			});

			// Check spaceship & asteroid collisions:
			if (this.spaceship instanceof Spaceship && this.spaceship.isActive) {
				this.spaceship.currPoints.forEach((pt: PointModel) => {
					// NOTE: this collision detection can be more finely tuned, by looking at the intersections of the line segments on the asteroid pts & spaceship pts. May encounter edge cases in current detection as Ship size increases
					const shipHit = asteroid.containsPoint(pt);
					if (shipHit) {
						asteroid.isActive = false;
						// @ts-ignore
						this.spaceship.isActive = false;
						this.emitEvent(GameEvents.spaceship_hit);
					}
				});
			}
		});
	}

	public drawAllPoints() {
		// Clear the box:
		this.ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);

		// Draw new points for all items:
		if (this.spaceship instanceof Spaceship && this.spaceship.isActive) {
			this.spaceship.drawPoints();
		}

		this.asteroids = this.asteroids.filter((asteroid: Asteroid) => {
			// Note: filters true for active Asteroids or implied Promise
			if (asteroid instanceof Asteroid && asteroid.isActive) {
				asteroid.drawPoints();
				return true;
			}
			return !(asteroid instanceof Asteroid);
		});
		// // Any asteroid whose's points can't be drawn (not active) will be filtered out
		// this.asteroids = this.asteroids.filter(asteroid => asteroid.drawPoints());

		this.bullets = this.bullets.filter((bullet: Bullet) => {
			if (bullet.isActive) {
				bullet.drawPoints(); // drawPoints also checks if its Active, dont know where it would be better
			}
			return bullet.isActive;
		});
	}

	/**
	 * Registers promised asteroids into pending Map w./ random number
	 * Removes pending Asteroid from map once resolved
	 *
	 * @param asteroidPromise
	 */
	public _registerPromisedAsteroid(asteroidPromise: Promise<Asteroid>) {
		let keyNum = Math.floor(Math.random() * 10000);
		while (this.pendingAsteroids.get(keyNum)) {
			keyNum = Math.floor(Math.random() * 10000);
		}

		// Registers Asteroid:
		this.pendingAsteroids.set(keyNum, asteroidPromise);

		// Adds Asteroid to array & removes from pending Map:
		asteroidPromise.then((asteroid: Asteroid) => {
			// Add asteroid to official asteroid array:
			this.asteroids.push(asteroid);

			// Remove pending promise from asteroid map:
			this.pendingAsteroids.delete(keyNum);
		});
	}

	public fireBullet() {
		// Check if there is a spaceship ship first
		if (!(this.spaceship instanceof Spaceship)) {
			return;
		}
		if (!this.spaceship.isActive) {
			return;
		}

		if (!this.spaceship.currPoints.length) {
			return;
		}

		if (this.isFiring && this.canFire) {
			this.canFire = false;
			/**
			 * NOTES: two thoughts here, the bullet needs to eventually know the origin to start at or the velocity
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

			setTimeout(() => {
				this.canFire = true;
			}, this.settings.firingDelay);
		}
	}

	public updateScore(options: { score?: number; lives?: number } = {}) {
		let updateAll = false;
		if (Object.keys(options).length === 0) {
			updateAll = true;
		}

		if (updateAll || options.lives) {
			if (this.livesElem === null) {
				throw new Error(`Dom element for this.livesElem is null`);
			}
			if (this.lives < 0) {
				this.livesElem.innerHTML = '--';
			} else {
				this.livesElem.innerHTML = `${options.lives || this.lives}`;
			}
		}
		if (updateAll || options.score) {
			if (this.scoreElem === null) {
				throw new Error(`Dom element for this.scoreElem is null`);
			}
			this.scoreElem.innerHTML = `${options.score || this.score}`;
		}
	}

	public emitEvent(eventName: GameEvents, overload: IEmitEventsArgs = {}) {
		switch (eventName) {
			case GameEvents.debug_next_frame:
				if (process.env.DEBUGGER) {
					this.createFrame(1);
				}
				break;
			case GameEvents.right_on:
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.turningRight = true;
				}
				break;
			case GameEvents.right_off:
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.turningRight = false;
				}
				break;
			case GameEvents.left_on:
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.turningLeft = true;
				}
				break;
			case GameEvents.left_off:
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.turningLeft = false;
				}
				break;
			case GameEvents.fire_on:
				this.isFiring = true;
				break;
			case GameEvents.fire_off:
				this.isFiring = false;
				break;
			case GameEvents.throttle_on:
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.throttleOn();
				}
				break;
			case GameEvents.throttle_off:
				if (this.spaceship instanceof Spaceship) {
					this.spaceship.throttleOff();
				}
				break;
			case GameEvents.asteroid_hit:
				const { asteroid, bullet } = overload;
				if (!asteroid) {
					throw new Error(
						'Must have an Asteroid, to emit "asteroid-hit" event',
					);
				}
				if (!bullet) {
					throw new Error(
						'Must have an Asteroid, to emit "asteroid-hit" event',
					);
				}
				asteroid.isActive = false;
				bullet.isActive = false;

				this.score += asteroid.scoreValue;
				this.updateScore({
					score: this.score,
				});

				// Create a child Asteroid
				// TODO: create static asteroid method, takes in parent asteroid, #num of child asteroids
				// returns --> array of asteroids
				const childrenAsteroids = Asteroid.makeChild(
					asteroid,
					this.settings.maxChildAsteroids,
				);

				if (childrenAsteroids.length) {
					this.asteroids = this.asteroids.concat(childrenAsteroids);
				}

				break;
			case GameEvents.spaceship_hit:
				this.lives = this.lives -= 1;
				this.updateScore({
					lives: this.lives,
				});

				// Generate new spaceship
				if (this.lives >= 0) {
					this.spaceship = this.makeSpaceship(200);
					this.spaceship.then((spaceship: Spaceship) => {
						// Replace the promised Spaceship, with the real spaceship
						this.spaceship = spaceship;
					});
				} else {
					this.emitEvent(GameEvents.game_over);
				}
				break;
			case GameEvents.toggle_pause:
				if (!this.pauseGameElem) {
					throw new Error(`No pauseGameElem`);
				}

				// TODO: check if the pause is on or not:
				if (this.isActive) {
					// remove hidden class on paused
					fakeJquery.removeClass(this.pauseGameElem, 'hidden');
				} else {
					// put a hidden clase on paused
					fakeJquery.addClass(this.pauseGameElem, 'hidden');
				}
				this.isActive = !this.isActive;
				if (this.isActive) {
					this.loop();
				}
				break;
			case GameEvents.game_over:
				// TODO: Check highscores
				// this.isActive = false;
				this.gameOver = true;
				if (this.gameOverElem === null) {
					throw new Error(`No gameOverElem`);
				}

				fakeJquery.removeClass(this.gameOverElem, 'hidden');
				break;
			default:
				throw new Error(`Cannot emit event: ${eventName}`);
		}
	}
}

export enum GameEvents {
	debug_next_frame = 'debug:next-frame',
	right_on = 'right-on',
	right_off = 'right-off',
	left_on = 'left-on',
	left_off = 'left-off',
	fire_on = 'fire-on',
	fire_off = 'fire-off',
	throttle_on = 'throttle-on',
	throttle_off = 'throttle-off',
	asteroid_hit = 'asteroid-hit',
	spaceship_hit = 'spaceship-hit',
	toggle_pause = 'toggle-pause',
	game_over = 'game_over',
}

export default Game;
