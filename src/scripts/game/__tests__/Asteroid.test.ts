import { Asteroid, AsteroidDefaultSettings } from '../Asteroid';
import { DrawableClassDefaultSettings } from '../DrawableClass';
import { extend } from '../../utils';
import { Bullet } from '../Bullet';

const fakeCanvas = {
	width: 1000,
	height: 500,
};

const fakeCtx = {};

describe('Asteroid', () => {
	it('should be able to create an default asteroid given an origin', () => {
		const a1 = new Asteroid({
			origin: { x: 979.06, y: 175.8 },
			velocity: {
				translateX: -3.42,
				translateY: -4.32,
				rotation: -0.26,
			},
			canvasElem: fakeCanvas,
			ctx: fakeCtx,
		});

		// TODO: get static properties of Asteroid & Drawable Class --> check if they match with my Asteroid
		const asteroidImage = extend(
			DrawableClassDefaultSettings,
			AsteroidDefaultSettings,
			{
				currPoints: [],
				velocity: { translateX: -3.42, translateY: -4.32, rotation: -0.26 },
				origin: { x: 979.06, y: 175.8 },
			},
		);

		// Remove velocityOptions
		delete asteroidImage.velocityOptions;
		// console.log(asteroidImage);

		expect(a1).toMatchObject(asteroidImage);
	});

	it('should be able to create currpoints', () => {
		const a1 = new Asteroid({
			origin: { x: 979.06, y: 175.8 },
			velocity: {
				translateX: -3.42,
				translateY: -4.32,
				rotation: -0.26,
			},
			canvasElem: fakeCanvas,
			ctx: fakeCtx,
		});

		a1.calcPoints(0);
		expect(a1.currPoints.length).toBe(a1.sides);
	});

	it('should be able to detect a collision', () => {
		const asteroidCenter = { x: 50, y: 100 };
		const a1 = new Asteroid({
			origin: asteroidCenter,
			sides: 4,
			offSet: 45,
			rSize: 20,
			velocity: {
				translateX: 0,
				translateY: 0,
				rotation: 0,
			},
			canvasElem: fakeCanvas,
			ctx: fakeCtx,
		});

		// calculate currPoints of asteroid
		a1.calcPoints(0);
		// console.log(a1);

		// create a bullet
		const b = new Bullet({
			origin: asteroidCenter,
			velocity: {
				translateX: 0,
				translateY: 0,
				rotation: 0,
			},
			offSet: 0,
			canvasElem: fakeCanvas,
			ctx: fakeCtx,
		});
		b.calcPoints(0);

		expect(a1.containsPoint(b.currPoints[0])).toBe(true);
	});

	// it('should be able to detect a collision', () => {
	// 	const a1 = new Asteroid({
	// 		origin: { x: 979.06, y: 175.8 },
	// 		velocity: {
	// 			translateX: -3.42,
	// 			translateY: -4.32,
	// 			rotation: -0.26,
	// 		},
	// 		canvasElem: fakeCanvas,
	// 		ctx: fakeCtx,
	// 	});

	// 	// calculate currPoints of asteroid
	// 	a1.calcPoints(0);

	// 	// create a bullet
	// 	const b = new Bullet({
	// 		origin: { x: 977.4, y: 176.36 },
	// 		velocity: {
	// 			translateX: -3.42,
	// 			translateY: -4.32,
	// 			rotation: -0.26,
	// 		},
	// 		offSet: 0,
	// 		canvasElem: fakeCanvas,
	// 		ctx: fakeCtx,
	// 	});

	// 	b.calcPoints(0);

	// 	expect(a1.containsPoint(b.currPoints[0])).toBe(true);
	// });

	it('should be able to create a square asteroid', () => {
		const a1 = new Asteroid({
			origin: { x: 50, y: 100 },
			sides: 4,
			offSet: 45,
			rSize: 20,
			velocity: {
				translateX: 0,
				translateY: 0,
				rotation: 0,
			},
			canvasElem: fakeCanvas,
			ctx: fakeCtx,
		});

		a1.calcPoints(0);

		// console.log(a1);
		// const b1 = new Bullet({
		// 	origin: { x: 977.4, y: 176.36 },
		// 	velocity: {
		// 		translateX: -3.42,
		// 		translateY: -4.32,
		// 		rotation: -0.26,
		// 	},
		// 	offSet: 0,
		// 	canvasElem: fakeCanvas,
		// 	ctx: fakeCtx,
		// });
	});
});
