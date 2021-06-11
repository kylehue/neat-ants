class Ant {
	constructor(world) {
		this.world = world;
		this.position = this.world.getRandomPosition();
		this.velocity = Game.utils.createVector();
		this.radius = Game.utils.random(4, 20);
	}

	render() {
		Game.draw(context => {
			context.beginPath();
			context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
			context.closePath();
		}, {
			fillStyle: "#fff"
		});
	}

	update() {
		this.position.add(this.velocity);
	}
}