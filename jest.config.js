module.exports = {
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	roots: ['<rootDir>/src'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
	// testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	coverageDirectory: 'coverage',
	collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
};

// SOURCE: https://basarat.gitbooks.io/typescript/docs/testing/jest.html
