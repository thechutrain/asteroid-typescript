console.log('index file');

import Game from './Game/Game';
import {
	registerWindowEventListeners,
	registerDocumentEventListeners,
} from './Events';

registerWindowEventListeners();
registerDocumentEventListeners(() => {
	new Game();
});
