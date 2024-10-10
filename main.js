import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let radio = '/public/radio.glb';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 1000 );

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
const directionalLight = new THREE.DirectionalLight(0xfff5e1, 1, 200);
const pointLight = new THREE.PointLight(0xfff5e1, 2, 200);
    directionalLight.position.set(30, 25, -1).normalize(); 
    pointLight.position.set(50, 50, 50).normalize(); 
scene.add( directionalLight );
scene.add( ambientLight );
scene.add( pointLight );

const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const animations = {};

let mixer, model, audio_element;

let drag = false;
let dial = null;
let startingX, startingY, deltaX, deltaY;

const listener = new THREE.AudioListener();
camera.add( listener );
const audio = new THREE.PositionalAudio( listener );
    audio_element = document.createElement('audio');
    audio_element.crossOrigin = 'anonymous';
    audio_element.src = '/stream'; // vite.config.js
    audio_element.controls = true;

const audio_context = new (window.AudioContext || window.webkitAudioContext)();
//console.log(audio_context.state);

loader.load( radio, function ( gltf ) {
    console.log('GLB Loaded:', gltf);
	model = gltf.scene;

    //model.position.set(0,0,0);
    //model.scale.set(1,1,1);

    directionalLight.target = model;
	scene.add( model );

    loadAnimations(gltf);
    //console.log(animations);

    //window.addEventListener('click', onMouseClick, true);
    window.addEventListener('mousedown', onMouseDown, true);
    window.addEventListener('mousemove', onMouseMove, true);
    window.addEventListener('mouseup', onMouseUp, true);

    audio_element.addEventListener('play', () => {
        console.log('Audio is playing', audio_element.paused);
    });
    audio_element.addEventListener('pause', () => {
        console.log('Audio is paused', audio_element.paused);
    });
    audio_element.addEventListener('error', (e) => {
        console.error('Error playing audio:', e);
    });

    audio.setMediaElementSource(audio_element); 
    model.add( audio );

}, function (loading) {
    console.log((loading.loaded / loading.total * 100) + '% loaded');
  }, function ( error ) {
    console.error('Error loading GLB:', error);
	console.error( error );

} );

console.log('Scene children:', scene.children);

const renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 40, 9, 13 );
controls.update();

function animate() {
	requestAnimationFrame(animate);
     
    if (mixer) {
        mixer.update(0.1);
    }

	controls.update();
    //console.log('Camera Position: x =', camera.position.x, ', y =', camera.position.y, ', z =', camera.position.z);
	renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );

function loadAnimations(gltf) {
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
        animations[clip.name] = mixer.clipAction(clip);
    });
}

function onMouseDown (event) { 
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(model, true);
    console.log(intersects);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        console.log('Intersected object: ', intersectedObject.name);

       if (intersectedObject.name == 'Cylinder001_2') {
            dial = intersectedObject;
            const action = getAnimation(dial.name);

            if(action) {
                action.timeScale = 0.0008;
                action.reset().setLoop(THREE.LoopOnce).play();
                console.log('Turning on!', action);
                
                if(!audio_element.paused) {
                    audio_element.pause();
                } else if (audio_element.paused) {
                    audio_element.play();
                } 
            }
        } else if (intersectedObject.name == 'Cylinder001_1' || intersectedObject.name == 'Cylinder_2') {
            drag = true;
            dial = intersectedObject;
            controls.enabled = false;

            startingX = event.clientX;
            startingY = event.clientY;
        }
    } 
}

function onMouseMove (event) {
    if (drag && dial) {
        const action = getAnimation(dial.name);
        deltaX = event.clientX - startingX;
        deltaY = event.clientY - startingY;

        action.timeScale = deltaX * 0.0008;
        //console.log(deltaX * 0.0008);

        if(!action.isRunning()) {
            action.play();
            if(action._clip.name === 'Volume') {
                //if( (deltaX < 0 && audio_element.volume+deltaX >= 0) || (deltaX > 0 && audio_element.volume+deltaX <= 1) ) {
                //    audio_element.volume += deltaX*0.0008;
                    console.log(audio_element.volume);
                //}
            }
            startingX = event.clientX;
            startingY = event.clientY;
        }
    }
}

function onMouseUp (event) {
    if (drag && dial) {
        const action = getAnimation(dial.name);
        if (action) {
            action.stop();
        }
    }
    drag = false;
    dial = null;
    controls.enabled = true;
}

function getAnimation (name) {
    switch(name) {
        case 'Cylinder001_1':
            return animations['Volume'];
        case 'Cylinder_2':
            return animations['Tuning'];
        case 'Cylinder001_2':
            return animations['Power'];
    }
}

