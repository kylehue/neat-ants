class Ant {
	constructor(colony) {
		this.colony = colony;
		this.food = null;
		this.position = this.colony.position.copy();
		this.velocity = Game.utils.createVector();
		this.angle = Game.utils.random(-Math.PI, Math.PI);
		this.foodDetectionRadius = Math.max(this.colony.world.size / 4, 250);
		this.size = 5;
		this.color = "#fff";
		this.speed = 1;
		this.sensors = {
			front: Game.utils.createVector(),
			left: Game.utils.createVector(),
			right: Game.utils.createVector()
		};

		this.vertices = [];

		this.translate(this.position.x, this.position.y);
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
			fillStyle: this.color,
		});

		if (this.food) this.food.render();
	}

	renderSensors() {
		Game.draw(context => {
			//front
			context.beginPath();
			context.moveTo(this.position.x + Math.cos(this.angle) * this.size, this.position.y + Math.sin(this.angle) * this.size);
			context.lineTo(this.sensors.front.x, this.sensors.front.y);
			context.closePath();
		}, {
			strokeStyle: "#ff00ff",
			lineWidth: 0.5
		});

		Game.draw(context => {
			//front left
			context.beginPath();
			context.moveTo(this.position.x + Math.cos(this.angle) * this.size, this.position.y + Math.sin(this.angle) * this.size);
			context.lineTo(this.sensors.left.x, this.sensors.left.y);
			context.closePath();
		}, {
			strokeStyle: "#ff00ff",
			lineWidth: 0.5
		});

		Game.draw(context => {
			//front right
			context.beginPath();
			context.moveTo(this.position.x + Math.cos(this.angle) * this.size, this.position.y + Math.sin(this.angle) * this.size);
			context.lineTo(this.sensors.right.x, this.sensors.right.y);
			context.closePath();
		}, {
			strokeStyle: "#ff00ff",
			lineWidth: 0.5
		});

		Game.draw(context => {
			context.beginPath();
			context.arc(this.sensors.front.x, this.sensors.front.y, 3, 0, Math.PI * 2);
			context.closePath();
		}, {
			fillStyle: "#ff00ff"
		});

		Game.draw(context => {
			context.beginPath();
			context.arc(this.sensors.left.x, this.sensors.left.y, 3, 0, Math.PI * 2);
			context.closePath();
		}, {
			fillStyle: "#ff00ff"
		});

		Game.draw(context => {
			context.beginPath();
			context.arc(this.sensors.right.x, this.sensors.right.y, 3, 0, Math.PI * 2);
			context.closePath();
		}, {
			fillStyle: "#ff00ff"
		});
	}

	translate(x, y) {
		this.position.set({
			x: x,
			y: y
		});

		this.vertices = [
			Game.utils.createVector(
				this.position.x - this.size,
				this.position.y - this.size / 2
			),
			Game.utils.createVector(
				this.position.x + this.size,
				this.position.y - this.size / 2
			),
			Game.utils.createVector(
				this.position.x + this.size,
				this.position.y + this.size / 2
			),
			Game.utils.createVector(
				this.position.x - this.size,
				this.position.y + this.size / 2
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

	lookBack() {
		this.angle += Math.PI;
		this.position.add({
			x: Math.cos(this.angle) * 5,
			y: Math.sin(this.angle) * 5
		});
	}

	update() {
		//Carry the food if there is one
		if (this.food) {
			this.food.position.set({
				x: this.position.x + Math.cos(this.angle) * this.size,
				y: this.position.y + Math.sin(this.angle) * this.size
			});
		}

		//Update position, velocity, angle
		this.position.add(this.velocity);
		this.velocity.set({
			x: Math.cos(this.angle),
			y: Math.sin(this.angle)
		});
		this.translate(this.position.x, this.position.y);

		//Update sensors
		this.updateSensors();

		if (Game.utils.keyIsDown(87)) {
			this.velocity.setMag(this.speed);
		} else {
			this.velocity.setMag(0);
		}

		if (Game.utils.keyIsDown(68)) {
			this.angle += 0.1;
		}

		if (Game.utils.keyIsDown(65)) {
			this.angle -= 0.1;
		}

		this.think();
	}

	think() {
		let inputs = this.getInputs();
		inputs = Object.values(inputs);
		let outputs = 0;
	}

	static getIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
		const tn = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4);
		const td = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		const t = tn / td;

		const un = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
		const ud = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		const u = un / ud;
		if (t > 0 && u > 0 && u < 1) {
			return {
				x: x1 + t * (x2 - x1),
				y: y1 + t * (y2 - y1),
				t: t
			};
		} else {
			return null;
		}
	}

	updateSensors() {
		//Set sensors
		let startPoint = {
			x: this.position.x + Math.cos(this.angle) * this.size,
			y: this.position.y + Math.sin(this.angle) * this.size
		}

		this.sensors.front.set({
			x: this.position.x + Math.cos(this.angle) * Number.MAX_SAFE_INTEGER,
			y: this.position.y + Math.sin(this.angle) * Number.MAX_SAFE_INTEGER
		});

		this.sensors.left.set({
			x: this.position.x + Math.cos(this.angle - Math.PI * 0.15) * Number.MAX_SAFE_INTEGER,
			y: this.position.y + Math.sin(this.angle - Math.PI * 0.15) * Number.MAX_SAFE_INTEGER
		});

		this.sensors.right.set({
			x: this.position.x + Math.cos(this.angle + Math.PI * 0.15) * Number.MAX_SAFE_INTEGER,
			y: this.position.y + Math.sin(this.angle + Math.PI * 0.15) * Number.MAX_SAFE_INTEGER
		});

		//Compute intersections
		let nearestIntersectionFront;
		let minFront = Infinity;
		let nearestIntersectionLeft;
		let minLeft = Infinity;
		let nearestIntersectionRight;
		let minRight = Infinity;
		for (let wall of this.colony.world.walls) {
			for (var i = 0; i < wall.vertices.length; i++) {
				let vertex = wall.vertices[i];
				let nextIndex = i + 1 == wall.vertices.length ? 0 : i + 1;
				let nextVertex = wall.vertices[nextIndex];

				//Front
				let intersectionFront = Ant.getIntersection(startPoint.x, startPoint.y, this.sensors.front.x, this.sensors.front.y, vertex.x, vertex.y, nextVertex.x, nextVertex.y);
				if (intersectionFront) {
					if (intersectionFront.t < minFront) {
						minFront = intersectionFront.t;
						nearestIntersectionFront = intersectionFront;
					}
				}

				//Left
				let intersectionLeft = Ant.getIntersection(startPoint.x, startPoint.y, this.sensors.left.x, this.sensors.left.y, vertex.x, vertex.y, nextVertex.x, nextVertex.y);
				if (intersectionLeft) {
					if (intersectionLeft.t < minLeft) {
						minLeft = intersectionLeft.t;
						nearestIntersectionLeft = intersectionLeft;
					}
				}

				//Right
				let intersectionRight = Ant.getIntersection(startPoint.x, startPoint.y, this.sensors.right.x, this.sensors.right.y, vertex.x, vertex.y, nextVertex.x, nextVertex.y);
				if (intersectionRight) {
					if (intersectionRight.t < minRight) {
						minRight = intersectionRight.t;
						nearestIntersectionRight = intersectionRight;
					}
				}
			}
		}

		if (nearestIntersectionFront) {
			this.sensors.front.set(nearestIntersectionFront);
		}

		if (nearestIntersectionLeft) {
			this.sensors.left.set(nearestIntersectionLeft);
		}

		if (nearestIntersectionRight) {
			this.sensors.right.set(nearestIntersectionRight);
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

	getInputs() {
		const inputs = {};
		const world = this.colony.world;
		//Input #1: Front sensor distance
		inputs.frontSensorDistance = this.sensors.front.dist(this.position);
		inputs.frontSensorDistance = Game.utils.map(inputs.frontSensorDistance, 0, world.size, 0, 1);

		//Input #2: Left sensor distance
		inputs.leftSensorDistance = this.sensors.left.dist(this.position);
		inputs.leftSensorDistance = Game.utils.map(inputs.leftSensorDistance, 0, world.size, 0, 1);

		//Input #3: Right sensor distance
		inputs.rightSensorDistance = this.sensors.right.dist(this.position);
		inputs.rightSensorDistance = Game.utils.map(inputs.rightSensorDistance, 0, world.size, 0, 1);

		//Input #4 & #5: Closest food position
		//Get all foods inside the ant's detection radius
		const detectedFoods = [];
		for (let food of world.foods) {
			if (food.position.dist(this.position) < food.radius + this.foodDetectionRadius) {
				detectedFoods.push(food);
			}
		}

		//Sort by closest
		detectedFoods.sort((a, b) => {
			return this.position.dist(a.position) - this.position.dist(b.position);
		});

		const closestFood = detectedFoods[0];
		let closestFoodX = Game.utils.random(0, 1);
		let closestFoodY = Game.utils.random(0, 1);

		if (closestFood) {
			closestFoodX = Game.utils.map(closestFood.position.x, world.bounds.min.x, world.bounds.max.x, 0, 1);
			closestFoodY = Game.utils.map(closestFood.position.y, world.bounds.min.y, world.bounds.max.y, 0, 1);
		}

		inputs.closestFoodX = closestFoodX;
		inputs.closestFoodY = closestFoodY;

		//Input #6 & #7: Colony position
		inputs.colonyX = Game.utils.map(this.colony.position.x, world.bounds.min.x, world.bounds.max.x, 0, 1);
		inputs.colonyY = Game.utils.map(this.colony.position.y, world.bounds.min.y, world.bounds.max.y, 0, 1);

		return inputs;
	}
}