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

		this.mouse = Game.utils.createVector();

		//World objects
		this.ants = [];

		for (var i = 0; i < 1; i++) {
			let ant = new Ant(this);
			this.ants.push(ant);
		}
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

		//Render ants
		for (let ant of this.ants) {
			ant.render();
		}

		//End camera
		this.camera.end();
	}

	update() {
		//Update ants
		for (let ant of this.ants) {
			ant.update();
		}

		//Update world mouse
		let worldMouse = this.camera.screenToWorld(Game.constants.mouse.x, Game.constants.mouse.y);
		this.mouse.set(worldMouse);
	}

	getRandomPosition() {
		let x = Game.utils.random(this.bounds.min.x, this.bounds.max.x);
		let y = Game.utils.random(this.bounds.min.y, this.bounds.max.y);
		return Game.utils.createVector(x, y);
	}
}