import jsQR from 'jsqr';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const video = document.getElementById('camera');
const canvas = document.getElementById('qrCanvas');
const context = canvas.getContext('2d');

// Start camera stream
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
        video.srcObject = stream;
        video.play();
        console.log('Camera stream started');
    })
    .catch((error) => {
        console.error('Error accessing the camera:', error);
        document.body.innerHTML += `<p>Error accessing the camera: ${error.message}</p>`;
    });

// Load 3D model when QR code is detected
function load3DModel() {
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load('model/model.gltf', gltf => {
        scene.add(gltf.scene);
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

// Detect QR code
function scanQRCode() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });

    if (code) {
        console.log('QR Code detected:', code.data);
        document.body.innerHTML += `<p>QR Code detected: ${code.data}</p>`; // Display QR code content        
        load3DModel();
    } else {
        requestAnimationFrame(scanQRCode);
    }
}

video.addEventListener('play', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    console.log('Video is playing');
    scanQRCode();
});
