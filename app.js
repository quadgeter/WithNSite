import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@latest/examples/jsm/loaders/GLTFLoader.js";
import { CSS3DRenderer, CSS3DObject } from "https://unpkg.com/three/examples/jsm/renderers/CSS3DRenderer.js";
import { RGBELoader } from './node_modules/three/examples/jsm/loaders/RGBELoader.js';


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
        
        const fov = 85;
        const aspect = width / height;
        const near = 0.1;
        const far = 1000;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(1.25, 0, 1);
        
        this.scene = new THREE.Scene();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;
        this.controls.enableZoom = false;

        
        this.sunLight = new THREE.HemisphereLight(0xffffff, 0x444444);
        this.sunLight.position.set( 2, 0.5, 2);
        this.scene.add(this.sunLight);

        this.loader.load('./assets/whitestudio.jpeg', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping; // Ensures proper HDRI projection
            texture.colorSpace = THREE.SRGBColorSpace; // Keeps colors accurate
            this.scene.background = texture;
            this.scene.environment = texture;
        });


        // const rgbeLoader = new RGBELoader();
        //     rgbeLoader.load('./assets/studio_small_08_4k.hdr', (texture) => {
        //     texture.mapping = THREE.EquirectangularReflectionMapping;

        //     this.scene.environment = texture;

        //     // ✅ For visible background you can rotate
        //     const geometry = new THREE.SphereGeometry(20, 60, 40); // Large enough to enclose the scene
        //     geometry.scale(-1, 1, 1); // Invert the sphere to view from inside

        //     const material = new THREE.MeshBasicMaterial({ map: texture });
        //     const backgroundSphere = new THREE.Mesh(geometry, material);

        //     backgroundSphere.rotation.y = Math.PI + 0.75; // Rotate it if needed
        //     this.scene.add(backgroundSphere);
        // });


        this.states = ["home", "videos", "lookbook", "services", "book", "about"];

        window.addEventListener('resize', this._onWindowResize.bind(this));

        this.cameraModel;
        this.iFrameObject;
        this._LoadModel();
        this._setupNavButtons();
        this._loadPlaylistVideos("PLTo6svdhIL1cxS4ffGueFpVCF756ip-ab");
        this._RAF();

        this.controls.target.set(100,-10,0); // or wherever you want it to look
        this.controls.update();

        gsap.registerPlugin(CustomEase) 
        
    }

     
    _LoadModel() { 
        const loader = new GLTFLoader();
        loader.load('./assets/models/unbranded_camera.gltf', (gltf) => { 
            gltf.scene.traverse(c => {
                c.castShadow = false;
                c.receiveShadow = false;
            });
            gltf.scene.position.set(75 , -30, 30);
            gltf.scene.rotation.y = -Math.PI + 0.75;
            this.cameraModel = gltf.scene;
            this.cameraModel.scale.set(320, 350, 320);
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

        // setup states videos to about, skip home
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
        const API_KEY = 'AIzaSyCXrPjz9wCr2upv1iXAYwE5AbHP9wirWAo';
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
                this._showFooter();
                switch (current) {
                    case "videos":
                        this.controls.enabled = true;
                        this._removeIframeFromCamera();
                        this._videoToHomePage();
                        break;
                    case "services":
                        this.controls.enabled = true;
                        this._servicesToHome();
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
                this._hideFooter();
                this._homeToVideoPage();
                break;
            case "services":
                console.log(`Switching to Services page ${current}`);
                this.controls.enabled = false;
                this._hideFooter();
                this._homeToServicesPage();
                break;
            case "lookbook":
                console.log(`Switching to Lookbook page ${current}`);
                this.controls.enabled = false;
                this._hideFooter();
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
    }

    _showMainNav() {
        const mainNav = document.getElementById("main-nav");
        if (mainNav) {
            mainNav.classList.remove("hidden");
            console.log("Main Nav shown");
        }
    }

    _hideBackBtn() {
        const backBtn = document.getElementById("back-btn");
        if (backBtn) {
            backBtn.classList.remove("shown");
            console.log("back button hidden");
        }
    }

    _showBackBtn() {
        const backBtn = document.getElementById("back-btn");
        if (backBtn) {
            backBtn.classList.add("shown");
            console.log("back button shown");
        }
    }

    _hideFooter() {
        const footer = document.querySelector(".footer");
        if (footer) {
            footer.classList.add("hidden");
            console.log("footer hidden");
        }
    }

    _showFooter() {
        const footer = document.querySelector(".footer");
        if (footer) {
            footer.classList.remove("hidden");
            console.log("footer hidden");
        }
    }

    _showPlaylist(){
        const playListContainer = document.getElementById("playlist-container");
        if (playListContainer) {
            playListContainer.classList.add("shown");
            console.log("playlist shown");
        }
    }

    _hidePlaylist(){
        const playListContainer = document.getElementById("playlist-container");
        if (playListContainer) {
            playListContainer.classList.remove("shown");
            console.log("playlist hidden");
        }
    }

    // General-purpose FOV animation
    _animateFOV(targetFOV, duration = 0.5) {
        const cam = this.camera;
        gsap.to({ fov: cam.fov }, {
            fov: targetFOV,
            duration,
            ease: "power2.out",
            onUpdate: function () {
                cam.fov = this.targets()[0].fov;
                cam.updateProjectionMatrix();
            }
        });
    }
  

    _homeToVideoPage() {
        if (!this.cameraModel) return;
    
        this._hideMainNav();
        this._showBackBtn();
        this._showPlaylist();

        gsap.to(this.cameraModel.position, {
            x: 75,
            z: -20, 
            duration: 0.5,
            ease: "power2.out"
        });

        gsap.to(this.cameraModel.rotation, {
            y: -Math.PI * 1.4, // Rotate to face forward
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                this._addIframeToCamera();
            }
        });

        gsap.to(this.camera.position, {
            x: 0.3,  // Adjust based on your scene
            y: 0.155, // Raise the camera slightly
            z: 0.175,  // Move closer or further
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => {
                this.camera.lookAt(this.cameraModel.position); // Keep looking at the model
            }
        });

        this._animateFOV(65);
    }

    _resetScene(){
        gsap.to(this.cameraModel.position, {
            x: 75,
            y: -30,
            z: 30,
            duration: 0.75,
            ease: "power2.out"
        });

        gsap.to(this.cameraModel.rotation, {
            x: 0,
            y: -Math.PI + 0.75,
            z: 0,
            duration: 0.75,
            ease: "power2.out"
        });

        gsap.to(this.cameraModel.scale, {
            x: 320,
            y: 350,
            z: 320,
            duration: 0.75,
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

    _videoToHomePage() {
        if (!this.cameraModel) return;

        this._showMainNav();
        this._hideBackBtn();
        this._hidePlaylist();
        this._animateFOV(75);
        this._resetScene();
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

    _createLookBook() {
        const container = document.querySelector(".lookbook-container");

        const images = [
            "./assets/lookbook/jordan_ferrari.jpeg",
            "./assets/lookbook/kobe_icebucket.jpeg",
            "./assets/lookbook/malcomx.jpeg",
            "./assets/lookbook/martinluther.jpeg",
            "./assets/lookbook/jordan_ferrari.jpeg",
            "./assets/lookbook/kobe_icebucket.jpeg",
            "./assets/lookbook/malcomx.jpeg",
            "./assets/lookbook/martinluther.jpeg",
            "./assets/lookbook/jordan_ferrari.jpeg",
            "./assets/lookbook/kobe_icebucket.jpeg",
            "./assets/lookbook/malcomx.jpeg",
            "./assets/lookbook/martinluther.jpeg",
        ];
    
        // Outer lens view (like camera viewfinder)
        const outer = document.createElement("div");
        outer.style.width = "fit-content";
        outer.style.height = "100%";
        outer.style.position = "absolute";
        outer.style.top = "-1%";
        outer.style.left = "0";
        outer.style.transform = "translate(-50%, -50%)";
        outer.style.overflow = "hidden";
        outer.style.borderRadius = "0"; // Circular lens view
        outer.style.boxShadow = "inset 0 0 200px rgba(0, 0, 0, 0.85)";
        outer.style.backgroundColor = "#000";
        outer.style.zIndex = "10000";
        outer.style.cursor = "pointer";
    
        // Scrollable inner container with grid
        const scrollContainer = document.createElement("div");
        scrollContainer.style.height = "100%";
        scrollContainer.style.overflowY = "scroll";
        scrollContainer.style.padding = "20px";
        scrollContainer.style.zIndex = "9999";
    
        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(2, 1fr)";
        grid.style.gap = "20px";
        grid.style.width = "fit-content";
        grid.style.boxSizing = "border-box";
        grid.style.zIndex = "9998";
        grid.style.margin = "0 auto";
    
        images.forEach(src => {
            const frame = document.createElement("div");
            frame.style.width = "100%";
            frame.style.aspectRatio = "3/4";
            frame.style.border = "4px solid #fff";
            frame.style.background = "#111";
            frame.style.borderRadius = "10px";
            frame.style.boxShadow = "0 8px 20px rgba(255,255,255,0.5)";
            frame.style.overflow = "hidden";
            frame.style.cursor = "pointer";
            frame.style.transition = "transform 0.3s ease";
            frame.style.zIndex = "10000";
            frame.style.maxWidth = "300px";
            frame.style.margin = "0 auto";
            frame.style.zIndex = "9999";
    
            const img = document.createElement("img");
            img.src = src;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";
    
            frame.appendChild(img);
            grid.appendChild(frame);
    
            // Click to enlarge
            frame.onclick = () => {
                const overlay = document.createElement("div");
                overlay.style.position = "fixed";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.width = "100vw";
                overlay.style.height = "100vh";
                overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                overlay.style.display = "flex";
                overlay.style.alignItems = "center";
                overlay.style.justifyContent = "center";
                overlay.style.zIndex = "9999";
    
                const enlarged = document.createElement("img");
                enlarged.src = src;
                enlarged.style.maxWidth = "90vw";
                enlarged.style.maxHeight = "90vh";
                enlarged.style.borderRadius = "16px";
                enlarged.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.5)";
                enlarged.style.objectFit = "contain";
    
                const close = document.createElement("button");
                close.innerText = "×";
                close.style.position = "absolute";
                close.style.top = "20px";
                close.style.right = "30px";
                close.style.fontSize = "3rem";
                close.style.color = "#fff";
                close.style.background = "transparent";
                close.style.border = "none";
                close.style.cursor = "pointer";
                close.onclick = () => document.body.removeChild(overlay);
    
                overlay.appendChild(enlarged);
                overlay.appendChild(close);
                document.body.appendChild(overlay);
            };
        });
    
        scrollContainer.appendChild(grid);
        outer.appendChild(scrollContainer);
        // container.appendChild(outer);
    
        // Create and add CSS3DObject
        this.lookBookObject = new CSS3DObject(outer);
        this.lookBookObject.scale.set(0.1, 0.1, 0.1); // tweak for your scene
        this.lookBookObject.rotation.y = -Math.PI / 2;
        this.lookBookObject.position.set(60,-3,2.5)
        this.lookBookObject.rotation.x = 0.001;
        this.scene.add(this.lookBookObject);
    }
    

    _removeLookbookPage() {
        if (this.lookBookObject ) {
            this.scene.remove(this.lookBookObject);
            this.lookBookObject = null;
        }
    }

    _homeToLookbookPage() {
        if (!this.cameraModel) return;

        this._hideMainNav();

        const tl = gsap.timeline({
            ease: "power2.in"
        });

        tl.to(this.camera.position, {
            x: 0.25,
            y: 0.15,
            z: 0.25,
            duration: 0.5,
            onUpdate: () => {
                this.camera.lookAt(this.cameraModel);
            }
        }, 0);
        
        // First movement: rotation
        tl.to(this.cameraModel.rotation, {
            y: -4.75,
            z: -0.025,
            duration: 0.25,
        }, "-=0.2"); // start at time 0
        
        // Second movement: position (starts slightly before rotation ends)
        tl.to(this.cameraModel.position, {
            x: 90,
            y: -40,
            z: 0,
            duration: 0.3,
        }, "-=0.3"); // starts 0.3s *before* previous ends

        tl.to(this.cameraModel.position, {
            x: -50,
            y: -50,
            z: 0.8,
            duration: 1.5,
            ease: "slow(0.7, 0.7, false)",
        }, "-=0.125");

        
        // Final step: show lookbook
        tl.call(() => {
            this._showLookbookBtns();
            this._createLookBook();
        }, null, "-=1.11");
        
        tl.call(() => {
            this._showBackBtn();
        }, null, "<");

    }

    _lookbookToHome(){
        if (!this.cameraModel) return;

        this._showMainNav();
        this._hideLookbookBtns();
        this._hideBackBtn();
        console.log("Inside _lookbookToHome");

        this._resetScene();
    }

    _showServicesSection() {
        const servicesContainer = document.querySelector("#services-panel");
        servicesContainer.classList.add("shown");
    }

    _hideServicesSection() {
        const servicesContainer = document.querySelector("#services-panel");
        servicesContainer.classList.remove("shown");
    }

    _homeToServicesPage() {
        if (!this.cameraModel) return;

        this._showServicesSection();
        this._showBackBtn();
        this._hideMainNav();

    }

    _servicesToHome() {
        if (!this.cameraModel) return;

        this._hideServicesSection();
        this._showMainNav();
        this._hideBackBtn();

        gsap.to(this.sunLight, { intensity: 0.2, duration: 0.5 });
    }
    

    _RAF() {
        requestAnimationFrame(() => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
            this.cssRenderer.render(this.scene, this.camera);
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
