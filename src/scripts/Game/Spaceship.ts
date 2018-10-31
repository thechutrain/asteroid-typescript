import DrawableClass from './DrawableClass';

class Spaceship extends DrawableClass {
	getInitOrigin(options: any): PointModel {
		throw new Error('Method not implemented.');
	}
	getInitVelocity(options: any): VelocityModel {
		throw new Error('Method not implemented.');
	}
	public calcPoints(ticks: number): PointModel[] {
		throw new Error('Method not implemented.');
	}
	public drawPoints(): void {
		throw new Error('Method not implemented.');
	}
}
