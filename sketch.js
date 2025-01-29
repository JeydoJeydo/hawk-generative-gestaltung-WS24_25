class Data{
	// ABSOLUTE ORIENTATION
	absoluteOrientation = undefined;

	// SOUND
	sound = undefined;
	#sound_mic = undefined;

	// ACCELERATION
	acceleration = undefined;

	// ALTITUDE
	altitude = undefined;

	// DIMENSIONS
	dimensions = undefined;

	constructor(){
		/*
		this.#getAbsoluteOrientation();
		this.#getAcceleration();
		this.#getAltitude();
		this.#getDeviceDimensions();
		*/
	}

	initSensors(){
		this.#initSound();
		this.#getDeviceDimensions();
	}

	#getAbsoluteOrientation(){
		console.log("absolute orientation");
	};

	#initSound(){
		try{
			this.#sound_mic = new p5.AudioIn();
			let delay = new p5.Delay(0.74, 0.1);

			this.#sound_mic.disconnect();
			this.#sound_mic.connect(delay);

			this.#sound_mic.start();
		}catch(e){
			throw new Error(e);
		}
	}
	#getSound(){
		this.sound = this.#sound_mic.getLevel();
	};

	#getAcceleration(){
		console.log("acceleration");
	};
	#getAltitude(){
		console.log("altitude");
	};
	#getDeviceDimensions(){
		this.dimensions = { width: window.innerWidth, height: window.innerHeight };
	};

	/**
	 * Refreshes all gathered data
	 */
	refresh(){
		this.#getSound();
	}
}

let data;
function setup() {
	createCanvas(400, 400);
	data = new Data();
	data.initSensors();
}

function draw() {
	background(200);
	data.refresh();
	console.log(data.sound, data.dimensions);
}
