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

    const loader = new THREE.GLTFLoader();
    loader.load('model/model.gltf', (gltf) => {
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
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        // Wait until the video has proper dimensions
        requestAnimationFrame(scanQRCode);
        return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
        // Try to get the image data from the canvas
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Assuming jsQR is available and works
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
            console.log('QR Code detected:', code.data);
            load3DModel();
        } else {
            requestAnimationFrame(scanQRCode);
        }
    } catch (e) {
        console.error('Error in getImageData:', e);
        requestAnimationFrame(scanQRCode);
    }
}
video.addEventListener('loadedmetadata', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Now start scanning for QR codes after the video has proper dimensions
    load3DModel();
    //scanQRCode();
});

video.addEventListener('play', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    load3DModel();
    //scanQRCode();
});
