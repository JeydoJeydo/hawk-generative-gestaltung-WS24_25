/**
 * Kurs: Generative Gesltatung, Semesterabgabe 2025
 * Author: Silas Hering, 901107
 */



class Data {
	isInit = false;
	// ABSOLUTE ORIENTATION
	absoluteOrientation = undefined;

	orientationX = 0;
	orientationY = 0;
	orientationZ = 0;
	#current_orientationX = 0;
	#current_orientationY = 0;
	#current_orientationZ = 0;

	// SOUND
	sound = 0;
	#sound_mic = undefined;
	#sound_process = [];

	// ACCELERATION
	acceleration = 0;

	// ALTITUDE
	altitude = 0;
	#current_altitude = 0;

	// LATITUDE
	latitude = 0;
	#current_latitude = 0;

	// LONGITUDE
	longitude = 0;
	#current_longitude = 0;

	tileId = 0;

	// DIMENSIONS
	dimensions = undefined;

	// SALT
	/** @type {Number|undefined} - Random value */
	salt = undefined;

	initSensors() {
		this.isInit = true;
		this.#initAbsoluteOrientation();
		this.#initSound();
		this.#initAcceleration();
		this.#initAltitude();
		this.#initDeviceDimensions();
		this.#initSalt();
	}

	#initAbsoluteOrientation() {
		try{
			window.addEventListener("deviceorientation", (e) => {
				this.#current_orientationX = e.beta;
				this.#current_orientationY = e.gamma;
				this.#current_orientationZ = e.alpha;
			}, true);
		}catch(e){
			throw new Error("Error while initializing device orientation:", e);
		}
	}
	#getAbsoluteOrientation() {
		this.orientationX = this.#current_orientationX;
		this.orientationY = this.#current_orientationY;
		this.orientationZ = this.#current_orientationZ;
	}

	#initSound() {
		try {
			this.#sound_mic = new p5.AudioIn();
			this.#sound_mic.start();
			this.#sound_mic.disconnect();
		} catch (e) {
			throw new Error("Error while initializing sound:", e);
		}
	}
	#getSound() {
		let currentLevel = this.#sound_mic.getLevel();
		let levelAdjust = document.querySelector("#audioRanger").value / 100;
		this.#sound_mic.amp(levelAdjust);

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
	/**
	 * Convert the geographic coordinates to meters using the mercator projection
	 * {@link https://de.wikipedia.org/wiki/Mercator-Projektion}
	 */
	#latLonToMeters(lat, lon) {
		const R = 6378137; // Earth's radius in meters (WGS84)
		const x = R * lon * Math.PI / 180;
		const y = R * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
		return { x, y };
	}

	/**
	 * Divide the given coordinates into tiles
	 */
	#getTile(lat, lon, tileSize = 10) {
		const { x, y } = this.#latLonToMeters(lat, lon);
		const tileX = Math.floor(x / tileSize);
		const tileY = Math.floor(y / tileSize);
		return { tileX, tileY };
	}

	/**
	 * Map different colors to specific map tiles
	 */
	#getColorForTile(lat, lon, tileSize = 10) {
		const { tileX, tileY } = this.#getTile(lat, lon, tileSize);
		//const colors = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "cyan", "magenta"];
		const colors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		// Create a simple hash from the tile coordinates.
		const index = Math.abs(tileX * 31 + tileY) % colors.length;
		return colors[index];
	}
	#getPositionData() {
		this.altitude = this.#current_altitude;
		this.latitude = this.#current_latitude;
		this.longitude = this.#current_longitude;
		const TILE_SIZE = 5;
		this.tileId = this.#getColorForTile(this.#current_altitude, this.#current_latitude, TILE_SIZE);
		this.test = this.#getColorForTile(this.#current_altitude, this.#current_latitude, TILE_SIZE);
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

	//populateAnimation();	
}

/**
 * Adds rendered objects to the scene and generates
 * gradients for them.
 */
function populateAnimation(){
	blurs.push(new Blur((width / 6) * 2, (height / 6) * 2, (width / 6) * 3, 10));
	blurs.push(new Blur((width / 6) * 4, (height / 6) * 4, (width / 6) * 3, 5));
	blurs.push(new Blur((width / 6) * 3.5, (height / 6) * 3, (width / 6) * 2, 3));
	blurs.push(new Blur((width / 6) * 2, (height / 6) * 4.5, (width / 6) * 4, 3));

	const AMOUNT_OF_SPHERES = 7;
	const AMOUNT_OF_CYLINDERS = 7;

	for (let i = 0; i < AMOUNT_OF_SPHERES; i++) {
		let gradientArray = gradientColorArrayGenerator(random(2, 5), data.tileId);
		sceneSpheres.push(createGradientTexture(100, 100, gradientArray));
	}
	for (let i = 0; i < AMOUNT_OF_CYLINDERS; i++) {
		let gradientArray = gradientColorArrayGenerator(random(4, 10), data.tileId);
		sceneCylinders.push(createGradientTexture(100, 100, gradientArray));
	}
}

function resetAnimationState(){
	document.querySelectorAll(".blur-field").forEach(el => {
		if(!el.classList.contains("initial-blur")){
			el.remove();
		}
	});
	sceneSpheres = [];
	sceneCylinders = [];
	blurs = [];
}

/**
 * Get an interaction from the user to start the animation.
 * This is needed bacause some security policys like the AudioContext
 * requires an interaction before being able to play or get audio.
 */
document.querySelector("#interacter-accept").addEventListener("click", () => {
	document.querySelector("#interacter").style.display = "none";

	// p5js Web Audio policy inforing
	userStartAudio();

	data.initSensors();
	data.refresh();

	console.log("data:", data);

	populateAnimation();	
});

/**
 * Show entry info popup.
 */
document.querySelector("#info-btn").addEventListener("click", () => {
	document.querySelector("#interacter").style.display = "flex";
});

/**
 * Enable the user to reload the animation without reloading the
 * full website.
 */
document.querySelector("#reload-btn").addEventListener("click", () => {
	resetAnimationState();
	populateAnimation();
});

/**
 * Generate an array of colors based on a tile id
 *
 * @param {Number} steps - steps the gradient will have
 * @param {Number} tileId - id of a tile the user is located in 
 */
function gradientColorArrayGenerator(steps, tileId) {
	const AVAILABLE_COLORS = [
		color("#e5b750"),
		color("#d4632a"),
		color("#d76fc8"),
		color("#373bbe"),
		color("#5b2814"),
		color("#95bb5e"),
		color("#2d1c3f"),
	];
	let step = Math.floor(steps);

	let buildColors = [];
	for(let i = 0; i < steps; i++){
		let wrappedIndex = (tileId + i) % AVAILABLE_COLORS.length;
		buildColors.push(AVAILABLE_COLORS[wrappedIndex]);
	}

	return buildColors;
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

/**
 * Give the option to override the sound to interact better with it
 */
let overrideSound = false;
function touchMoved(){
	console.log("touch");
	overrideSound = true;
}
function touchEnded(){
	overrideSound = false;
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

	if(data && data.isInit){
		data.refresh();
	} 

	/** @type {Number} - Radius of animated object based on amount of objects in scene */
	let R_Object = objectScaling / sin(PI / sceneSpheres.length);

	if (data.sound >= 0.7 || overrideSound) {
		mode = "fast";
	} else {
		mode = "slow";
	}

	if (mode !== lastMode) {
		if (allowChange === false) {
			changeType = lastMode === "slow" ? "slow" : "fast";
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

			let translateZ = data.orientationX + data.orientationY;

			push();
			translate(x, y, translateZ);
			rotateZ(angleSphere);
			texture(obj);
			sphere(objectScaling, OBJECT_QUALITY, OBJECT_QUALITY);
			pop();
		});
	} else {
		sceneCylinders.forEach((obj, i) => {
			let angleCylinder = (TWO_PI * i) / (sceneCylinders.length * 2) + objectRotation;
			
			let translateX = data.orientationX / 8 * i;
			let translateZ = data.orientationY / 8 * i;

			push();
			translate(translateZ, translateX, i * -(cylinderRadius * 2));
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
