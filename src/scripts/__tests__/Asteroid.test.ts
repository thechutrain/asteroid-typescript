import { Asteroid } from '../Game/Asteroid';
import { extend } from '../utils';
import { Bullet } from '../game/Bullet';

const fakeCanvas = {
	width: 1000,
	height: 500,
};

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
		});

		// TODO: get static properties of Asteroid & Drawable Class --> check if they match with my Asteroid
		const asteroidImage = {
			currPoints: [],
			velocity: { translateX: -3.42, translateY: -4.32, rotation: -0.26 },
			origin: { x: 979.06, y: 175.8 },
			rSize: 45,
			strokeStyle: 'white',
			offSet: 0,
			onScreen: true,
			isActive: true,
			sides: 10,
			spacer: 1,
			level: 1,
			scoreValue: 5,
		};

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
		});

		a1.calcPoints(0);
		expect(a1.currPoints.length).toBe(a1.sides);
	});

	it('should be able to detect a collision', () => {
		const a1 = new Asteroid({
			origin: { x: 979.06, y: 175.8 },
			velocity: {
				translateX: -3.42,
				translateY: -4.32,
				rotation: -0.26,
			},
			canvasElem: fakeCanvas,
		});

		// calculate currPoints of asteroid
		a1.calcPoints(0);

		// create a bullet
		const b = new Bullet({
			origin: { x: 977.4, y: 176.36 },
			velocity: {
				translateX: -3.42,
				translateY: -4.32,
				rotation: -0.26,
			},
			offSet: 0,
			canvasElem: fakeCanvas,
		});

		b.calcPoints(0);

		expect(a1.containsPoint(b.currPoints[0])).toBe(true);
	});
});
