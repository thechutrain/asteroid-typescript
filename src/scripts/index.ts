console.log('index file');

import Game from './game/Game';
import {
	registerWindowEventListeners,
	registerDocumentEventListeners,
} from './events/index';

registerWindowEventListeners();
registerDocumentEventListeners(() => {
	new Game();
});
