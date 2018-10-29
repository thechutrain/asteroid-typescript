import { extend } from '../utils';

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
	// drawableItems: drawableItemsModel[];

	constructor(options: GameOptionsModel = gameOptions) {
		this.options = extend(options);
		this.canvasElem = <HTMLCanvasElement>(
			document.getElementById(this.options.canvasIdSelector)
		);
		this.ctx;

		// Dynamic properties:
		this.lastRender = window.performance.now();
		this.isActive = true;

		this.init();
	}

	/** Initializers
	 *
	 *
	 */
	//#region initializers
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
	//#endregion

	loop(timeStamp = this.lastRender) {
		if (!this.isActive) return;

		// RequestAnimationFrame as first line, good practice as per se MDN
		window.requestAnimationFrame(this.loop.bind(this));

		// Determine numTicks & if enough time has passed to proceed:
		const { tickLength, numTicksBeforePausing } = this.options;
		const nextTick = this.lastRender + tickLength;
		const timeSinceTick = timeStamp - this.lastRender;
		const numTicks = Math.floor(timeSinceTick / tickLength);

		// Check whether to proceed with the loop or to exit
		if (timeStamp < nextTick || numTicks > numTicksBeforePausing) {
			return false;
		}
		this.lastRender = timeStamp;
		this.makeFrame(numTicks);
	}

	makeFrame(numTicks: number) {
		console.log(numTicks);
		// TODO: Make Asteroid
		// this.makeAsteroid();
		// TODO: fire bullet
		// this.fireBullet();
		// MAIN GAME LOGIC:
		// i) calculate points of all objects
		// this.calcAllPoints(numTicks);
		// TODO:
		// ii) look for collisions asteroids w./ spaceship && asteroid w./ bullets
		// this.processCollisions();
		// iii) render the updated points & objects:
		// this.paintFrames();
	}
}

export default Game;
