// Parcel Bundler doesn't support asynchronous FS calls, so not statically getting evaluated
// import dotenv from 'dotenv';
// dotenv.config();

if (process.env.DEBUGGER) {
	console.log('debugger is on');
} else {
	console.log('debugger is off');
}

import Game from './game/Game';
import {
	registerWindowEventListeners,
	registerDocumentEventListeners,
} from './events';

registerWindowEventListeners();
registerDocumentEventListeners(() => {
	const G = new Game();

	if (process.env.DEBUGGER) {
		// debugger;
		(window as any).Game.init();
	}
});
