import { extend, deepClone } from '../utils';
import { initAsteroidFactory, Asteroid } from './Asteroid';
import { initSpaceshipFactory, Spaceship } from './Spaceship';
import { Bullet } from './Bullet';
// import { fakeJquery as $ } from '../utils/fakeJquery';
import fakeJquery from '../utils/fakeJquery';

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
	gameOverSelector: '.screen-overlay--gameover',

	// Game Settings
	startingLives: 0,
};

interface RequiredGameOptionsModel {
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
	gameOverSelector: string;
}

class Game {
	settings: RequiredGameOptionsModel;
	// DOM related properties:
	canvasElem: HTMLCanvasElement;
	ctx: any; // Is there a way to make this type more specific?
	// scoreElem: HTMLElement | null;
	// Question: annoying, do I have to always check if its null down the line?
	scoreElem: HTMLElement | null;
	livesElem: HTMLElement | null;
	startGameElem: HTMLElement | null;
	gameOverElem: HTMLElement | null;

	lastRender: number;
	initialized: boolean = false;
	gameOver: boolean = false;
	isActive: boolean;
	asteroids: Asteroid[];
	makeAsteroid: (blnForce?: boolean, asteroidOptions?: Object) => Asteroid[];
	spaceship: Spaceship | Promise<Spaceship> | null;
	makeSpaceship: (delay: number) => Promise<Spaceship>;
	canFire: boolean;
	isFiring: boolean;
	bullets: Bullet[];
	lives: number;
	score: number;

	constructor(optionalSettings?: GameOptionsModel) {
		// NOTE: need to save Game to window prior to creating anything that inherits from the DrawableClass, since it needs a refers to the Game's canvasElem property
		(<any>window).Game = this;

		this.settings = extend(defaultSettings, optionalSettings);
		this.canvasElem = <HTMLCanvasElement>(
			document.querySelector(this.settings.canvasSelector)
		);
		this.ctx;
		// Note: not getting "All", just the first element
		this.scoreElem = document.querySelector(this.settings.scoreSelector);
		this.livesElem = document.querySelector(this.settings.livesSelector);
		this.startGameElem = document.querySelector(
			this.settings.startGameSelector,
		);
		this.gameOverElem = document.querySelector(this.settings.gameOverSelector);

		// Factory:
		this.makeAsteroid = initAsteroidFactory();
		this.makeSpaceship = initSpaceshipFactory();
		// TODO: add spaceship factory here

		// Dynamic properties:
		this.lastRender = window.performance.now();
		this.isActive = false;
		this.isFiring = false;
		this.canFire = true;

		// Drawable Items:
		this.asteroids = [];
		this.spaceship = null;
		this.bullets = [];

		// Game Score:
		this.lives = this.settings.startingLives;
		this.score = 0;

		this.preInit();
	}

	preInit() {
		this.isActive = true;
		// NOTE: Do I need to validate that I've selected DOM elements here?
		// Perhaps, check that we've selected things since its possible to select for elements that aren't on the dom
		const domList = [
			this.scoreElem,
			this.livesElem,
			this.startGameElem,
			this.gameOverElem,
		];

		domList.forEach(elem => {
			if (elem === null) {
				throw new Error('Null element');
			}
		});

		// Set canvas size & context:
		this.canvasElem.width = window.innerWidth;
		this.canvasElem.height = window.innerHeight;
		this.ctx = this.canvasElem.getContext('2d');

		// Start looping of our game:
		window.requestAnimationFrame(this.loop.bind(this));
	}

	init() {
		this.initialized = true;

		// TODO: hide the home screen
		// TODO: replace this with the dollar sign?
		if (this.startGameElem === null) {
			throw new Error(
				`startGameElem is null, check to make sure it's been properly selected`,
			);
		}
		fakeJquery.addClass(this.startGameElem, 'hidden');

		// TODO: Reset all the asteroids
	}

	loop(timeStamp = this.lastRender) {
		if (!this.isActive) return;

		this.updateScore();

		// RequestAnimationFrame as first line, good practice as per se MDN
		window.requestAnimationFrame(this.loop.bind(this));

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

	createFrame(numTicks: number) {
		// TODO: Separate this out into preinit mode & init mode

		// Check if you have the make asteroids or not:
		// TODO: build out logic for when I make a new asteroid
		if (this.asteroids.length < 3) {
			this.asteroids = this.asteroids.concat(this.makeAsteroid());
		}

		if (!this.spaceship && this.initialized) {
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
			if (bullet.isActive) {
				bullet.calcPoints(numTicks);
			}
			return bullet.isActive;
		});
	}

	drawAllPoints() {
		// Clear the box:
		this.ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);

		// Draw new points for all items:
		if (this.spaceship instanceof Spaceship && this.spaceship.isActive) {
			this.spaceship.drawPoints();
		}

		this.asteroids.forEach(asteroid => {
			if (asteroid.isActive) {
				asteroid.drawPoints();
			}
		});
		// // Any asteroid whose's points can't be drawn (not active) will be filtered out
		// this.asteroids = this.asteroids.filter(asteroid => asteroid.drawPoints());

		this.bullets = this.bullets.filter(bullet => {
			if (bullet.isActive) {
				bullet.drawPoints(); // drawPoints also checks if its Active, dont know where it would be better
			}
			return bullet.isActive;
		});
	}

	fireBullet() {
		// Check if there is a spaceship ship first
		if (!(this.spaceship instanceof Spaceship)) {
			return;
		}
		if (!this.spaceship.isActive) {
			return;
		}

		if (this.isFiring && this.canFire) {
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
			}, this.settings.firingDelay);
		}
	}

	processCollisions() {
		// Check for any asteroid & bullet collisions
		this.asteroids.filter(asteroid => asteroid.isActive).forEach(asteroid => {
			// TODO: Optimized VERSION --> clear cached bound values of asteroid, & get current bounds:

			// Check bullet & asteroid collisions:
			this.bullets.forEach(bullet => {
				const asteroidHit = asteroid.containsPoint(bullet.currPoints[0]);
				if (asteroidHit) {
					asteroid.isActive = false;
					bullet.isActive = false;
					// IDEA: passs in asteroid & bullet in this eventEmitter?
					this.emitEvent('asteroid-hit', { asteroid });
				}
			});

			// Check spaceship & asteroid collisions:
			if (this.spaceship instanceof Spaceship && this.spaceship.isActive) {
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

	updateScore(options: { score?: number; lives?: number } = {}) {
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

	// TODO: make an enum of all the event names? --> help with the type hinting
	emitEvent(eventName: string, overload?: {}) {
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
			case 'asteroid-hit':
				this.score = this.score += 15;
				this.updateScore({
					score: this.score,
				});

				// Generate new asteroid??
				break;
			case 'spaceship-hit':
				this.lives = this.lives -= 1;
				this.updateScore({
					lives: this.lives,
				});

				// Generate new spaceship
				if (this.lives >= 0) {
					this.spaceship = this.makeSpaceship(200);
					this.spaceship.then(spaceship => {
						// Replace the promised Spaceship, with the real spaceship
						this.spaceship = spaceship;
					});
				} else {
					this.emitEvent('game-over');
				}
				break;
			case 'toggle-pause':
				this.isActive = !this.isActive;
				if (this.isActive) {
					this.loop();
				}
				break;
			case 'game-over':
				// TODO: Check highscores
				// this.isActive = false;
				this.gameOver = true;
				if (this.gameOverElem === null) {
					throw new Error(`No gameOverElem`)
				}
				
				fakeJquery.removeClass(this.gameOverElem, 'hidden');
				break;
			default:
				throw new Error(`Cannot emit event: ${eventName}`);
		}
	}
}

export default Game;
