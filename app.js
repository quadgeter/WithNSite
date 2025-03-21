import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@latest/examples/jsm/loaders/GLTFLoader.js";
import { CSS3DRenderer, CSS3DObject } from "https://unpkg.com/three/examples/jsm/renderers/CSS3DRenderer.js";

class App {
    constructor(){
        this._initialize();
    }

    _initialize() {
        this.pageState = "home";
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.loader = new THREE.TextureLoader();

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width,height);
        const container = document.getElementById("threejs-container");
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.zIndex = "1"; 
        container.appendChild(this.renderer.domElement);

        this.cssRenderer = new CSS3DRenderer();
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.domElement.style.position = "absolute";
        this.cssRenderer.domElement.style.top = "0";
        this.cssRenderer.domElement.style.pointerEvents = "none";
        container.appendChild(this.cssRenderer.domElement);
        
        const fov = 75;
        const aspect = width / height;
        const near = 0.1;
        const far = 100;
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
            this.cameraModel.scale.set(1.20, 1.20, 1.20);
            this.scene.add(gltf.scene);
        });
    }

    // Function to update the iframe's position based on the 3D object's screen location
    // FIXME - Youtube video is not clickable/playable
    _addIframeToCamera() {
        const iframe = document.createElement("iframe");
        iframe.style.width = "600px";  // Adjust for screen size
        iframe.style.height = "400px";
        iframe.style.border = "none";
        iframe.style.borderRadius = "16px";
        iframe.src = "https://www.youtube.com/embed/2_n11Xfld4U";
        iframe.style.zIndex = "1000";
        iframe.style.pointerEvents = "auto";

        const iFrameObject = new CSS3DObject(iframe);
        iFrameObject.position.set(0.05, -0.3, 0.52); // Adjust based on camera screen position
        iFrameObject.scale.set(0.001, 0.00105, 0.001); // Scale it down for proper fit
        iFrameObject.rotation.set(0, 3.15, 0); // Adjust based on camera screen rotation;
        iFrameObject.element.style.pointerEvents = "none";
        this.cssRenderer.domElement.style.pointerEvents = "none";
        this.cssRenderer.domElement.style.zIndex = "1000";
        this.cssRenderer.domElement.style.cursor = "pointer";
        this.controls.enabled = true;

        this.iframeObject = iFrameObject;
        this.cameraModel.add(iFrameObject);
    }

    _removeIframeFromCamera() {
        if (this.iframeObject && this.cameraModel) {
            this.cameraModel.remove(this.iframeObject);
            this.iframeObject = null;
        }
        // Reset pointer events to allow OrbitControls on home page
        this.cssRenderer.domElement.style.pointerEvents = "none";
    }
    
     _onWindowResize(){
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.cssRenderer.setSize(width, height);

    }

    _setupNavButtons() {
        const navButtons = document.querySelectorAll(".nav-btn");
        const states = ["home", "videos", "services"];

        for (let i=0; i < states.length; i++){
            navButtons[i].addEventListener('click', () => {
                this.changePage(states[i]);
            });
        }

        const backBtn = document.getElementById("back-btn");
        backBtn.addEventListener('click', () => {
            this.changePage("home");
        });


    }

    changePage(newPage) {
        if (!["home", "videos", "services"].includes(newPage)) return;

        const currentPage = this.pageState;
        this.pageState = newPage;
        this._updateScene(currentPage);
    }

    _updateScene(current) {
        switch (this.pageState) {
            case "home":
                switch (current) {
                    case "videos":
                        this.controls.enabled = true;
                        this._removeIframeFromCamera();
                        this._videoToHomePage();
                        break;
                    case "services":
                        // services to home
                        break;
                    default:
                        console.log("Current Page State not found");
                }
                console.log(`Switching to Home page from ${current}`);
                // this._animateHome();
                break;
            case "videos":
                console.log(`Switching to Videos page ${current}`);
                this.controls.enabled = false;
                this._homeToVideoPage();
                break;
            case "services":
                console.log(`Switching to Services page ${current}`);
                // this._animateServices();
                break;
        }
    }

    _homeToVideoPage() {
        if (!this.cameraModel) return;

        const mainNav = document.getElementById("main-nav");
        if (mainNav) {
            mainNav.classList.add("hidden");
            console.log("Main Nav hidden");
        }

        const backBtn = document.getElementById("back-btn");
        if (backBtn) {
            backBtn.classList.add("shown");
            console.log("back button shown");
        }

        gsap.to(this.cameraModel.position, {
            x: 0.025, // Move to X = 0
            y: 0.02, // Move up slightly
            z: 0.115, // Move backward
            duration: 0.5,
            ease: "power2.out"
        });
    
        gsap.to(this.cameraModel.rotation, {
            y: -1.8, // Rotate to face forward
            x: 0.135,
            z: 0.2,
            duration: 0.5,
            ease: "power2.out"
        });

        gsap.to(this.camera.position, {
            x: 0.3,  // Adjust based on your scene
            y: 0.16, // Raise the camera slightly
            z: 0.175,  // Move closer or further
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => {
                this.camera.lookAt(this.cameraModel.position); // Keep looking at the model
            }
        });

        this._addIframeToCamera();
    }

    _videoToHomePage() {
        if (!this.cameraModel) return;

        const mainNav = document.getElementById("main-nav");
        if (mainNav) {
            mainNav.classList.remove("hidden");
            console.log("Main Nav shown");
        }

        const backBtn = document.getElementById("back-btn");
        if (backBtn) {
            backBtn.classList.remove("shown");
            console.log("back button hidden");
        }
        
        gsap.to(this.cameraModel.position, {
            x: 0.13,
            y: 0,
            z: 0,
            duration: 0.5,
            ease: "power2.out"
        });

        gsap.to(this.cameraModel.rotation, {
            y: 0,
            x: 0,
            z: 0,
            duration: 0.5,
            ease: "power2.out"
        });
        
        gsap.to(this.camera.position, {
            x: 0.25,
            y: 0.2,
            z: 0.2,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => {
                this.camera.lookAt(this.cameraModel);
            }
        });
    }

    _RAF() {
        requestAnimationFrame(() => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
            this.cssRenderer.render(this.scene, this.camera);
            this._RAF();
        });
    }
}

export default App;
