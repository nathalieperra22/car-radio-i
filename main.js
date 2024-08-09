import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let radio = 'radio.glb';

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

loader.load( radio, function ( gltf ) {
    console.log('GLB Loaded:', gltf);
	model = gltf.scene;

    //model.position.set(0,0,0);
    //model.scale.set(1,1,1);

    directionalLight.target = model;
	scene.add( model );

    loadAnimations(gltf);
    //console.log(animations);

    window.addEventListener('click', onMouseClick, true);

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
        mixer.update(0.1); //adjust delta
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

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(model, true);
    console.log(intersects);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        console.log('Intersected object: ', intersectedObject.name);
       if (intersectedObject.name == 'Cylinder001_2') {
            const action = animations['Power'];

            const listener = new THREE.AudioListener();
            camera.add( listener );
            const audio = new THREE.PositionalAudio( listener );
            audio_element = document.createElement('audio');
            audio_element.crossOrigin = 'anonymous';
            audio_element.src = '/stream';
            audio_element.controls = true;

            audio.setMediaElementSource(audio_element); //html element
            audio_element.play();
            model.add( audio );

            
            if(action) {
                action.timeScale = 0.0008;
                action.reset().setLoop(THREE.LoopOnce).play();
                console.log('Cylinder found!', action);
            } else {
                console.error('Animation not found');
            }
        } else if (intersectedObject.name == 'Cylinder_2') {
            const action = animations['Tuning']; //toggle

            if(action) {
                action.timeScale = 0.0008;
                action.reset().setLoop(THREE.LoopOnce).play();
                console.log('Cylinder found!', action);
            } else {
                console.error('Animation not found');
            }
        }
    }
}

audio_element.addEventListener('play', () => {
    console.log('Audio is playing');
});

audio_element.addEventListener('error', (e) => {
    console.error('Error playing audio:', e);
});


