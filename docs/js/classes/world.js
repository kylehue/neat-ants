class World {
	constructor(game) {
		this.game = game;
		//World constants
		this.size = 500;
		this.bounds = {
			min: {
				x: -this.size / 2,
				y: -this.size / 2
			},
			max: {
				x: this.size / 2,
				y: this.size / 2
			}
		}

		this.camera = new Camera2D(this.game.context, {
			moveTransitionSpeed: 1,
			zoomTransitionSpeed: 1
		});

		this.quadtree = new Quadtree({
			x: this.bounds.min.x,
			y: this.bounds.min.y,
			width: this.size,
			height: this.size
		}, 8);

		this.mouse = Game.utils.createVector();

		//World objects
		this.colonies = [];
		this.foods = [];

		for (var i = 0; i < 1; i++) {
			let colony = new Colony(this);
			this.colonies.push(colony);
		}

		for (var i = 0; i < 1; i++) {
			let food = new Food(this);
			this.foods.push(food);
		}

		window.world = this;
	}

	render() {
		//Start camera
		this.camera.begin();
		this.camera.moveTo(0, 0);
		this.camera.zoomTo(this.size + 100);

		//Bounds
		Game.draw(context => {
			context.beginPath();
			context.rect(this.bounds.min.x, this.bounds.min.y, this.size, this.size);
			context.closePath();
		}, {
			fillStyle: "#43464d"
		});

		//Render colonies
		for (let colony of this.colonies) {
			colony.render();
		}

		//Render foods
		for (let food of this.foods) {
			food.render();
		}

		//End camera
		this.camera.end();
	}

	update() {
		//Add all ants to quadtree
		for (let colony of this.colonies) {
			for (let ant of colony.ants) {
				ant.addToQuadtree(this.quadtree);
			}
		}

		//Update colonies
		for (let colony of this.colonies) {
			colony.update();
		}

		//Update foods
		for (let food of this.foods) {
			food.update();
		}

		this.handleWallToAntCollision();

		//Update world mouse
		let worldMouse = this.camera.screenToWorld(Game.constants.mouse.x, Game.constants.mouse.y);
		this.mouse.set(worldMouse);

		//Clear quadtree
		this.quadtree.clear();
	}

	handleWallToAntCollision() {
		//Top wall
		const antsTop = this.quadtree.retrieve({
			x: this.bounds.min.x,
			y: this.bounds.min.y,
			width: this.size,
			height: 50
		});

		//Right wall
		const antsRight = this.quadtree.retrieve({
			x: this.bounds.max.x,
			y: this.bounds.min.y,
			width: 50,
			height: this.size
		});

		//Bottom wall
		const antsBottom = this.quadtree.retrieve({
			x: this.bounds.min.x,
			y: this.bounds.max.y,
			width: this.size,
			height: 50
		});

		//Left wall
		const antsLeft = this.quadtree.retrieve({
			x: this.bounds.min.x,
			y: this.bounds.min.y,
			width: 50,
			height: this.size
		});

		for (let ant of antsTop) {
			if (ant.y < this.bounds.min.y) {
				ant.self.dispose();
			}
		}

		for (let ant of antsBottom) {
			if (ant.y > this.bounds.max.y) {
				ant.self.dispose();
			}
		}

		for (let ant of antsRight) {
			if (ant.x > this.bounds.max.x) {
				ant.self.dispose();
			}
		}

		for (let ant of antsLeft) {
			if (ant.x < this.bounds.min.x) {
				ant.self.dispose();
			}
		}
	}

	getRandomPosition() {
		let x = Game.utils.random(this.bounds.min.x, this.bounds.max.x);
		let y = Game.utils.random(this.bounds.min.y, this.bounds.max.y);
		return Game.utils.createVector(x, y);
	}
}