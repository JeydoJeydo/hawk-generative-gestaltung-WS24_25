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
	#sound_process = [];

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
		let currentLevel = this.#sound_mic.getLevel();

		this.#sound_process.push(currentLevel);
		const LENGTH_OF_AVERAGE = 80;
		if(this.#sound_process.length >= LENGTH_OF_AVERAGE){
			this.#sound_process.shift();
		}

		// average and round to second decimal point
		let average = this.#sound_process.reduce((a, b) => a + b) / this.#sound_process.length;
		let roundedAverage = Math.round(average * 100) / 100;

		this.sound = roundedAverage;
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

		this.elem = document.querySelector(".initial-blur").cloneNode(true);
		this.elem.classList.remove("initial-blur");

		document.querySelector("#canvas-container").insertBefore(this.elem, this.elem.nextSilbling);

		this.elem.style.left = this.xPos - (this.dimensions / 2) + "px";
		this.elem.style.top = this.yPos - (this.dimensions / 2) + "px";
		this.elem.style.width = this.dimensions + "px";
		this.elem.style.height = this.dimensions + "px";
	}
	x(x){
		this.xPos = x;
		this.elem.style.left = this.xPos - (this.dimensions / 2) + "px";
		return this;
	}
	y(y){
		this.yPos = y;
		this.elem.style.top = this.yPos - (this.dimensions / 2) + "px";
		return this;
	}
}

let gg;

let data;
let sceneObjects = [];
let sceneObjectsTwo = [];

let blurs = [];
function setup() {
	let canvas = createCanvas(600, 600, WEBGL);
	canvas.parent("canvas-container");
	//angleMode(DEGREES);

	data = new Data();
	data.initSensors();
	noStroke();

	/*
	blurs.push(new Blur(250, 400, 300));
	blurs.push(new Blur(380, 350, 400));
	blurs.push(new Blur(250, 250, 400));
	*/

	for(let i = 0; i < 7; i++){
		let gradientArray = gradientColorArrayGenerator(random(2, 5));
		sceneObjects.push(createGradientTexture(100, 100, gradientArray));
	}
	for(let i = 0; i < 5; i++){
		let gradientArray = gradientColorArrayGenerator(random(4, 10));
		sceneObjectsTwo.push(createGradientTexture(100, 100, gradientArray));
	}
}

/**
 * Generate an array of random picked colors
 *
 * @param {Number} steps - steps the gradient will have
 */
function gradientColorArrayGenerator(steps){
	const AVAILABLE_COLORS = [color("#e5b750"), color("#d4632a"), color("#d76fc8"), color("#373bbe"), color("#5b2814"), color("#95bb5e"), color("#2d1c3f")];

	// cap steps size
	steps > AVAILABLE_COLORS.length ? (steps = AVAILABLE_COLORS.length) : (steps = steps);
	steps == 1 ? (steps = 2) : (steps = steps);

	// Fisher-Yates Shuffle
	let cIndex = AVAILABLE_COLORS.length;
	while (cIndex != 0){
		let randomIndex = Math.floor(Math.random() * cIndex);
		cIndex--;
		[AVAILABLE_COLORS[cIndex], AVAILABLE_COLORS[randomIndex]] = [AVAILABLE_COLORS[randomIndex], AVAILABLE_COLORS[cIndex]];
	}

	let cappedColors = AVAILABLE_COLORS.splice(0, steps);

	return cappedColors;
}

/**
 * Creates a gradient texture
 *
 * @param {Number} w - width of texture
 * @param {Number} h - height of texture
 * @param {Any[]} colors - array of colors the gradient will get build from
 * @returns {Any} - Texture to be used on a 3d object
 */
function createGradientTexture(w = 100, h = 100, colors){
	let cT = createGraphics(w, h);

	// Loop over every pixel of the texture
	for(let x = 0; x < w; x++){
		for(let y = 0; y < h; y++){
			let stopSize = Math.round(w / (colors.length - 1));
			let colorEntryIndex = Math.floor(y / stopSize);

			if(colorEntryIndex >= colors.length - 1){
				colorEntryIndex = colors.length - 2;
			}

			let cur = colors[colorEntryIndex];
			let nex = colors[colorEntryIndex + 1];
			let inter = map(y % stopSize, 0, stopSize, 0, 1);
			let lerpedColor = lerpColor(cur, nex, inter);
			
			let gradientStops = colors.length - 1;

			cT.set(x, y, lerpedColor);
		}
	}
	cT.updatePixels();
	return cT;
}



// wenn leise = kreise langsam drehend
// wenn lauter = viele Stangen voreinander
// drehbewegung an Lautstärke koppeln
// farbe an Lautstärke koppeln

let blurRotation = 0;
let objectRotation = 0;

let rotationSpeed = 0.001;
let rotationBlurSpeed = 0.01;

function draw() {
	//shader(myShader);
	background("#d9d6d3");
	orbitControl();

	// Rotate blurs around their position
	let radi = 50;
	blurs.forEach(el => {
		el.x(el.initXPos + 50 * cos(blurRotation)).y(el.initYPos + 50 * sin(blurRotation));
	})

	data.refresh();
	//console.log(data.sound, data.dimensions, data.altitude, data.longitude, data.latitude, data.salt);

	let sphereRadius = 50;

	let cylinderRadius = 15;
		
	let R_Sphere = sphereRadius / sin(PI / sceneObjects.length);

	if(data.sound < 0.5){
		sceneObjects.forEach((obj, i)=> {
			let angleSphere = TWO_PI * i / sceneObjects.length + objectRotation;
			let x = R_Sphere * cos(angleSphere);
			let y = R_Sphere * sin(angleSphere);

			push();
			translate(x, y, 0);
			rotateZ(angleSphere);
			texture(obj);
			sphere(50, 50, 50);
			pop();
		});
	}else{
		sceneObjectsTwo.forEach((obj, i)=> {
			let angleCylinder = TWO_PI * i / (sceneObjectsTwo.length * 2) + objectRotation;

			push();
			translate(0, 0, i * (cylinderRadius * 2));
			rotateZ(angleCylinder);
			texture(obj);
			// Match length of cylinder to outer most part of spheres
			cylinder(cylinderRadius, (R_Sphere * 2) + sphereRadius, 50);
			pop();
		});
	}

	blurRotation += rotationBlurSpeed;
	objectRotation += rotationSpeed + (data.sound / 15);
}
