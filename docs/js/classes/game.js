class Game {
	constructor() {
		//Setup the canvas
		this.canvas = document.createElement("canvas");
		document.body.appendChild(this.canvas);
		this.canvas.width = innerWidth;
		this.canvas.height = innerHeight;
		this.context = this.canvas.getContext("2d");
		Game.constants.context = this.context;
		Game.constants.canvas = this.canvas;

		//Game objects
		this.world = new World(this);

		this.frameRate = 0;
	}

	reset() {
		this.world = new World(this);
	}

	render() {
		//Clear
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		//Render world
		this.world.render();

		//Add text
		let textSize = 35;
		Game.draw(context => {
			context.fillText(`Generation ${neat.population.generation + 1}`, 0, this.canvas.height - textSize * 2);
			context.fillText(`Best: ${Math.round(neat.population.fittest.fitness)}`, 0, this.canvas.height - textSize);
			context.fillText(`FPS: ${this.frameRate}`, 0, this.canvas.height);
			context.fillStyle = "#00ff06";
		}, {
			textAlign: "left",
			textBaseline: "bottom",
			font: `${textSize}px verdana`
		});
	}

	update() {
		//Update world
		this.world.update();

		//Update frame rate text once every 10 frames
		if (Game.constants.frameCount % 10 == 0) {
			this.frameRate = Game.constants.frameRate.toString();
			this.frameRate = this.frameRate.substr(0, this.frameRate.indexOf(".") + 3);
		}
	}

	static draw(f, options) {
		options = options || {};
		const ctx = Game.constants.context;
		f(ctx);

		let keys = Object.keys(options);
		for (var i = 0; i < keys.length; i++) {
			let key = keys[i];
			ctx[key] = options[key];
		}

		if ("fillStyle" in options) ctx.fill();
		if ("strokeStyle" in options) ctx.stroke();
	}
}

Game.utils = {
	intersects: function(x1, y1, x2, y2, x3, y3, x4, y4) {
		let tn = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4);
		let td = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		let t = tn / td;
		let un = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
		let ud = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		let u = un / ud;
		return t <= 1 && t >= 0 && u >= 0 && u <= 1;
	},
	SAT: function(verticesA, verticesB) {
		const getAxes = function(vertices) {
			let axes = [];
			for (var i = 0; i < vertices.length; i++) {
				let currentVertex = vertices[i];
				let nextVertex = vertices[i + 1 == vertices.length ? 0 : i + 1];
				let axisNormal = {
					x: nextVertex.y - currentVertex.y,
					y: -(nextVertex.x - currentVertex.x)
				};

				axes.push(axisNormal);
			}

			return axes;
		}

		const getProjection = function(axis, vertices) {
			let min = Infinity;
			let max = -Infinity;

			for (let vertex of vertices) {
				let projection = axis.x * vertex.x + axis.y * vertex.y;
				min = projection < min ? projection : min;
				max = projection > max ? projection : max;
			}

			return {
				min: min,
				max: max
			}
		}

		const getResult = function(verticesA, verticesB) {
			let axesA = getAxes(verticesA);
			let axesB = getAxes(verticesB);

			for (let axis of axesA) {
				let projectionA = getProjection(axis, verticesA);
				let projectionB = getProjection(axis, verticesB);

				if (!(projectionB.max >= projectionA.min && projectionA.max >= projectionB.min)) {
					return false;
				}
			}

			for (let axis of axesB) {
				let projectionA = getProjection(axis, verticesA);
				let projectionB = getProjection(axis, verticesB);

				if (!(projectionB.max >= projectionA.min && projectionA.max >= projectionB.min)) {
					return false;
				}
			}

			return true;
		}

		return getResult(verticesA, verticesB);
	},
	createVector: function(x, y) {
		x = typeof x != "number" ? 0 : x;
		y = typeof y != "number" ? 0 : y;

		function Vector(x, y) {
			this.x = x;
			this.y = y;
		}

		Vector.prototype = {
			add: function(v) {
				this.x += v.x;
				this.y += v.y;
				return this;
			},
			sub: function(v) {
				this.x -= v.x;
				this.y -= v.y;
				return this;
			},
			mult: function(v) {
				this.x *= v.x;
				this.y *= v.y;
				return this;
			},
			div: function(v) {
				this.x /= v.x;
				this.y /= v.y;
				return this;
			},
			set: function(v) {
				this.x = v.x;
				this.y = v.y;
				return this;
			},
			dist: function(v) {
				return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
			},
			dot: function(v) {
				return this.x * v.x + this.y * v.y;
			},
			heading: function(v) {
				let angle = 0;
				if (!v) angle = Math.atan2(this.y, this.x);
				else angle = Math.atan2(v.y - this.y, v.x - this.x);
				return angle;
			},
			copy: function() {
				return new Vector(this.x, this.y);
			},
			setMag: function(n) {
				let len = Math.sqrt(this.x * this.x + this.y * this.y);
				len = len == 0 ? 0.001 : len;
				this.x *= (1 / len) * n;
				this.y *= (1 / len) * n;
				return this;
			},
			random2D: function(n) {
				n = typeof n != "number" ? 1 : n;
				this.x = Game.utils.random(-n, n);
				this.y = Game.utils.random(-n, n);
				this.setMag(n);
				return this;
			}
		}

		return new Vector(x, y);
	},
	lerp: function(start, stop, per) {
		return per * (stop - start) + start;
	},
	dist: function(x1, y1, x2, y2) {
		return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	},
	map: function(n, start1, stop1, start2, stop2) {
		return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
	},
	random: function() {
		if (arguments.length == 2 && typeof arguments[0] == "number" && typeof arguments[1] == "number") {
			return Math.random() * (arguments[1] - arguments[0]) + arguments[0];
		} else if (arguments.length == 1 && typeof arguments[0] == "number") {
			return Math.random() * arguments[0];
		} else if (Array.isArray(arguments[0])) {
			return arguments[0][Math.floor(Math.random() * arguments[0].length)];
		} else if (arguments.length > 2) {
			let args = [...arguments];
			return args[Math.floor(Math.random() * args.length)];
		}
	},
	hexToRGB: function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		};
	},
	keyIsDown: function(keyCode) {
		return keyCode in Game.constants.activeKeys;
	},
	loadJSON: function(src, callback) {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", src);

		xhr.onload = function() {
			const res = JSON.parse(xhr.response);
			if (typeof callback == "function") callback(res);
		}
		xhr.send(null);
	},
	saveJSON: function(json, filename) {
		json = JSON.stringify(json);
		const data = new Blob([json], {
			type: "application/json"
		});

		const textFile = window.URL.createObjectURL(data);
		const link = document.createElement("a");
		link.setAttribute("download", `${filename}.json`);
		link.href = textFile;
		const event = new MouseEvent("click");
		link.dispatchEvent(event);
		link.remove();
	},
	loadImage: function(src, callback) {
		const imgCanvas = document.createElement("canvas");
		const imgContext = imgCanvas.getContext("2d");
		const img = new Image();
		img.src = src;

		img.onload = function() {
			imgCanvas.width = img.width;
			imgCanvas.height = img.height;
			imgContext.drawImage(img, 0, 0, img.width, img.height);
			if (typeof callback == "function") callback(imgCanvas);
		}
	}
}

Game.constants = {
	canvas: null,
	context: null,
	mouse: Game.utils.createVector(),
	frameCount: 0,
	frameRate: 0,
	keyIsPressed: false,
	keyCode: null,
	activeKeys: {}
}