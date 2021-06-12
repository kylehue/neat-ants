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
		let topWall = new Wall(this);
		topWall.width = this.size;
		topWall.height = wallWidth;
		topWall.position.set({
			x: this.bounds.min.x,
			y: this.bounds.min.y
		});

		//Bottom wall
		let bottomWall = new Wall(this);
		bottomWall.width = this.size;
		bottomWall.height = wallWidth;
		bottomWall.position.set({
			x: this.bounds.min.x,
			y: this.bounds.max.y - bottomWall.height
		});

		//Left wall
		let leftWall = new Wall(this);
		leftWall.width = wallWidth;
		leftWall.height = this.size;
		leftWall.position.set({
			x: this.bounds.min.x,
			y: this.bounds.min.y
		});

		//Right wall
		let rightWall = new Wall(this);
		rightWall.width = wallWidth;
		rightWall.height = this.size;
		rightWall.position.set({
			x: this.bounds.max.x - rightWall.width,
			y: this.bounds.min.y
		});

		this.walls.push(topWall, bottomWall, leftWall, rightWall)

		for (var i = 0; i < 10; i++) {
			this.addWall();
		}

		for (var i = 0; i < 1; i++) {
			this.addColony();
		}

		for (var i = 0; i < 2; i++) {
			this.addFood();
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

		//Render walls
		for (let wall of this.walls) {
			wall.render();
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
			if (otherWall == wall) continue;
			if (wall.position.x + wall.width >= otherWall.position.x && wall.position.x <= otherWall.position.x + otherWall.width && wall.position.y + wall.height >= otherWall.position.y && wall.position.y <= otherWall.position.y + otherWall.height) {
				wall = new Wall(this);
				i = -1;
			}

			if (new Date().getTime() - startTime > 1000) break;
		}

		this.walls.push(wall);
		return wall;
	}

	addFood() {
		let food = new Food(this);
		let startTime = new Date().getTime();
		let range = this.size / 2;

		//Avoid spawning the food inside the walls
		for (var i = 0; i < this.walls.length; i++) {
			let wall = this.walls[i];
			if (food.position.x + food.radius >= wall.position.x && food.position.x - food.radius <= wall.position.x + wall.width && food.position.y + food.radius >= wall.position.y && food.position.y - food.radius <= wall.position.y + wall.height) {
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

			if (new Date().getTime() - startTime > 1000) break;
		}

		this.foods.push(food);
		return food;
	}

	addColony() {
		let colony = new Colony(this);
		let startTime = new Date().getTime();
		let range = this.size;

		//Avoid spawning the colony inside the walls
		for (var i = 0; i < this.walls.length; i++) {
			let wall = this.walls[i];
			if (colony.position.x + colony.radius >= wall.position.x && colony.position.x - colony.radius <= wall.position.x + wall.width && colony.position.y + colony.radius >= wall.position.y && colony.position.y - colony.radius <= wall.position.y + wall.height) {
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

			if (new Date().getTime() - startTime > 1000) break;
		}

		this.colonies.push(colony);
		return colony;
	}
}