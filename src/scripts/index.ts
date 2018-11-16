import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.DEBUGGER);

import Game from './game/Game';
import {
	registerWindowEventListeners,
	registerDocumentEventListeners,
} from './events';

registerWindowEventListeners();
registerDocumentEventListeners(() => {
	new Game();
});
