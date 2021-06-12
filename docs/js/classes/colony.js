class Colony {
	constructor(world) {
		this.world = world;
		this.position = this.world.getRandomPosition();
		this.velocity = Game.utils.createVector();
		this.radius = 20;
		this.ants = [];

		for(var i = 0; i < 100; i++){
			this.ants.push(new Ant(this));
		}
	}

	render() {
		Game.draw(context => {
			context.beginPath();
			context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
			context.closePath();
		}, {
			fillStyle: "#ba6666"
		});

		for (let ant of this.ants) {
			ant.render();
		}
	}

	update() {
		for (let ant of this.ants) {
			ant.update();
		}
	}
}