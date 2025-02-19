/**
 * Kurs: Generative Gesltatung, Semesterabgabe 2025
 * Author: Silas Hering, 901107
 */

class Data {
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

	initSensors() {
		this.#initAbsoluteOrientation();
		this.#initSound();
		this.#initAcceleration();
		this.#initAltitude();
		this.#initDeviceDimensions();
		this.#initSalt();
	}

	#initAbsoluteOrientation() {}
	#getAbsoluteOrientation() {}

	#initSound() {
		try {
			this.#sound_mic = new p5.AudioIn();
			this.#sound_mic.start();
			this.#sound_mic.disconnect();
		} catch (e) {
			throw new Error(e);
		}
	}
	#getSound() {
		let currentLevel = this.#sound_mic.getLevel();

		this.#sound_process.push(currentLevel);
		const LENGTH_OF_AVERAGE = 80;
		if (this.#sound_process.length >= LENGTH_OF_AVERAGE) {
			this.#sound_process.shift();
		}

		// average and round to second decimal point
		let average = this.#sound_process.reduce((a, b) => a + b) / this.#sound_process.length;
		let roundedAverage = Math.round(average * 100) / 100;

		this.sound = roundedAverage;
	}

	#initAcceleration() {}
	#getAcceleration() {}

	#initAltitude() {
		if ("geolocation" in navigator) {
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
		} else {
			throw new Error("Geolocation is not supported");
		}
	}
	#getPositionData() {
		this.altitude = this.#current_altitude;
		this.latitude = this.#current_latitude;
		this.longitude = this.#current_longitude;
	}

	#initDeviceDimensions() {
		this.dimensions = { width: window.innerWidth, height: window.innerHeight };
	}

	/**
	 * Generates a random number that can be used to make results more different
	 */
	#initSalt() {
		const SALT_MIN = 0;
		const SALT_MAX = 5;
		let randomNumber = Math.floor(Math.random() * (SALT_MAX - SALT_MIN + 1) + SALT_MIN);
		this.salt = randomNumber;
	}

	/**
	 * Refreshes all gathered data
	 */
	refresh() {
		this.#getAbsoluteOrientation();
		this.#getSound();
		this.#getAcceleration();
		this.#getPositionData();
	}
}

class Blur {
	constructor(x = 0, y = 0, dimensions = 200, givenIntensity = 10) {
		this.initXPos = x;
		this.xPos = x;

		this.initYPos = y;
		this.yPos = y;

		this.initDimensions = dimensions;
		this.dimensions = dimensions;

		this.initIntensity = givenIntensity;
		this.intensity = givenIntensity;

		this.elem = document.querySelector(".initial-blur").cloneNode(true);
		this.elem.classList.remove("initial-blur");

		document.querySelector("#canvas-container").insertBefore(this.elem, this.elem.nextSilbling);

		this.elem.style.transform = `translate(${this.xPos - this.dimensions / 2}px, ${this.yPos - this.dimensions / 2}px)`;
		this.elem.style.width = this.dimensions + "px";
		this.elem.style.height = this.dimensions + "px";
		this.elem.style.backdropFilter = `blur(${this.intensity}px)`;
	}
	x(x) {
		this.xPos = x;
		this.elem.style.transform = `translate(${this.xPos - this.dimensions / 2}px, ${this.yPos - this.dimensions / 2}px)`;
		return this;
	}
	y(y) {
		this.yPos = y;
		this.elem.style.transform = `translate(${this.xPos - this.dimensions / 2}px, ${this.yPos - this.dimensions / 2}px)`;
		return this;
	}
	setIntensity(intens) {
		this.intensity = intens;
		this.elem.style.backdropFilter = `blur(${this.intensity}px)`;
		return this;
	}
}

/** @type {any} - Stores the sensor data object */
let data;

/** @type {any[]} - Stores all spheres */
let sceneSpheres = [];

/** @type {any[]} - Stores all cylinders */
let sceneCylinders = [];

let blurs = [];
function setup() {
	let canvas = createCanvas(600, 600, WEBGL);
	canvas.parent("canvas-container");
	noStroke();

	data = new Data();
	data.initSensors();

	blurs.push(new Blur((width / 6) * 2, (height / 6) * 2, (width / 6) * 3, 10));
	blurs.push(new Blur((width / 6) * 4, (height / 6) * 4, (width / 6) * 3, 5));
	blurs.push(new Blur((width / 6) * 3.5, (height / 6) * 3, (width / 6) * 2, 3));
	blurs.push(new Blur((width / 6) * 2, (height / 6) * 4.5, (width / 6) * 4, 3));

	const AMOUNT_OF_SPHERES = 7;
	const AMOUNT_OF_CYLINDERS = 7;

	for (let i = 0; i < AMOUNT_OF_SPHERES; i++) {
		let gradientArray = gradientColorArrayGenerator(random(2, 5));
		sceneSpheres.push(createGradientTexture(100, 100, gradientArray));
	}
	for (let i = 0; i < AMOUNT_OF_CYLINDERS; i++) {
		let gradientArray = gradientColorArrayGenerator(random(4, 10));
		sceneCylinders.push(createGradientTexture(100, 100, gradientArray));
	}
}

/**
 * Generate an array of random picked colors
 *
 * @param {Number} steps - steps the gradient will have
 */
function gradientColorArrayGenerator(steps) {
	const AVAILABLE_COLORS = [
		color("#e5b750"),
		color("#d4632a"),
		color("#d76fc8"),
		color("#373bbe"),
		color("#5b2814"),
		color("#95bb5e"),
		color("#2d1c3f"),
	];

	// cap steps size
	steps > AVAILABLE_COLORS.length ? (steps = AVAILABLE_COLORS.length) : (steps = steps);
	steps == 1 ? (steps = 2) : (steps = steps);

	// Fisher-Yates Shuffle
	let cIndex = AVAILABLE_COLORS.length;
	while (cIndex != 0) {
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
function createGradientTexture(w = 100, h = 100, colors) {
	let cT = createGraphics(w, h);

	// Loop over every pixel of the texture
	for (let x = 0; x < w; x++) {
		for (let y = 0; y < h; y++) {
			let stopSize = Math.round(w / (colors.length - 1));
			let colorEntryIndex = Math.floor(y / stopSize);

			if (colorEntryIndex >= colors.length - 1) {
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

/** @type {Number} */
let blurRotation = 0;

/** @type {Number} */
let objectRotation = 0;

/** @type {Number} */
let rotationSpeed = 0.001;

/** @type {Number} */
let rotationBlurSpeed = 0.01;

/** @type {Number} */
let smallestAnimationState = 10;

/** @type {Number} */
let biggestAnimationState = 50;

/** @type {Number} */
const OBJECT_QUALITY = 20;

/** @type {Number} - Speed of switching animation between spheres and cylinders */
let animationSpeed = 5;

/** @type {Number} - Number used in animation for scaling all objects */
let objectScaling = 50;

let cylinderRadius = 15;

/** @type {boolean} - Toggle between sphere and cylinder display */
let showSpheresToggle = true;

/** @type {boolean} - Stores breaking point in scaling animation */
let isSmallest = false;

/** @type {"slow"|"fast"} - Stores current mode the objects are spinning in */
let mode = "slow";

/** @type {"slow"|"fast"} - Stores the last mode the objects were spinning in */
let lastMode = mode;

/** @type {boolean} - Is true when scaling animation is permitted and animating, false when done */
let allowChange = false;

/** @type {"slow"|"fast"} - Type of animation, "slow" = from slow to fast, "fast" = from fast to slow */
let changeType;

function draw() {
	const BACKGROUND_COLOR = "#d9d6d3";
	background(BACKGROUND_COLOR);
	document.querySelector("body").style.backgroundColor = BACKGROUND_COLOR;

	// Rotate blurs around their position
	blurs.forEach((el) => {
		el.x(el.initXPos + 50 * cos(blurRotation)).y(el.initYPos + 50 * sin(blurRotation));
	});

	data.refresh();
	//console.log(data.sound, data.dimensions, data.altitude, data.longitude, data.latitude, data.salt);

	/** @type {Number} - Radius of animated object based on amount of objects in scene */
	let R_Object = objectScaling / sin(PI / sceneSpheres.length);

	if (data.sound >= 0.7) {
		mode = "fast";
	} else {
		mode = "slow";
	}

	if (mode !== lastMode) {
		if (allowChange === false) {
			changeType = lastMode === "slow" ? "slow" : "fast";
			/*
			if(lastMode === "slow"){
				changeType = "slow";
			}else if(lastMode === "fast"){
				changeType = "fast";
			}
			*/
		}
		allowChange = true;
	}

	if (allowChange) {
		if (objectScaling > smallestAnimationState && isSmallest === false) {
			objectScaling -= animationSpeed;
		} else {
			// fires when scaling animation is the smallest and the shown
			// objects (spheres or cylinders) shall be switched
			isSmallest = true;
			showSpheresToggle = changeType === "slow" ? false : true;
		}

		if (isSmallest && objectScaling < biggestAnimationState) {
			objectScaling += animationSpeed;
		} else if (isSmallest && objectScaling >= biggestAnimationState) {
			// fires when the whole animation cycle is done
			allowChange = false;
			isSmallest = false;
		}
	}
	lastMode = mode;

	if (showSpheresToggle) {
		sceneSpheres.forEach((obj, i) => {
			let angleSphere = (TWO_PI * i) / sceneSpheres.length + objectRotation;
			let x = R_Object * cos(angleSphere);
			let y = R_Object * sin(angleSphere);

			push();
			translate(x, y, 0);
			rotateZ(angleSphere);
			texture(obj);
			sphere(objectScaling, OBJECT_QUALITY, OBJECT_QUALITY);
			pop();
		});
	} else {
		sceneCylinders.forEach((obj, i) => {
			let angleCylinder = (TWO_PI * i) / (sceneCylinders.length * 2) + objectRotation;

			push();
			translate(0, 0, i * -(cylinderRadius * 2));
			rotateZ(angleCylinder * (i + 1));
			texture(obj);
			// Match length of cylinder to outer most part of spheres
			cylinder(cylinderRadius, R_Object * 2 + objectScaling * 2, OBJECT_QUALITY, OBJECT_QUALITY);
			pop();
		});
	}

	blurRotation += rotationBlurSpeed;
	objectRotation += rotationSpeed + data.sound / 45;
}
