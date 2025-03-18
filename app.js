import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@latest/examples/jsm/loaders/GLTFLoader.js";

class App {
    constructor(){
        this._initialize();
    }

    _initialize() {
        this.pageState = "home";
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.loader = new THREE.TextureLoader();
        this.renderer.setSize(width,height);
        const container = document.getElementById("threejs-container");
        container.appendChild(this.renderer.domElement);
        
        const fov = 75;
        const aspect = width / height;
        const near = 0.1;
        const far = 1;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(0.25, 0.20, 0.20);
        
        this.scene = new THREE.Scene();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        const screenGeometry = new THREE.PlaneGeometry(0.6, 0.4);
        const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.screen = new THREE.Mesh(screenGeometry, screenMaterial);
        this.screen.position.set(0, 0, 0.51);

        
        const sunLight = new THREE.HemisphereLight(0xffffff, 0x444444);
        sunLight.position.set( 2, 0.5, 2);
        this.scene.add(sunLight);

        this.loader.load('./assets/white_room.jpeg', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping; // Ensures proper HDRI projection
            texture.colorSpace = THREE.SRGBColorSpace; // Keeps colors accurate

            this.scene.background = texture;  // Set background to the HDRI
            this.scene.environment = texture; 
        });

        window.addEventListener('resize', this._onWindowResize.bind(this));

        this._LoadModel();
        this._RAF();
        this._setupNavButtons();

        this.cameraModel;
    }

     
    _LoadModel() { 
        const loader = new GLTFLoader();
        loader.load('./assets/models/canon-camera.gltf', (gltf) => { 
            gltf.scene.traverse(c => {
                c.castShadow = false;
                c.receiveShadow = false;
            });
            gltf.scene.position.x = 0.13;
            this.cameraModel = gltf.scene;
            this.scene.add(gltf.scene);
        });
    }

    // Function to update the iframe's position based on the 3D object's screen location
    _updateIframePosition() {

        // const tempVector = new THREE.Vector3();
        // const iframe = document.getElementById("yt-iframe");

        // this.screen.getWorldPosition(tempVector);
        // // Project that 3D position into normalized device coordinates (NDC)
        // tempVector.project(this.camera);
        // // Convert NDC to 2D screen coordinates (in pixels)
        // const x = (tempVector.x * 0.5 + 0.5) * window.innerWidth;
        // const y = (-tempVector.y * 0.5 + 0.5) * window.innerHeight;
        // // Adjust the iframe's position so it's centered on that point
        // iframe.style.left = `${x - iframe.offsetWidth / 2}px`;
        // iframe.style.top = `${y - iframe.offsetHeight / 2}px`;
    }
    
     _onWindowResize(){
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    _RAF() {
        requestAnimationFrame((t) => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
            this._updateIframePosition();
            this._RAF();
        });
    }

    changePage(newPage) {
        if (!["home", "videos", "services"].includes(newPage)) return;

        this.pageState = newPage;
        this._updateSceneForPage();
    }

    _updateSceneForPage() {
        switch (this.pageState) {
            case "home":
                console.log("Switching to Home page");
                // this._animateHome();
                break;
            case "videos":
                console.log("Switching to Videos page");
                this._rotateToVideoPage();
                break;
            case "services":
                console.log("Switching to Services page");
                // this._animateServices();
                break;
        }
    }

    _rotateToVideoPage() {
        if (!this.cameraModel) return;
        console.log("Button clicked");

        gsap.to(this.cameraModel.position, {
            x: 0.1, // Move to X = 0
            y: 0.05, // Move up slightly
            z: 0, // Move backward
            duration: 1.5,
            ease: "power2.out"
        });
    
        gsap.to(this.cameraModel.rotation, {
            y: -2.5, // Rotate to face forward
            x: -0.1,
            duration: 1.5,
            ease: "power2.out"
        });
    }

    _setupNavButtons() {
        const buttons = document.querySelectorAll(".nav-btn");
        const states = ["home", "videos", "services"];

        for (let i=0; i < states.length ; i++){
            buttons[i].addEventListener('click', () => {
                this.changePage(states[i]);
            });
        }

    }
}

export default App;
