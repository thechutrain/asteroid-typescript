import { extend, deepClone, round, getRandomNum, randomChance } from '../utils';
import DrawableClass from './DrawableClass';

export class Asteroid extends DrawableClass {
	sides: number;
	spacer: number;
	scoreValue: number;
	level: number;

	static defaultSettings = {
		// animate: true, // not useful yet
		level: 1,
		scoreValue: 5,
		rSize: 45,
		sides: 10,
		spacer: 1,

		velocityOptions: {
			// magnitude: {
			// 	max: 6.5,
			// 	min: 2,
			// },
			x: {
				max: 2.75,
				min: 0.75,
				blnAllowNeg: true,
			},
			y: {
				max: 2.5,
				min: 0.75,
				blnAllowNeg: true,
			},
			rotation: {
				max: 1.5,
				min: 0.2,
				blnAllowNeg: true,
			},
		},
	};

	static clone(asteroid: Asteroid): Asteroid {
		const {
			velocity,
			origin,
			rSize,
			offSet,
			strokeStyle,
			sides,
			spacer,
			level,
		} = deepClone(asteroid); // Note: I dont think I need to do a deep clone?

		return new Asteroid({
			origin,
			rSize,
			offSet,
			strokeStyle,
			sides,
			spacer,
			level,
			velocity,
		});
	}

	static makeChild(
		asteroid: Asteroid,
		maxChild: number,
		numChild: number = 2,
	): Asteroid[] {
		if (asteroid.level >= maxChild) return [];

		const asteroidList = [];
		const level = asteroid.level + 1;
		const rSize = round(asteroid.rSize / 2);
		const scoreValue = asteroid.scoreValue * 2;
		const {
			origin,
			strokeStyle,
			sides,
			spacer,
			offSet,
			velocity: {
				translateX: prevX,
				translateY: prevY,
				rotation: prevRotation,
			},
		} = asteroid;

		// Get a random direction & make a new Asteroid
		for (let i = 0; i < numChild; i += 1) {
			// const randomFactor = Math.sin((i * Math.PI) / 180) * 1.5;
			// const mathRand = round(1.3 * Math.random());
			// const randomFactor =
			// 	mathRand > 1 ? mathRand * i * 0.9 : mathRand * i * 1.1;
			// const randomFactor = 1.1 + i * round(Math.random());
			const randomFactor = 1;
			const velocity = {
				translateX: round(prevX * randomFactor),
				translateY: round(prevY * randomFactor),
				rotation: round(prevRotation * randomFactor),
			};

			const childAsteroid = new Asteroid({
				origin,
				sides,
				velocity,
				level,
				rSize,
				scoreValue,
				strokeStyle,
				spacer,
			});

			asteroidList.push(childAsteroid);
		}

		return asteroidList;
	}

	constructor(constructorOptions?: AsteroidArguments) {
		const options = extend(Asteroid.defaultSettings, constructorOptions);
		super(options);

		this.sides = options.sides || Asteroid.defaultSettings.sides;
		this.spacer =
			Object.prototype.hasOwnProperty.call(options, 'spacer') &&
			options.spacer !== undefined
				? options.spacer
				: Asteroid.defaultSettings.spacer; // Note: overkill, but prevents footgun if default settings were not 0, and we were trying to pass in 0 as an options.spacer
		this.level = options.level;
		this.scoreValue = options.scoreValue;
	}

	public containsPoint(testPoint: PointModel) {
		if (!this.currPoints.length) return false;

		// TODO: should save this as a property of the asteroids object, instead of recalculating??
		// How would I want to cache the value here?
		const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();

		if (
			testPoint.x < leftBound ||
			testPoint.x > rightBound ||
			testPoint.y < upperBound ||
			testPoint.y > lowerBound
		) {
			return false;
		}

		let isOnLine = false; // bln flag to check if its on the line, then containsPoints ==> true!
		const lineResults = this.currPoints.map((pt1, index, coordArr) => {
			const x1 = pt1.x;
			const y1 = pt1.y;
			const x2 =
				index + 1 < coordArr.length ? coordArr[index + 1].x : coordArr[0].x;
			const y2 =
				index + 1 < coordArr.length ? coordArr[index + 1].y : coordArr[0].y;
			const m = (y1 - y2) / (x1 - x2);
			const b = y1 - m * x1;

			// Edge Case: slope is a vertical line
			if (m === Infinity) {
				if (testPoint.x === x1) {
					isOnLine = true;
					return true; // this really doesn't matter
				}
				return testPoint.x < x1;
			}
			if (testPoint.y === m * testPoint.x + b) {
				isOnLine = true;
				return true; // this really doesn't matter
			}
			return testPoint.y < m * testPoint.x + b;
		});

		if (isOnLine) {
			return true;
		}

		// check how many lines it was below
		let numLinesBelow = 0;
		const shouldEqual = Math.ceil(lineResults.length / 2);
		lineResults.forEach(res => {
			if (res) {
				numLinesBelow += 1;
			}
		});

		return numLinesBelow === shouldEqual;
	}

	public getInitVelocity(options: any): VelocityModel {
		// If a velocity is given, just use that instead of calc new one:
		if (options.velocity) {
			return options.velocity;
		}
<<<<<<< Updated upstream
		const { x, y, rotation: r } = Asteroid.defaultSettings.velocityOptions;

		return {
			translateX: getRandomNum(x.min, x.max, x.blnAllowNeg),
			translateY: getRandomNum(y.min, y.max, y.blnAllowNeg),
			rotation: getRandomNum(r.min, r.max, r.blnAllowNeg),
		};
=======
		debugger;
		const {
			magnitude: { max: magMax, min: magMin },
			x: { max: xMax, min: xMin },
			y: { max: yMax, min: yMin },
		} = Asteroid.defaultSettings.velocityOptions;
		const offSet = round(Math.random() * 360);

		// tslint:disable-next-line:variable-name
		let _magnitude = Math.random() * (magMax - magMin) + magMin; // Unrounded value;
		let translateX = _magnitude * Math.sin((Math.PI * offSet) / 180);
		let translateY = _magnitude * Math.cos((Math.PI * offSet) / 180);

		while (translateX > xMax || translateX < xMin) {
			_magnitude = Math.random() * (magMax - magMin) + magMin; // Unrounded value;
			translateX = round(_magnitude * Math.sin((Math.PI * offSet) / 180));
		}

		while (translateY > yMax || translateY < yMin) {
			_magnitude = Math.random() * (magMax - magMin) + magMin; // Unrounded value;
			translateY = round(_magnitude * Math.sin((Math.PI * offSet) / 180));
		}

		const rotation = randomChance()
			? round(Math.random() * 2)
			: -1 * round(Math.random() * 2);

		return {
			translateX,
			translateY,
			rotation,
		};

		// tslint:disable-next-line:function-name
		function _getRandomSpeed(axis = 'x', blnDir = true) {
			// TODO: Instead of getting the velocity options from static class variable, get it from
			// getInitVelocity argument, since we can overwrite that & make it more customizable
			const { x, y, rotation } = Asteroid.defaultSettings.velocityOptions;

			let min;
			let max;
			switch (axis) {
				case 'x':
					max = x.max;
					min = x.min;
					break;
				case 'y':
					max = y.max;
					min = y.min;
					break;
				case 'rotation':
					max = rotation.max;
					min = rotation.min;
					break;
				default:
					throw new Error('Cannot get initVelocity: axis not valid');
			}

			let velocity = Math.random() * (max - min) + min;
			velocity = round(velocity);

			const negDirection = blnDir ? Math.random() > 0.5 : false;
			return negDirection ? velocity * -1 : velocity;
		}

		// return {
		// 	translateX: getRandomSpeed('x'),
		// 	translateY: getRandomSpeed('y'),
		// 	rotation: getRandomSpeed('rotation'),
		// };
>>>>>>> Stashed changes
	}

	public getInitOrigin(options: any): PointModel {
		if (options.origin) {
			return options.origin;
		}

		// Note: prevents foot gun, where the order in which you call initializer fn does not matter
		if (!this.velocity) {
			this.velocity = this.getInitVelocity(options);
		}

		let quadrant;
		if (this.velocity.translateX > 0) {
			quadrant = this.velocity.translateY > 0 ? 2 : 3;
		} else {
			quadrant = this.velocity.translateY > 0 ? 1 : 4;
		}

		const width = DrawableClass.canvasElem.width;
		const height = DrawableClass.canvasElem.height;
		let origin;

		switch (quadrant) {
			case 1:
				origin = {
					x: width + 10,
					y: -10,
				};
				break;
			case 2:
				origin = {
					x: -10,
					y: -10,
				};
				break;
			case 3:
				origin = {
					x: -10,
					y: height + 10,
				};
				break;
			case 4:
				origin = {
					x: width + 10,
					y: height + 10,
				};
				break;
			default:
				throw new Error(
					'Error: could not determine the right quadrant for asteroid',
				);
				break;
		}

		return origin;
	}

	public calcPoints(ticks: number): PointModel[] {
		const moveXBy = ticks * this.velocity.translateX;
		const moveYBy = ticks * this.velocity.translateY;

		if (!this.origin) {
			throw new Error(`Cannot calcPoints if origin is null`);
		}

		this.origin.x = round((this.origin.x + moveXBy) * 100) / 100;
		this.origin.y = round((this.origin.y + moveYBy) * 100) / 100;

		this.offSet += this.velocity.rotation;

		this.currPoints = [];
		const angleUnit = 360 / this.sides;
		for (let i = 0; i < this.sides; i += 1) {
			const angle = angleUnit * i + this.offSet;
			const newX =
				this.origin.x + Math.sin((Math.PI * angle) / 180) * this.rSize;
			const newY =
				this.origin.y + Math.cos((Math.PI * angle) / 180) * this.rSize;
			this.currPoints.push({
				x: round(newX * 100) / 100,
				y: round(newY * 100) / 100,
			});
		}

		if (!this.onScreen && this.isVisible()) {
			this.onScreen = true;
		} else if (this.isHidden()) {
			this.onScreen = false;
			this.reframe();
		}
		return this.currPoints;
	}

	public drawPoints() {
		if (!this.isActive) {
			return false;
		}

		const ctx = DrawableClass.ctx;

		ctx.save();
		ctx.strokeStyle = this.strokeStyle;
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
		ctx.stroke();
		ctx.restore();

		return true;
	}

	private reframe() {
		const xLimit = DrawableClass.canvasElem.width;
		const yLimit = DrawableClass.canvasElem.height;
		let adjustXBy = 0;
		let adjustYBy = 0;

		// Determine left, right, top, bottom bounds of our shape:
		const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();

		// ===== ADJUST X-coordinates =====
		// CASE: moving right
		if (this.velocity.translateX > 0) {
			// Check to see if the trailing edge (far left x-coord on shape) is off screen
			if (leftBound > xLimit) {
				// then adjust all the x-coordinates
				adjustXBy = -1 * (rightBound + this.spacer);
			}
		} else {
			// CASE: moving left
			// checkt to see if shape may be off the canvas on the left-side
			if (rightBound < 0) {
				// all x-coordinates are off the screen & we need to update
				adjustXBy = Math.abs(leftBound) + xLimit + this.spacer;
			}
		}

		// ===== ADJUST Y-coordinates =====
		// CASE: moving down
		if (this.velocity.translateY > 0) {
			// Case: moving down, could potentially be below canvas
			if (upperBound > yLimit) {
				adjustYBy = -1 * (lowerBound + this.spacer);
			}
		} else {
			// Case; moving up
			// check if the entire shape is above the canvas
			if (lowerBound < 0) {
				adjustYBy = Math.abs(upperBound) + yLimit + this.spacer;
			}
		}

		if (!this.origin) {
			throw new Error(`Cannot reframe() if origin is null`);
		}

		this.origin.x = this.origin.x + adjustXBy;
		this.origin.y = this.origin.y + adjustYBy;

		this.currPoints.forEach(pt => {
			pt.x += adjustXBy;
			pt.y += adjustYBy;
		});
	}
}

export function makeAsteroid(
	asteroidOptions: AsteroidArguments,
	delay: number = 0,
): Promise<Asteroid> {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(new Asteroid(asteroidOptions));
		}, delay);
	});
}

export function initAsteroidFactory() {
	let lastTimestamp = Date.now();
	// TODO: NEED TO CHECK THAT THE GAME IS ALSO NOT PAUSED

	return function makeAsteroid(
		asteroidOptions: AsteroidArguments = {},
		minDelay = 500,
		blnForce = false,
	): Promise<Asteroid> {
		return new Promise(resolve => {
			// Case: blnForce (create asteroid independent of last time stamp)
			if (blnForce) {
				if (minDelay === 0) {
					resolve(new Asteroid(asteroidOptions));
				} else {
					setTimeout(() => {
						resolve(new Asteroid(asteroidOptions));
					}, minDelay);
				}

				lastTimestamp = Date.now();
				return;
			}

			// Case: not blnForce --> either you can make it,
			// or check again later to see if you need to make it
			if (Date.now() - lastTimestamp > minDelay) {
				resolve(new Asteroid(asteroidOptions));
				lastTimestamp = Date.now();
			} else {
				const intervalTime = parseInt(`${minDelay / 3}`, 10);

				const intervalRef = setInterval(() => {
					if (Date.now() - lastTimestamp > minDelay) {
						clearInterval(intervalRef);
						resolve(new Asteroid(asteroidOptions));
						lastTimestamp = Date.now();
					}
				}, intervalTime);
			}
		});
	};
}
