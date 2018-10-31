import { extend } from '../utils';
import { initAsteroidFactory, Asteroid } from './Asteroid';
import { initSpaceshipFactory, Spaceship } from './Spaceship';

const gameOptions = {
	tickLength: 50, // ms time in between frames
	numTicksBeforePausing: 5,
	maxAsteroids: 1,
	maxChildAsteroids: 2,
	asteroidDelay: 3 * 1000,
	firingDelay: 200,
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
	spaceship: Spaceship;
	makeSpaceship: () => Spaceship;

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
		this.asteroids = [];
		this.spaceship = this.makeSpaceship();

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
		// TODO: Make Asteroid
		// Check if you have the make asteroids or not:
		if (this.asteroids.length < 3) {
			this.asteroids = this.asteroids.concat(this.makeAsteroid());
		}

		// if (!this.spaceship) {
		// 	this.spaceship = new Spaceship();
		// }

		// TODO: fire bullet
		// this.fireBullet();
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
		if (this.spaceship) {
			this.spaceship.calcPoints(numTicks);
		}

		this.asteroids.forEach(asteroid => {
			if (asteroid.isActive) {
				asteroid.calcPoints(numTicks);
			}
		});
	}

	drawAllPoints() {
		// Clear the box:
		this.ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);

		// Draw new points for all items:
		if (this.spaceship) {
			this.spaceship.drawPoints();
		}

		this.asteroids.forEach(asteroid => {
			if (asteroid.isActive) {
				asteroid.drawPoints();
			}
		});

		// this.bullets.forEach(bullet => {
		// 	if (bullet.isActive) {
		// 		bullet.drawPoints(); // drawPoints also checks if its Active, dont know where it would be better
		// 	}
		// });
	}

	processCollisions() {}
}

export default Game;
