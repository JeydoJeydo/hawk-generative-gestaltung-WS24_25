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
	for(let i = 0; i < 10; i++){
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


let angle = 0;

function draw() {
	//shader(myShader);
	background(200);
	orbitControl();

	// Rotate blurs around their position
	let radi = 50;
	blurs.forEach(el => {
		el.x(el.initXPos + 50 * cos(angle)).y(el.initYPos + 50 * sin(angle));
	})
	angle++;

	/*
	data.refresh();
	console.log(data.sound, data.dimensions, data.altitude, data.longitude, data.latitude, data.salt);
	*/

	let sphereRadius = 50;
	let R_Sphere = sphereRadius / sin(PI / sceneObjects.length);

	let cylinderRadius = 15;
	let cylinderHeight = 200;
	let R_Cylinder = sphereRadius / sin(PI / sceneObjectsTwo.length);

	if(false){
		sceneObjects.forEach((obj, i)=> {
			let angle = TWO_PI * i / sceneObjects.length;
			let x = R_Sphere * cos(angle);
			let y = R_Sphere * sin(angle);

			push();
			translate(x, y, 0);
			rotateZ(angle);
			texture(obj);
			sphere(50, 50, 50);
			pop();
		});
	}else{
		sceneObjectsTwo.forEach((obj, i)=> {
			let angleTwo = TWO_PI * i / sceneObjects.length;
			push();
			translate(0, 0, i * (cylinderRadius * 2));
			rotateZ(angleTwo);
			texture(obj);
			cylinder(cylinderRadius, cylinderHeight, 50);
			pop();
		});
	}
}
