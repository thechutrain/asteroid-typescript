import DrawableClass from './DrawableClass';

export class Bullet extends DrawableClass {
	public getInitOrigin(options: any): PointModel {
		throw new Error('Method not implemented.');
	}
	public getInitVelocity(options: any): VelocityModel {
		throw new Error('Method not implemented.');
	}
	public calcPoints(ticks: number): PointModel[] {
		throw new Error('Method not implemented.');
	}
	public drawPoints(): void {
		throw new Error('Method not implemented.');
	}
}
