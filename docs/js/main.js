addEventListener("load", function() {
	let evalTime = new Date().getTime();
	let genSavepoint = 40;
	let useTrainedData = true;
	window.neat = new Neat(9, 1, 2, {
		populationSize: 200,
		mutationRate: 0.35,
		warnings: true
	});
	window.maxEvalTime = 30000;

	if (useTrainedData) {
		Game.utils.loadJSON("js/training.json", json => {
			let genomes = neat.fromJSON(json);
			neat.import(genomes, neat.populationSize);
		});
	}

	let game = new Game();

	function saveGen() {
		let population = neat.toJSON();
		Game.utils.saveJSON(population, `NEAT_ANTS_GEN_${neat.population.generation + 1}_${new Date().toLocaleDateString()}`);
	}

	function nextEval() {
		neat.population.evolve();
		game.reset();

		if (neat.population.generation % genSavepoint == 0) {
			saveGen();
		}
		evalTime = new Date().getTime();
	}

	//Main loop
	let startTime = 0;
	(function animate() {
		game.render();
		game.update();

		if (new Date().getTime() - evalTime > maxEvalTime || !game.world.colonies[0].ants.length) {
			nextEval();
		}

		//Update frame rate
		let delta = (performance.now() - startTime) / 1000;
		Game.constants.frameRate = 1 / delta;
		startTime = performance.now();

		//Update total frames
		Game.constants.frameCount++;

		//Loop
		requestAnimationFrame(animate);
	})();

	//Event handlers
	addEventListener("resize", function() {
		//Resize canvas
		game.canvas.width = innerWidth;
		game.canvas.height = innerHeight;
	});

	addEventListener("mousemove", function(event) {
		//Update mouse
		Game.constants.mouse.set({
			x: event.clientX,
			y: event.clientY
		});
	});

	addEventListener("keydown", function(event) {
		Game.constants.keyIsPressed = true;
		Game.constants.keyCode = event.keyCode;
		Game.constants.activeKeys[event.keyCode] = event;
		if (event.keyCode == 39) nextEval();
		if (event.keyCode == 16) saveGen();
	});

	addEventListener("keyup", function(event) {
		Game.constants.keyIsPressed = false;
		Game.constants.keyCode = event.keyCode;
		delete Game.constants.activeKeys[event.keyCode];
	});
});