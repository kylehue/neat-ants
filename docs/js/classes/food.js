class Food {
	constructor(world) {
		this.world = world;
		this.position = this.world.getRandomPosition();
		this.velocity = Game.utils.createVector();
		this.radius = 10;
		this.color = "#40ff5b"
	}

	render() {
		Game.draw(context => {
			context.beginPath();
			context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
			context.closePath();
		}, {
			fillStyle: this.color
		});
	}

	update() {
		
	}

	addToQuadtree(quadtree) {
		quadtree.insert({
			x: this.position.x,
			y: this.position.y,
			width: this.size,
			height: this.size,
			self: this
		});
	}
}