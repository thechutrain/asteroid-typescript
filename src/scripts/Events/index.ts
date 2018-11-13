import { initDebouncer } from '../utils';

// REGISTER EVENT LISTENERS HERE:
import documentEventListeners from './documentEventListeners';

/** TODO - reorganize
 * move documentEventListeners to the top, option to merge it
 * add ability to pass in a cb function (readyFN) to registerDocumentEventListeners
 */

/** =========== Window related Event Listeners ===========
 *
 */
// #region window related event listeners
function documentReadyCode(readyFn: () => void) {
	// Run any code that requires the DOMContent to be loaded
	if (typeof readyFn === 'function') {
		readyFn();
	}

	// Register documentEventListeners here
	documentEventListeners.forEach(listener => {
		if (listener.selector) {
			document.querySelectorAll(listener.selector).forEach(ele => {
				ele.addEventListener(listener.event, listener.cb);
			});
		} else {
			// default: add listener to the document
			document.addEventListener(listener.event, listener.cb);
		}
	});
}

// TODO: add flexibility of adding various cb fn as argument that will get invoked
function registerDocumentEventListeners(readyFn: () => void) {
	// IE9+ fix: http://youmightnotneedjquery.com/#ready
	// NOTE document.attachEvent --> for Opera & Internet Explorer below 9
	if (
		(<any>document).attachEvent
			? document.readyState === 'complete'
			: document.readyState !== 'loading'
	) {
		documentReadyCode(readyFn);
	} else {
		document.addEventListener('DOMContentLoaded', () => {
			documentReadyCode(readyFn);
		});
	}
}

function registerWindowEventListeners() {
	// === window related event listeners ===
	// Source: https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
	function resizeVh() {
		console.log('window resize fired!!!');

		const vh = window.innerHeight * 0.01;
		if (document.documentElement) {
			document.documentElement.style.setProperty('--vh', `${vh}px`);
		}
	}

	// === Add window event listeners ===
	window.addEventListener('resize', initDebouncer(resizeVh, 100));
}
// #endregion

export { registerWindowEventListeners, registerDocumentEventListeners };
