const fakeJQuery = {
	// Source: https://toddmotto.com/javascript-hasclass-addclass-removeclass-toggleclass/#adding-a-class-with-addclass
	hasClass(elem: HTMLElement, className: string) {
		return new RegExp(` {$className} `).test(` ${elem.className} `);
	},

	addClass(elem: HTMLElement, className: string) {
		if (!this.hasClass(elem, className)) {
			elem.className += ` ${className}`;
		}
		// TODO: cool, to make it chainable, return elem
	},

	// TODO: make a cool regular expression
	// Idea: ^(ab)$|^(ab) | (ab)$| (ab)
	// removeClass(elem: HTMLElement, className: string) {
	// 	if (this.hasClass(elem, className)) {

	// 	}
	// },
	removeClass(elem: HTMLElement, className: string) {
		let newClass = ` ${elem.className.replace(/[\t\r\n]/g, ' ')} `;
		if (this.hasClass(elem, className)) {
			while (newClass.indexOf(` ${className} `) >= 0) {
				newClass = newClass.replace(` ${className} `, ' ');
			}
			elem.className = newClass.replace(/^\s+|\s+$/g, '');
		}
	},
};

export default fakeJQuery;
