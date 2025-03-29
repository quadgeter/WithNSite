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
        this.cssRenderer.domElement.style.left = "0";
        this.cssRenderer.domElement.style.pointerEvents = "none";
        this.cssRenderer.domElement.style.zIndex = "10";
        container.appendChild(this.cssRenderer.domElement);
        
        const fov = 75;
        const aspect = width / height;
        const near = 0.1;
        const far = 100;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(0.25, 0.15, 0.25);
        
        this.scene = new THREE.Scene();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;
        this.controls.enableZoom = true;
        
        const sunLight = new THREE.HemisphereLight(0xffffff, 0x444444);
        sunLight.position.set( 2, 0.5, 2);
        this.scene.add(sunLight);

        this.loader.load('./assets/white_room.jpeg', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping; // Ensures proper HDRI projection
            texture.colorSpace = THREE.SRGBColorSpace; // Keeps colors accurate

            this.scene.background = texture;  // Set background to the HDRI
            this.scene.environment = texture; 
        });

        this.states = ["home", "videos", "lookbook", "services", "book", "about"];

        window.addEventListener('resize', this._onWindowResize.bind(this));

        this.cameraModel;
        this.iFrameObject;
        this._LoadModel();
        this._setupNavButtons();
        this._loadPlaylistVideos("PLTo6svdhIL1cxS4ffGueFpVCF756ip-ab");
        this._RAF();
        
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
            this.cameraModel.scale.set(1.25, 1.4, 1.25);
            const axesHelper = new THREE.AxesHelper(0.5); // Adjust size as needed
            this.cameraModel.add(axesHelper);

            const screenMarker = new THREE.Object3D();
            screenMarker.name = "screenMarker";
            // Set this position to match the screen location on your camera model.
            // For example, if the screen is 0.2 units in front of the camera model’s origin:
            screenMarker.position.set(0.0135, 0.0625, -0.125);
            screenMarker.scale.set(0.000068, 0.000075, 0.00007);
            screenMarker.rotation.y = Math.PI; // Rotate to face the camera
            this.cameraModel.add(screenMarker);

            this.scene.add(this.cameraModel);
        });
    }

    _setupNavButtons() {
        const navButtons = document.querySelectorAll(".nav-btn");

        for (let i=0; i < this.states.length; i++){
            navButtons[i].addEventListener('click', () => {
                this.changePage(this.states[i]);
            });
        }

        const backBtn = document.querySelectorAll("#back-btn");
        backBtn.forEach(btn => {
            btn.addEventListener('click', () => {
                this.changePage("home");
            });
        });
    }

    async _loadPlaylistVideos(playlistId) {
        const API_KEY = '-';
        const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`);
        if (!res.ok) return console.error("Failed to load videos");
        const data = await res.json();
      
        const container = document.getElementById("playlist-container");
        container.innerHTML = `
        <div class="playlist-header">
            <h3 class="playlist-title">WithNSite</h3>
            <img src="./assets/youtubelogo.png" alt="youtube logo" class="playlist-logo">
        </div>`;

        const playlistInner = document.createElement("div");
        playlistInner.classList.add("playlist-inner");
      
        data.items.forEach(item => {
            const { title, thumbnails, channelTitle, publishedAt, resourceId } = item.snippet;
            const videoId = resourceId.videoId;
        
            const videoDiv = document.createElement("div");
            videoDiv.classList.add("playlist-item");
            videoDiv.innerHTML = `
            <img src="${thumbnails.medium.url}" alt="${title}" class="thumb" />
            <div class="meta">
                <h4 class="title">${title}</h4>
                <div class="small-text">
                    <p class="channel">${channelTitle}</p>
                    <p class="published">${timeSince(new Date(publishedAt))} ago</p>
                </div>
            </div>
            `;
        
            videoDiv.addEventListener("click", () => {
                this._changeIframeVideo(videoId); // define this to update the player
            });
            
            playlistInner.appendChild(videoDiv);
        });

        container.appendChild(playlistInner);

        function timeSince(date) {
            const seconds = Math.floor((new Date() - date) / 1000);
            const months = Math.floor(seconds / (30 * 24 * 3600));
            const days = Math.floor(seconds / (24 * 3600));
            if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
            if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
            return `${Math.floor(seconds / 3600)} hour${seconds > 3600 ? 's' : ''}`;
        }
    }
      

    // Function to update the add iframe and fix position based on Camera screen location

    _addIframeToCamera() {
        const wrapperDiv = document.createElement("div");
        wrapperDiv.style.width = "1200px";
        wrapperDiv.style.height = "800px";

        const iframe = document.createElement("iframe");
        iframe.style.width = "1200px";  // Adjust for screen size
        iframe.style.height = "800px";
        iframe.style.border = "none";
        iframe.style.borderRadius = "16px";
        iframe.src = "https://www.youtube.com/embed/2_n11Xfld4U"; // 
        iframe.style.pointerEvents = "auto";
        wrapperDiv.appendChild(iframe);


        const pos = new THREE.Vector3(5, -110, 180);
        pos.normalize(); // makes it a unit vector (same direction, length = 1)
        pos.multiplyScalar(10); 

        this.iFrameObject = new CSS3DObject(wrapperDiv);
        this.iFrameObject.scale.set(1, 1, 1); // Scale it down for proper fit
        this.cssRenderer.domElement.style.zIndex = "1000";
        this.controls.enabled = false;

        const marker = this.cameraModel.getObjectByName("screenMarker");
        if (marker) {
            // Attach the iframe as a child of the marker so it automatically inherits the marker’s position & rotation.
            marker.add(this.iFrameObject);
        } else {
            console.error("Screen marker not found on cameraModel!");
        }
        // this.cameraModel.add(this.iframeObject);
    }

    _removeIframeFromCamera() {
        const marker = this.cameraModel.getObjectByName("screenMarker");

        if (marker && this.cameraModel) {
            marker.remove(this.iFrameObject);
            this.iFrameObject = null;
        }
        // Reset pointer events to allow OrbitControls on home page
        this.cssRenderer.domElement.style.pointerEvents = "none";
    }

    _changeIframeVideo(videoId) {
        if (this.iFrameObject && this.iFrameObject.element) {
            const iframe = this.iFrameObject.element.querySelector("iframe");
            if (iframe) {
                iframe.src = "";
                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                console.log("Changed video to", `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&modestbranding=1&enablejsapi=1`);
            } else {
                console.warn("Iframe not found inside CSS3DObject.");
            }
        } else {
            console.warn("iframeObject is not set.");
        }
    }

    changePage(newPage) {
        if (!this.states.includes(newPage)) return;

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
                    case "lookbook":
                        this.controls.enabled = true;
                        this._removeLookbookPage();
                        this._lookbookToHome();
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
            case "lookbook":
                console.log(`Switching to Lookbook page ${current}`);
                this.controls.enabled = false;
                this._homeToLookbookPage();
                break;
            default:
                console.log("Page State not found");
        }
    }

    _hideMainNav() {
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
    }

    _showMainNav() {
        const playListContainer = document.getElementById("playlist-container");
        if (playListContainer) {
            playListContainer.classList.remove("shown");
            console.log("playlist hidden");
        }

        const backBtn = document.getElementById("back-btn");
        if (backBtn) {
            backBtn.classList.remove("shown");
            console.log("back button hidden");
        }

        const mainNav = document.getElementById("main-nav");
        if (mainNav) {
            mainNav.classList.remove("hidden");
            console.log("Main Nav shown");
        }
    }

    _homeToVideoPage() {
        if (!this.cameraModel) return;
    
        this._hideMainNav();

        const playListContainer = document.getElementById("playlist-container");
        if (playListContainer) {
            playListContainer.classList.add("shown");
            console.log("playlist shown");
        }

        gsap.to(this.cameraModel.position, {
            x: 0.015, // Move to X = 0
            y: 0.02, // Move up slightly
            z: 0.105, // Move backward
            duration: 0.5,
            ease: "power2.out"
        });
    
        gsap.to(this.cameraModel.rotation, {
            y: -1.8, // Rotate to face forward
            x: 0.135,
            z: 0.2,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                this._addIframeToCamera();
            }
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

    }

    _videoToHomePage() {
        if (!this.cameraModel) return;

        this._showMainNav();

        const backBtn = document.getElementById("back-btn");
        if (backBtn) {
            backBtn.classList.remove("shown");
            console.log("back button hidden");
        }
        
        gsap.to(this.cameraModel.position, {
            x: 0.10,
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
            y: 0.15,
            z: 0.25,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => {
                this.camera.lookAt(this.cameraModel);
            }
        });
    }

    _showLookbookBtns() {
        const lookbookContainer = document.querySelector(".lookbook-container");
        lookbookContainer.classList.add("shown");
        console.log("Lookbook buttons shown");
    }
    
    _hideLookbookBtns() {
        const lookbookContainer = document.querySelector(".lookbook-container");
        lookbookContainer.classList.remove("shown");
        console.log("Lookbook buttons hidden");
    }

    _addLookbookToCamera() {
        const wrapperDiv = document.createElement("div");
        wrapperDiv.style.width = "1200px";
        wrapperDiv.style.height = "800px";
        wrapperDiv.style.overflow = "hidden";
        wrapperDiv.style.position = "relative";

        const images = [
            "./assets/lookbook/jordan_ferrari.jpeg",
            "./assets/lookbook/kobe_icebucket.jpeg",
            "./assets/lookbook/malcomx.jpeg",
            "assets/lookbook/martinluther.jpeg"
        ];

        let currentIndex = 0;

        const img = document.createElement("img");
        img.src = images[currentIndex];
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.borderRadius = "24px";
        wrapperDiv.appendChild(img);

        const left = document.createElement("button");
        const leftButtonImg = document.createElement("img");
        leftButtonImg.src = "./assets/left-chevron.png";
        left.appendChild(leftButtonImg);
        left.style.position = "absolute";
        left.style.left = "20px";
        left.style.top = "50%";
        left.style.transform = "translateY(-50%)";
        left.style.fontSize = "2rem";
        left.style.background = "transparent";
        left.style.color = "white";
        left.style.border = "none";
        left.style.cursor = "pointer";

        const right = document.createElement("button");
        const rightButtonImg = document.createElement("img");
        rightButtonImg.src = "./assets/chevron.png";
        right.appendChild(rightButtonImg);
        right.style.position = "absolute";
        right.style.right = "20px";
        right.style.top = "50%";
        right.style.transform = "translateY(-50%)";
        right.style.fontSize = "2rem";
        right.style.background = "transparent";
        right.style.color = "white";
        right.style.border = "none";
        right.style.cursor = "pointer";

        left.onclick = () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            img.src = images[currentIndex];
        };
        right.onclick = () => {
            currentIndex = (currentIndex + 1) % images.length;
            img.src = images[currentIndex];
        };

        wrapperDiv.appendChild(left);
        wrapperDiv.appendChild(right);
        
        const lookBookObject = new CSS3DObject(wrapperDiv);
        lookBookObject.scale.set(1,1,1);

        const marker = this.cameraModel.getObjectByName("screenMarker");
        if (marker) {
            marker.add(lookBookObject);
        } else {
            console.log("ERROR, marker not found");
        }
        this.lookBookObject = lookBookObject;
    }

    _removeLookbookPage() {
        const marker = this.cameraModel.getObjectByName("screenMarker");

        if (marker && this.cameraModel) {
            marker.remove(this.lookBookObject);
            this.lookBookObject = null;
        }
    }

    _homeToLookbookPage() {
        if (!this.cameraModel) return;

        this._hideMainNav();
        this._showLookbookBtns();
    
        gsap.to(this.cameraModel.position, {
            x: 0.01,
            z: -0.15,
            y: -0.125,
            duration: 0.5,
            ease: "power2.out"
        });

        gsap.to(this.cameraModel.scale, {
            x: 2.5,
            y: 2.5,
            z: 2.5,
            duration: 0.5,
            ease: "power2.out" 
        });

        gsap.to(this.cameraModel.rotation, {
            x: -0.02,
            y: -2.225,
            z: -0.025,
            duration: 0.5,
            ease: "power2.out",
        });
    
        gsap.to(this.camera.position, {
            x: 0.35,
            y: 0.15,
            z: 0.25,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => {
                this.camera.lookAt(this.cameraModel.position);
            },
            onComplete: () => {
                this._addLookbookToCamera();
            }
        });
    }

    _lookbookToHome(){
        if (!this.cameraModel) return;

        this._showMainNav();
        this._hideLookbookBtns();

        gsap.to(this.cameraModel.position, {
            x: 0.10,
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

        gsap.to(this.cameraModel.scale, {
            x: 1.25,
            y: 1.25,
            z: 1.25,
            duration: 0.5,
            ease: "power2.out",
        });

        gsap.to(this.camera.position, {
            x: 0.25,
            y: 0.15,
            z: 0.25,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => {
                this.camera.lookAt(this.cameraModel.position);
            }
        });
    }
    

    _RAF() {
        requestAnimationFrame(() => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
            this.cssRenderer.render(this.scene, this.camera);
            // if (this.cameraModel) console.log("Camera pos:", this.cameraModel.position)
            // if (this.iframeObject) console.log("iFrame pos:", this.iframeObject.position)
            this._RAF();
        });
    }

    _onWindowResize(){
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.cssRenderer.setSize(width, height);

    }
}

export default App;
