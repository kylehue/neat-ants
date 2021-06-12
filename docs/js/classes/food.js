class Food {
	constructor(world, ant) {
		this.world = world;
		this.ant = ant || null;
		this.position = this.world.getRandomPosition();
		this.velocity = Game.utils.createVector();
		this.radius = Game.utils.random(6, 12);
		this.color = "#40ff5b"


		if (this.ant) {
			this.position.set(this.ant.position);
			this.radius = 3;
		}
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
		//Check if ants collides with this food
		//Ant picks a tiny bit of this food if it does
		//If this food is taken by an ant, don't let other ants take it
		if (!this.ant) {
			const ants = this.world.quadtree.retrieve({
				x: this.position.x - this.radius,
				y: this.position.y - this.radius,
				width: this.radius * 2,
				height: this.radius * 2
			});

			for (let ant of ants) {
				//Don't let an ant take more foods if it's already carrying one
				if (!ant.self.food) {
					if (ant.self.position.dist(this.position) < this.radius + ant.self.size / 2) {
						this.radius -= 0.1;
						ant.self.food = new Food(this.world, ant.self);
					}
				}
			}
		}

		//Dispose this food if it gets super small
		if (this.radius <= 1) {
			this.dispose();
		}
	}

	dispose() {
		let foods = this.world.foods;
		foods.splice(foods.indexOf(this), 1);
	}
}