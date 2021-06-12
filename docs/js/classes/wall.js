class Wall {
	constructor(world) {
		this.world = world;
		this.position = this.world.getRandomPosition();
		this.width = Game.utils.random(10, 100);
		this.height = Game.utils.random(10, 100);
		this.velocity = Game.utils.createVector();
		this.angle = Game.utils.random(-Math.PI, Math.PI);
		this.color = "#2a2d34"
	}

	render() {
		Game.draw(context => {
			context.beginPath();
			context.rect(this.position.x, this.position.y, this.width, this.height);
			context.closePath();
		}, {
			fillStyle: this.color
		});
	}

	update() {
		//Check if ants overlaps this wall
		//If an ant does, dispose the ant
		let ants = this.world.quadtree.retrieve({
			x: this.position.x,
			y: this.position.y,
			width: this.width,
			height: this.height
		});

		for (let ant of ants) {
			if (ant.x + ant.self.size / 2 >= this.position.x && ant.x - ant.self.size / 2 <= this.position.x + this.width && ant.y + ant.self.size / 2 >= this.position.y && ant.y - ant.self.size / 2 <= this.position.y + this.height) {
				ant.self.dispose();
			}
		}
	}
}