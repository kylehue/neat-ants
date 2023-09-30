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
		this.walls = [];
		this.foods = [];
		this.colonies = [];

		//Top wall
		const wallWidth = 20;
		let topWall = new Wall(this, {
			width: this.size,
			height: wallWidth,
			angle: 0,
			position: Game.utils.createVector(0, this.bounds.min.y + wallWidth / 2)
		});

		//Bottom wall
		let bottomWall = new Wall(this, {
			width: this.size,
			height: wallWidth,
			angle: 0,
			position: Game.utils.createVector(0, this.bounds.max.y - wallWidth / 2)
		});

		//Left wall
		let leftWall = new Wall(this, {
			width: wallWidth,
			height: this.size,
			angle: 0,
			position: Game.utils.createVector(this.bounds.min.x + wallWidth / 2, 0)
		});

		//Right wall
		let rightWall = new Wall(this, {
			width: wallWidth,
			height: this.size,
			angle: 0,
			position: Game.utils.createVector(this.bounds.max.x - wallWidth / 2, 0)
		});

		this.walls.push(topWall, bottomWall, leftWall, rightWall)

		for (var i = 0; i < 20; i++) {
			this.addWall();
		}

		for (var i = 0; i < 1; i++) {
			this.addColony();
		}

		for (var i = 0; i < 5; i++) {
			this.addFood();
		}

		window.world = this;
	}

	render() {
		//Start camera
		this.camera.begin();
		this.camera.moveTo(0, 0);
		this.camera.zoomTo(window.innerWidth);

		//Bounds
		Game.draw(context => {
			context.beginPath();
			context.rect(this.bounds.min.x, this.bounds.min.y, this.size, this.size);
			context.closePath();
		}, {
			fillStyle: "#43464d"
		});

		//Render foods
		for (let food of this.foods) {
			food.render();
		}

		//Render walls
		for (let wall of this.walls) {
			wall.render();
		}

		//Render colonies
		for (let colony of this.colonies) {
			colony.render();
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

		//Update walls
		for (let wall of this.walls) {
			wall.update();
		}

		//Update world mouse
		let worldMouse = this.camera.screenToWorld(Game.constants.mouse.x, Game.constants.mouse.y);
		this.mouse.set(worldMouse);

		//Clear quadtree
		this.quadtree.clear();
	}

	getRandomPosition() {
		let x = Game.utils.random(this.bounds.min.x, this.bounds.max.x);
		let y = Game.utils.random(this.bounds.min.y, this.bounds.max.y);
		return Game.utils.createVector(x, y);
	}

	addWall() {
		let wall = new Wall(this);
		let startTime = new Date().getTime();

		//Avoid other walls collision
		for (var i = 0; i < this.walls.length; i++) {
			let otherWall = this.walls[i];
			if (otherWall == wall) continue; //<<redundant, remove
			if (wall.collidesWith(otherWall)) {
				wall = new Wall(this);
				i = -1;
			}

			//Ignore when it takes too long to find a position
			if (new Date().getTime() - startTime > 1000) {
				wall = null;
				break;
			}
		}

		if (wall) this.walls.push(wall);
		return wall;
	}

	addFood() {
		let food = new Food(this);
		let startTime = new Date().getTime();
		let range = this.size / 2;

		//Avoid spawning the food inside the walls
		for (var i = 0; i < this.walls.length; i++) {
			let wall = this.walls[i];
			if (wall.collidesWith(food)) {
				food = new Food(this);
				i = -1;
			}

			//Spawn the food as far away as possible from the colonies
			for (var j = 0; j < this.colonies.length; j++) {
				let colony = this.colonies[j];
				if (colony.position.dist(food.position) < colony.radius + food.radius + range) {
					food = new Food(this);
					range -= 5;
					i = -1;
				}
			}

			//Ignore when it takes too long to find a position
			if (new Date().getTime() - startTime > 1000) {
				food = null;
				break;
			}
		}

		if (food) this.foods.push(food);
		return food;
	}

	addColony() {
		let colony = new Colony(this);
		let startTime = new Date().getTime();
		let range = this.size;

		//Avoid spawning the colony inside the walls
		for (var i = 0; i < this.walls.length; i++) {
			let wall = this.walls[i];
			if (wall.collidesWith(colony)) {
				colony = new Colony(this);
				i = -1;
			}

			//Spawn the colony as far away as possible from the foods
			for (var j = 0; j < this.foods.length; j++) {
				let food = this.foods[j];
				if (colony.position.dist(food.position) < colony.radius + food.radius + range) {
					colony = new Colony(this);
					range -= 5;
					i = -1;
				}
			}

			if (new Date().getTime() - startTime > 1000) {
				colony = null;
				break;
			}
		}

		if (colony) this.colonies.push(colony);
		return colony;
	}
}