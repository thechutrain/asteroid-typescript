import Person, { randomAge } from '../src/scripts/Person';

describe('Person test', () => {
	it('should be able to create a person', () => {
		const bob = new Person('bob', 23);
		expect(bob.name).toBe('bob');
	});
});
