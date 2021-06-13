class Colony {
	constructor(world) {
		this.world = world;
		this.position = this.world.getRandomPosition();
		this.velocity = Game.utils.createVector();
		this.radius = 20;
		this.ants = [];

		this.vertices = [];

		this.updateVertices();

		for(var i = 0; i < 1; i++){
			this.ants.push(new Ant(this));
		}
	}

	render() {
		for (let ant of this.ants) {
			ant.render();
			if (ant == this.ants[0]) {
				ant.renderSensors();
			}
		}

		Game.draw(context => {
			context.beginPath();
			context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
			context.closePath();
		}, {
			fillStyle: "#d35166"
		});
	}

	updateVertices() {
		this.vertices = [];
		let sides = 8;
		for(var angle = -Math.PI; angle < Math.PI; angle += Math.PI * 2 / sides){
			this.vertices.push(Game.utils.createVector(
				this.position.x + Math.cos(angle) * this.radius,
				this.position.y + Math.sin(angle) * this.radius
			));
		}
	}

	update() {
		for (let ant of this.ants) {
			ant.update();
		}
	}
}