import { Asteroid } from '../Game/Asteroid';

describe('Asteroid', () => {
	it('should work', () => {});

	const a = JSON.parse(
		`{"currPoints":[{"x":1001.5054647220168,"y":177.36560790143156},{"x":987.4850071810184,"y":154.93689720428205},{"x":961.8214760713147,"y":161.34029194274962},{"x":959.9809991151758,"y":187.72651823165435},{"x":984.5070529104747,"y":197.6307081745759}],"velocity":{"translateX":3.12,"translateY":-3.82,"rotation":0.47},"origin":{"x":979.0600000000001,"y":175.8000046909387},"rSize":22.5,"strokeStyle":"white","offSet":86.00999999999985,"onScreen":true,"isActive":true,"sides":5,"spacer":1,"level":2,"scoreValue":5}`,
	);

	const bullet = JSON.parse(
		`{"currPoints":[{"x":977.4009544757282,"y":176.17529857330038}],"velocity":{"magnitude":11,"translateX":10.75962360807186,"translateY":2.287028598995354,"rotation":0},"origin":{"x":977.4009544757282,"y":176.17529857330038},"rSize":0,"strokeStyle":"white","offSet":78,"onScreen":true,"isActive":true}`,
	);
	const asteroid = new Asteroid({
		origin: { x: 10, y: 10 },
		sides: 4,
		rSize: 2,
	});
});
