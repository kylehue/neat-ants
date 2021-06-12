class Ant {
	constructor(colony) {
		this.colony = colony;
		this.position = this.colony.position.copy();
		this.velocity = Game.utils.createVector();
		this.angle = Game.utils.random(-Math.PI, Math.PI);
		this.size = 6;
		this.color = "#fff"
	}

	render() {
		Game.draw(context => {
			context.save();
			context.translate(this.position.x, this.position.y);
			context.rotate(this.angle);
			context.beginPath();
			context.rect(0, 0, this.size, this.size / 2);
			context.closePath();
			context.restore();
		}, {
			fillStyle: this.color
		});
	}

	update() {
		this.position.add(this.velocity);
		this.velocity.set({
			x: Math.cos(this.angle),
			y: Math.sin(this.angle)
		});
		this.velocity.setMag(0.6);

		if (Game.utils.keyIsDown(68)) {
			this.angle += 0.1;
		}

		if (Game.utils.keyIsDown(65)) {
			this.angle -= 0.1;
		}
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

	dispose() {
		let colony = this.colony.ants;
		colony.splice(colony.indexOf(this), 1);
	}
}