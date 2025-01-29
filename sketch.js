/**
 * Kurs: Generative Gesltatung, Semesterabgabe 2025
 * Author: Silas Hering, 901107
 */

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

	// SALT
	/** @type {Number|undefined} - Random value */
	salt = undefined;

	initSensors(){
		this.#initAbsoluteOrientation();
		this.#initSound();
		this.#initAcceleration();
		this.#initAltitude();
		this.#initDeviceDimensions();
		this.#initSalt();
	}

	#initAbsoluteOrientation(){
	}
	#getAbsoluteOrientation(){
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
	};
	#getAcceleration(){
	};

	#initAltitude(){
		if("geolocation" in navigator){
			let watchListener = navigator.geolocation.watchPosition(
				(position) => {
					this.#current_altitude = position.coords.altitude; // Is null on non-mobile devices
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
	#getPositionData(){
		this.altitude = this.#current_altitude;
		this.latitude = this.#current_latitude;
		this.longitude = this.#current_longitude;
	};

	#initDeviceDimensions(){
		this.dimensions = { width: window.innerWidth, height: window.innerHeight };
	};

	/**
	 * Generates a random number that can be used to make results more different
	 */
	#initSalt(){
		const SALT_MIN = 0;
		const SALT_MAX = 5;
		let randomNumber = Math.floor(Math.random() * (SALT_MAX - SALT_MIN + 1) + SALT_MIN);
		this.salt = randomNumber;
	}

	/**
	 * Refreshes all gathered data
	 */
	refresh(){
		this.#getAbsoluteOrientation();
		this.#getSound();
		this.#getAcceleration();
		this.#getPositionData();
	}
}

class Blur{
	constructor(x = 0, y = 0, dimensions = 200){
		this.initXPos = x;
		this.xPos = x;

		this.initYPos = y;
		this.yPos = y;

		this.initDimensions = dimensions;
		this.dimensions = dimensions;

		this.elem = document.querySelector(".blur-field").cloneNode(true);

		document.querySelector("#canvas-container").insertBefore(this.elem, this.elem.nextSilbling);

		this.elem.style.left = this.xPos - (this.dimensions / 2);
		this.elem.style.top = this.yPos - (this.dimensions / 2);
		this.elem.style.width = this.dimensions;
		this.elem.style.height = this.dimensions;
	}
	x(x){
		this.xPos = x;
		this.elem.style.left = this.xPos - (this.dimensions / 2);
		return this;
	}
	y(y){
		this.yPos = y;
		this.elem.style.top = this.yPos - (this.dimensions / 2);
		return this;
	}
}

let data;

let firstBlur;
function setup() {
	let canvas = createCanvas(400, 400, WEBGL);
	//debugMode(GRID);
	canvas.parent("canvas-container");

	data = new Data();
	data.initSensors();
	noStroke();
	// DARKEST is goog
	//blendMode(DARKEST);
	//
	firstBlur = new Blur(300, 100, 300);
}



// wenn leise = kreise langsam drehend
// wenn lauter = viele Stangen voreinander
// drehbewegung an Lautstärke koppeln
// farbe an Lautstärke koppeln

function draw() {
	//shader(myShader);
	background(200);
	orbitControl();

	//firstBlur.x(firstBlur.xPos - 1).y(firstBlur.yPos + 1);
	//firstBlur.x(mouseX).y(mouseY);
	firstBlur.x(width / 2 + 50).y(width / 2 + 50);

	/*
	data.refresh();
	console.log(data.sound, data.dimensions, data.altitude, data.longitude, data.latitude, data.salt);
	*/

	
	/*
	pointLight(255, 255, 255, -100, -100, -100); // red
	pointLight(0, 0, 255, 100, 100, 100); // blue
	pointLight(0, 255, 0, -80, 20, -50); // yellow

	specularMaterial(255, 0, 0);
	*/

	pointLight(255, 255, 255, -100, -100, -100); // red
	pointLight(0, 0, 255, 100, 100, 100); // blue
	pointLight(0, 255, 0, -80, 20, -50); // yellow
	//pointLight(155, 155, 155, 150, -60, -50); // red-top-right

	//specularMaterial(255, 0, 0);

	for (let i = 0; i < 6; i++) {
		push();
		let x = cos(TWO_PI * i / 6) * 100;
		let y = sin(TWO_PI * i / 6) * 100;
		translate(x, y, 0);
		//normalMaterial(); // Vibrant color reflection
		if(i < 2){
			specularMaterial(255, 0, 0);
		}else if(i < 4){
			specularMaterial(120, 120, 0);
		}else{
			specularMaterial(20, 120, 0);
		}
		sphere(50, 50, 50);
		pop();
	}
}
