class Wall {
	constructor(world, options) {
		this.world = world;
		options = options || {};
		this.position = options.position || this.world.getRandomPosition();
		this.width = typeof options.width == "number" ? options.width : Game.utils.random(10, 100);
		this.height = typeof options.height == "number" ? options.height : Game.utils.random(10, 100);
		this.angle = typeof options.angle == "number" ? options.angle : Game.utils.random(-Math.PI, Math.PI);
		this.velocity = Game.utils.createVector();
		this.color = "#2a2d34"

		this.vertices = [
			Game.utils.createVector(
				this.position.x - this.width / 2,
				this.position.y - this.height / 2
			),
			Game.utils.createVector(
				this.position.x + this.width / 2,
				this.position.y - this.height / 2
			),
			Game.utils.createVector(
				this.position.x + this.width / 2,
				this.position.y + this.height / 2
			),
			Game.utils.createVector(
				this.position.x - this.width / 2,
				this.position.y + this.height / 2
			)
		];

		this.rotate(this.angle);
	}

	render() {
		Game.draw(context => {
			context.beginPath();
			context.moveTo(this.vertices[0].x, this.vertices[0].y);
			for (let vertex of this.vertices) {
				context.lineTo(vertex.x, vertex.y);
			}
			context.lineTo(this.vertices[0].x, this.vertices[0].y);
			context.closePath();
		}, {
			fillStyle: this.color
		});
	}

	translate(x, y) {
		this.position.set({
			x: x,
			y: y
		});

		this.vertices = [
			Game.utils.createVector(
				this.position.x - this.width / 2,
				this.position.y - this.height / 2
			),
			Game.utils.createVector(
				this.position.x + this.width / 2,
				this.position.y - this.height / 2
			),
			Game.utils.createVector(
				this.position.x + this.width / 2,
				this.position.y + this.height / 2
			),
			Game.utils.createVector(
				this.position.x - this.width / 2,
				this.position.y + this.height / 2
			)
		];

		this.rotate(this.angle);
	}

	rotate(angle) {
		this.angle = angle;
		for (let vertex of this.vertices) {
			let x = (vertex.x - this.position.x) * Math.cos(this.angle) - (vertex.y - this.position.y) * Math.sin(this.angle);
			let y = (vertex.x - this.position.x) * Math.sin(this.angle) + (vertex.y - this.position.y) * Math.cos(this.angle);
			vertex.x = x + this.position.x;
			vertex.y = y + this.position.y;
		}
	}

	update() {
		//Check if ants overlaps this wall
		//If an ant does, dispose the ant
		let ants = this.world.quadtree.retrieve({
			x: this.position.x - this.width,
			y: this.position.y - this.height,
			width: this.width * 2,
			height: this.height * 2
		});

		for (let ant of ants) {
			if (this.collidesWith(ant.self)) {
				ant.self.dispose();
				//ant.self.lookBack();
			}
		}
	}

	collidesWith(object) {
		let collision = Game.utils.SAT(this.vertices, object.vertices);
		return collision;
	}
}