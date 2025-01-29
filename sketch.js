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
	#current_altitude = undefined;

	// LATITUDE
	latitude = undefined;
	#current_latitude = undefined;

	// LONGITUDE
	longitude = undefined;
	#current_longitude = undefined;

	// DIMENSIONS
	dimensions = undefined;

	constructor(){
		/*
		this.#getAcceleration();
		*/
	}

	initSensors(){
		//this.#initAbsoluteOrientation();
		this.#initSound();
		//this.#initAcceleration();
		this.#initAltitude();
		this.#getDeviceDimensions();
	}

	#initAbsoluteOrientation(){
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

	#initAcceleration(){
	}
	#getAcceleration(){
	};

	#initAltitude(){
		if("geolocation" in navigator){
			let watchListener = navigator.geolocation.watchPosition(
				(position) => {
					this.#current_altitude = position.coords.altitude; // Is null on non mobile devices
					this.#current_latitude = position.coords.latitude;
					this.#current_longitude = position.coords.longitude;
				},
				(error) => {
					throw new Error(error);
				}
			);
		}else{
			throw new Error("Geolocation is not supported");
		}
	};
	#getAltitude(){
		this.altitude = this.#current_altitude;
		this.latitude = this.#current_latitude;
		this.longitude = this.#current_longitude;
	};

	#getDeviceDimensions(){
		this.dimensions = { width: window.innerWidth, height: window.innerHeight };
	};

	/**
	 * Refreshes all gathered data
	 */
	refresh(){
		this.#getSound();
		this.#getAltitude();
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
	console.log(data.sound, data.dimensions, data.altitude, data.longitude, data.latitude);
}
