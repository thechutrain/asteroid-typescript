// import { Asteroid } from '../src/scripts/Game/Asteroid';

// gameRef.canvasElem.width;
// const window = {
// 	Game: {
// 		canvasElem: {
// 			width: 300,
// 			height: 150,
// 		},
// 	},
// };

// @ts-ignore
window.Game = {};

beforeEach(() => {
	// @ts-ignore
	window.Game.canvasElem = {
		width: 300,
		height: 150,
	};
});

describe('Asteroid', () => {
	it('should work', () => {});
	// it('should be able to create a new asteroid', () => {
	// 	window.Game = {};
	// 	window.Game.canvasElem = {
	// 		width: 300,
	// 		height: 150,
	// 	};
	// 	const a = new Asteroid({ origin: { x: 10, y: 10 }, sides: 4, rSize: 2 });
	// });
});
