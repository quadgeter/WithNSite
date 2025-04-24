import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@latest/examples/jsm/loaders/GLTFLoader.js";
import { CSS3DRenderer, CSS3DObject } from "https://unpkg.com/three/examples/jsm/renderers/CSS3DRenderer.js";
import { getScenePreset } from "./getScenePreset.js";

function isMobileViewport() {
    return window.innerWidth <= 768; // or 767, depending on your mobile breakpoint
}
  


class App {
    constructor(){
        this._initialize();
    }

    _initialize() {
        this.isMobile = isMobileViewport();
        this.pageState = "home";
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.loader = new THREE.TextureLoader();

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: false,
            // alpha: true,
            preserveDrawingBuffer: !this.isMobile 
        });

        this.renderer.setSize(width,height);
        const container = document.getElementById("threejs-container");
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.zIndex = "1";
        // this.renderer.shadowMap.enabled = !this.isMobile; 
        // container.appendChild(this.renderer.domElement);
        container.appendChild(this.renderer.domElement);

        this.cssRenderer = new CSS3DRenderer();
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.domElement.style.position = "absolute";
        this.cssRenderer.domElement.style.top = "0";
        this.cssRenderer.domElement.style.left = "0";
        this.cssRenderer.domElement.style.pointerEvents = "none";
        this.cssRenderer.domElement.style.zIndex = "100";
        // container.appendChild(this.cssRenderer.domElement);
        container.appendChild(this.cssRenderer.domElement);

        
        const fov = 75;
        const aspect = width / height;
        const near = 0.1;
        const far = 1000;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

        this.camera.position.set(0.25, 0.15, 0.25);
        
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
    }

     
    _LoadModel() { 
        const loader = new GLTFLoader();
        loader.load('./assets/models/unbranded_camera.gltf', (gltf) => { 
            gltf.scene.traverse(c => {
                c.castShadow = false;
                c.receiveShadow = false;
            });

            this.cameraModel = gltf.scene;

            this.cameraModel.position.set(75 , -30, 30);
            this.cameraModel.rotation.y = -Math.PI + 0.75;
            
            this.cameraModel.scale.set(320, 350, 320);

            if (isMobileViewport()) {
                // this.camera.far = 100;
                this.cameraModel.scale.set(20,20,15);
                this.cameraModel.rotation.y = -2.35;
                this.cameraModel.position.set(7.5,-3.5,3 );
                // this.camera.position.y -= 15;
                // this._animateFOV(75);
                this.controls.target.set(7.5,0,3);
                // this.camera.position.y = -8;
                this.controls.update();
            }

            const screenMarker = new THREE.Object3D();

            screenMarker.name = "screenMarker";
            if (this.isMobile) {
                screenMarker.position.set(0.0125, 0.0675, -0.125);
            } else {
                screenMarker.position.set(0.0125, 0.0625, -0.125);
            }
            screenMarker.scale.set(0.000068, 0.000075, 0.00007);
            screenMarker.rotation.y = Math.PI;

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

        const consultBtn = document.querySelectorAll(".consult-btn");

        consultBtn.forEach(btn => {
            btn.addEventListener("click", () => {
                this.changePage("book");
            });
        });
    }

    // FUTURE: for moving to youtube

    // async _loadPlaylistVideos(playlistId) {
    //     const API_KEY = 'AIzaSyCXrPjz9wCr2upv1iXAYwE5AbHP9wirWAo';
    //     const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`);
    //     if (!res.ok) return console.error("Failed to load videos");
    //     const data = await res.json();
      
    //     const container = document.getElementById("playlist-container");
    //     container.innerHTML = `
    //     <div class="playlist-header">
    //         <h3 class="playlist-title">WithNSite</h3>
    //         <img src="./assets/youtubelogo.png" alt="youtube logo" class="playlist-logo">
    //     </div>`;

    //     const playlistInner = document.createElement("div");
    //     playlistInner.classList.add("playlist-inner");
      
    //     data.items.forEach(item => {
    //         const { title, thumbnails, channelTitle, publishedAt, resourceId } = item.snippet;
    //         const videoId = resourceId.videoId;
        
    //         const videoDiv = document.createElement("div");
    //         videoDiv.classList.add("playlist-item");
    //         videoDiv.innerHTML = `
    //         <img src="${thumbnails.medium.url}" alt="${title}" class="thumb" />
    //         <div class="meta">
    //             <h4 class="title">${title}</h4>
    //             <div class="small-text">
    //                 <p class="channel">${channelTitle}</p>
    //                 <p class="published">${timeSince(new Date(publishedAt))} ago</p>
    //             </div>
    //         </div>
    //         `;
        
    //         videoDiv.addEventListener("click", () => {
    //             this._changeIframeVideo(videoId); // define this to update the player
    //         });
            
    //         playlistInner.appendChild(videoDiv);
    //     });

    //     container.appendChild(playlistInner);

    //     function timeSince(date) {
    //         const seconds = Math.floor((new Date() - date) / 1000);
    //         const months = Math.floor(seconds / (30 * 24 * 3600));
    //         const days = Math.floor(seconds / (24 * 3600));
    //         if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
    //         if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    //         return `${Math.floor(seconds / 3600)} hour${seconds > 3600 ? 's' : ''}`;
    //     }
    // }

    // populate playlist container
    _loadPlaylistVideos(){
        const data = {
            'ase4_sfull.mp4': {
                title: "Hype Clinic Commericial"
            },
            'community prayer story.mp4': {
                title: "CGC News Production"
            }, 
            'foodtruck promo.mp4': {
                title: "Food Truck Commercial Production"
            }, 
            'Ligiee concert promo vid.mp4': {
                title: "Local Artist Concert Promotion"
            },
            "kotadoc1.mp4": {
                title: "Track & Field Mix Part 1"
            } ,
            "kotadoc2.mp4": {
                title: "Track & Field Mix Part 2"
            },
            'Fashion show promo.mp4': {
                title: "2023 Fashion Show"
            }, 
            'F da Persona - Preme Hardy.mp4': {
                title: "F da Persona - Preme Hardy Music Video"
            }, 
            'ART BANDO PROMO.mp4': {
                title: "Mutlimedia Mix"
            }, 
            'Hardy In Da Paint - Preme Hardy.mp4': {
                title: "Hardy In Da Paint - Preme Hardy Music Video"
            }
        };

        const container = document.getElementById("playlist-container");
        container.innerHTML = `
        <div class="playlist-header">
            <h3 class="playlist-title">Check Out Some of Our Work</h3>
        </div>`;

        const playlistInner = document.createElement("div");
        playlistInner.classList.add("playlist-inner");
      
        Object.entries(data).forEach(([fileName, info]) => {
            const videoDiv = document.createElement("div");
            videoDiv.classList.add("playlist-item");
            videoDiv.innerHTML = `
            
            <div class="meta">
                <h4 class="title">${info.title}</h4>
            </div>
            `;
        
            videoDiv.addEventListener("click", () => {
                this._changeVideo(fileName, info); // define this to update the player
            });
            
            playlistInner.appendChild(videoDiv);
        });

        container.appendChild(playlistInner);
    }
      

    // Function to update the add iframe and fix position based on Camera screen location

    _addIframeToCamera() {
        const wrapperDiv = document.createElement("div");
        if (this.isMobile) {
            wrapperDiv.style.width = "1200px";
            wrapperDiv.style.height = "800px";
        } else {
            // wrapperDiv.style.width = "100%";
            // wrapperDiv.style.height = "100%";
        }
        
        const videoElement = document.createElement("video");
        videoElement.style.width = "1200px";
        videoElement.style.height = "800px";
        videoElement.style.border = "none";
        videoElement.style.borderRadius = "16px";
        videoElement.style.pointerEvents = "auto";
        videoElement.style.backgroundColor = "#000"
        videoElement.setAttribute("autoplay", true);
        videoElement.setAttribute("muted", true); // Required for autoplay to work without user interaction
        videoElement.removeAttribute("controls");
        videoElement.setAttribute("playsinline", true);
        videoElement.setAttribute("webkit-playsinline", true);

        const source = document.createElement("source");
        source.src = "./assets/vids/ase4_sfull.mp4";
        source.type = "video/mp4"; // Or use video/mp4 if you convert to .mp4

        videoElement.appendChild(source);
        wrapperDiv.appendChild(videoElement);

        const playBtn = document.createElement("button");
        playBtn.innerHTML = "<i class='fa-solid fa-play'></i>";
        playBtn.style.position = "absolute";
        playBtn.style.top = "50%";
        playBtn.style.left = "50%";
        playBtn.style.transform = "translate(-50%, -50%)";
        playBtn.style.fontSize = "6rem";
        playBtn.style.padding = "0.75rem 1rem";
        playBtn.style.border = "none";
        playBtn.style.borderRadius = "10px";
        playBtn.style.cursor = "pointer";
        playBtn.style.background = "transparent";
        playBtn.style.color = "white";
        playBtn.style.zIndex = "3000";

        // Play logic
        playBtn.onclick = () => {
            if (videoElement.paused) {
                videoElement.play();
                playBtn.style.display = "none";
                pauseBtn.style.display = "block";
            }
        };

        videoElement.onplay = () => playBtn.style.display = "none";
        videoElement.onpause = () => playBtn.style.display = "block";

        wrapperDiv.appendChild(playBtn);

        const pauseBtn = document.createElement("button");
        pauseBtn.innerHTML = "<i class='fa-solid fa-pause'></i>";
        pauseBtn.style.position = "absolute";
        pauseBtn.style.bottom = "0";
        pauseBtn.style.left = "0";
        pauseBtn.style.transform = "translate(50%)";
        pauseBtn.style.zIndex = "3000";
        pauseBtn.style.padding = "0.5rem 1rem";
        pauseBtn.style.fontSize = "4rem";
        pauseBtn.style.cursor = "pointer";
        pauseBtn.style.backgroundColor = "transparent";
        pauseBtn.style.color = "white";
        pauseBtn.style.border = "none";
        pauseBtn.onclick = () => {
            if (!videoElement.paused) {
                videoElement.pause();
                playBtn.style.display = "block";
                pauseBtn.style.display = "none";
            } 
        };

        wrapperDiv.appendChild(pauseBtn);

        const pos = new THREE.Vector3(5, -110, 180);
        pos.normalize(); // makes it a unit vector (same direction, length = 1)
        pos.multiplyScalar(10); 

        this.videoObject = new CSS3DObject(wrapperDiv);
        this.videoObject.scale.set(1, 1, 1); // Scale it down for proper fit
        this.cssRenderer.domElement.style.zIndex = "1000";
        this.controls.enabled = false;

        const marker = this.cameraModel.getObjectByName("screenMarker");
        if (marker) {
            // Attach the videoObject as a child of the marker so it automatically inherits the marker’s position & rotation.
            marker.add(this.videoObject);
        } else {
            console.error("Screen marker not found on cameraModel!");
        }
    }

    _removeIframeFromCamera() {
        const marker = this.cameraModel.getObjectByName("screenMarker");

        if (marker && this.cameraModel) {
            marker.remove(this.videoObject);
            this.videoObject = null;
        }
        // Reset pointer events to allow OrbitControls on home page
        this.cssRenderer.domElement.style.pointerEvents = "none";
    }

    _changeVideo(videoId) {
        console.log("inside _changeVideo()");
        if (this.videoObject && this.videoObject.element) {
            const videoEle = this.videoObject.element.querySelector("video");
            const source = this.videoObject.element.querySelector("source");

            if (source && videoEle) {
                source.src = "";
                videoEle.load();
                videoEle.play();
                source.src = `./assets/vids/${videoId}`;
            } else {
                console.warn("video not found inside CSS3DObject.");
            }
        } else {
            console.warn("videoObject is not set.");
        }
    }

    changePage(newPage) {
        if (!this.states.includes(newPage)) return;

        const previousPage = this.pageState;
        this.pageState = newPage;
        this._updateScene(previousPage);
    }

    _updateScene(previousPage) {
        switch (this.pageState) {
            case "home":
                this._showFooter();
                switch (previousPage) {
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
                    case "book":
                        this._bookingToHome();
                        this.controls.enabled = true;
                        break;
                    case "about":
                        this.controls.enabled = true;
                        this._aboutToHome();
                    default:
                        console.log("previousPage Page State not found");
                }
                console.log(`Switching to Home page from ${previousPage}`);
                // this._animateHome();
                break;
            case "videos":
                console.log(`Switching to Videos page ${previousPage}`);
                this.controls.enabled = false;
                this._hideFooter();
                this._homeToVideoPage();
                break;
            case "services":
                if (previousPage == "book") {
                    this._bookingToServicesPage();
                    return;
                }
                console.log(`Switching to Services page ${previousPage}`);
                this.controls.enabled = false;
                this._hideFooter();
                this._homeToServicesPage();
                break;
            case "lookbook":
                console.log(`Switching to Lookbook page ${previousPage}`);
                this._hideFooter();
                this._homeToLookbookPage();
                break;
            case "book":
                if (previousPage == "services") {
                    this._servicesToBookingPage();
                    return;
                }
                console.log("Switching to Book Us page");
                this._homeToBookingPage();
                this.controls.enabled = false;
                this._hideFooter();
                break;
            case "about":
                console.log("Switching to About page");
                this.controls.enabled = false;
                this._hideFooter();
                this._homeToAboutPage();
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
        if (backBtn.classList.length > 1) {
            backBtn.classList.remove("booking"); // remove booking class if it applied
        }
        if (backBtn) {
            backBtn.classList.remove("shown");
            console.log("back button hidden");
        }
    }

    _showBackBtn() {
        const backBtn = document.getElementById("back-btn");
        if (backBtn) {
            if (this.pageState == "book") {
                backBtn.classList.add("booking")
            }
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

    _resetScene(){
        const preset = getScenePreset("home", this.isMobile);

        gsap.to(this.cameraModel.position, {
            x: preset.modelPos.x,
            y: preset.modelPos.y,
            z: preset.modelPos.z,
            duration: 0.75,
            ease: "power2.out"
        });

        gsap.to(this.cameraModel.rotation, {
            x: preset.modelRot.x,
            y: preset.modelRot.y,
            z: preset.modelRot.x,
            duration: 0.75,
            ease: "power2.out"
        });

        gsap.to(this.cameraModel.scale, {
            x: preset.modelScale.x,
            y: preset.modelScale.y,
            z: preset.modelScale.z,
            duration: 0.75,
            ease: "power2.out"
        });
        
        gsap.to(this.camera.position, {
            x: preset.cameraPos.x,
            y: preset.cameraPos.y,
            z: preset.cameraPos.z,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => {
                this.camera.lookAt(this.cameraModel);
            }
        });
    }

    _homeToVideoPage() {
        if (!this.cameraModel) return;

        const preset = getScenePreset("videos", this.isMobile);

        this._hideMainNav();
        this._showBackBtn();
        this._showPlaylist();

        // 1) Model Position
        gsap.to(this.cameraModel.position, {
            x: preset.modelPos.x,
            y: preset.modelPos.y,
            z: preset.modelPos.z,
            duration: 0.5,
            ease: "power2.out"
        });

        // 2) Model Rotation (only y was animated)
        gsap.to(this.cameraModel.rotation, {
            y: preset.modelRot.y,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => this._addIframeToCamera()
        });

        gsap.to(this.cameraModel.scale, {
            x: preset.modelScale.x,
            y: preset.modelScale.y,
            z: preset.modelScale.z
        });

        // 3) Camera Position
        gsap.to(this.camera.position, {
            x: preset.cameraPos.x,
            y: preset.cameraPos.y,
            z: preset.cameraPos.z,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => this.camera.lookAt(this.cameraModel.position)
        });

        this._animateFOV(65);
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
        const lookbookContent = document.querySelector(".lookbook-content");
        lookbookContainer.classList.add("shown");
        lookbookContent.classList.add("shown");
        console.log("Lookbook buttons shown");
    }
    
    _hideLookbookBtns() {
        const lookbookContainer = document.querySelector(".lookbook-container");
        const lookbookContent = document.querySelector(".lookbook-content");
        lookbookContainer.classList.remove("shown");
        lookbookContent.classList.remove("shown");
        console.log("Lookbook buttons hidden");
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
        const preset = getScenePreset("lookbook", this.isMobile);
        
        const tl = gsap.timeline({ ease: "power2.in" });
        
        // 1) Camera moves & looks at model
        tl.to(
            this.camera.position,
            {
            x: preset.cameraPos.x,
            y: preset.cameraPos.y,
            z: preset.cameraPos.z,
            duration: 0.5,
            onUpdate: () => {
                this.camera.lookAt(this.cameraModel.position);
            },
        },0);
        
        // 2) Model rotation (y & z only)
        tl.to(
            this.cameraModel.rotation,
            {
            y: preset.modelRot.y,
            z: preset.modelRot.z,
            duration: 0.25,
            },
            "-=0.3"
        );
        
        // 3) Model first positional shift
        tl.to(
            this.cameraModel.position,
            {
            x: preset.modelPos1.x,
            y: preset.modelPos1.y,
            z: preset.modelPos1.z,
            duration: 0.3,
            },"-=" + preset.timeToComplete );
        
        // 4) Model final positional shift
        tl.to(
            this.cameraModel.position,
            {
            x: preset.modelPos2.x,
            y: preset.modelPos2.y,
            z: preset.modelPos2.z,
            duration: 1.5,
            ease: "power2.out",
            }, "-=0.125");


        // 5) Show lookbook buttons just before the final position tween ends
        tl.call(
            () => this._showLookbookBtns(),
            null, "-=1.11");
        
        // 6) Show back button concurrently
        tl.call(
            () => this._showBackBtn(),
            null, "<");
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

        this._resetScene();
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

    _showAboutSection() {
        const aboutSection = document.querySelector(".about-section");
        aboutSection.classList.add("shown");
    }

    _hideAboutSection() {
        const aboutSection = document.querySelector(".about-section");
        aboutSection.classList.remove("shown");
    }

    _homeToAboutPage() {
        this._hideMainNav();
        this._showBackBtn();
        this._showAboutSection();

        const preset = getScenePreset("about", this.isMobile);

        gsap.to(this.cameraModel.position, {
            x: preset.modelPos.x,
            y: preset.modelPos.y,
            z: preset.modelPos.z,
            duration: 0.5,
            ease: "power2.out"
        });

        gsap.to(this.cameraModel.scale, {
            x: preset.modelScale.x,
            y: preset.modelScale.y,
            z: preset.modelScale.z,
            duration: 0.5,
            ease: "power2.out"
        });

        gsap.to(this.cameraModel.rotation, {
            x: preset.modelRot.x,
            y: preset.modelRot.y, // -0.7,
            z: preset.modelRot.z,
            duration: 0.5,
            ease: "power2.out"
        });

        gsap.to(this.camera.position, {
            x: preset.cameraPos.x,  // Adjust based on your scene
            y: preset.cameraPos.y, // Raise the camera slightly
            z: preset.cameraPos.z,  // Move closer or further
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => {
                this.camera.lookAt(this.cameraModel.position); // Keep looking at the model
            }
        });
    }

    _aboutToHome() {
        this._hideAboutSection();
        this._showMainNav();
        this._hideBackBtn();
        this._resetScene();
    }

    _showBooking() {
        const container = document.querySelector(".booking-section");

        if (container) {
            container.classList.add("shown");
            console.log("showing booking");
        }
    }

    _hideBooking() {
        const container = document.querySelector(".booking-section");

        if (container) {
            container.classList.remove("shown");
        }
    }

    _servicesToBookingPage() {
        this._hideServicesSection();
        this._resetScene();
        this._showBooking();
    }

    _bookingToServicesPage () {
        this._hideBooking();
        this._resetScene();
        this._showServicesSection();
    }


    _homeToBookingPage() {
        this._resetScene();
        this._hideMainNav();
        this._showBackBtn();
        this._hideFooter();
        this._showBooking();
    }

    _bookingToHome() {
        this._showMainNav();
        this._hideBackBtn();
        this._hideBooking();
    }
    

    _RAF() {
        requestAnimationFrame(() => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
            this.cssRenderer.render(this.scene, this.camera);
            // if (this.cameraModel) {
            //     this.camera.lookAt(this.cameraModel);
            // }
            if (this.cameraModel && this.pageState == "home") {
                // this.cameraModel.rotation.y -= 0.005;
            }
            
            this._RAF();
        });
    }

    _onWindowResize(){
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.isMobile = isMobileViewport();

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.cssRenderer.setSize(width, height);

    }
}

export default App;
