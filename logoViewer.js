import * as THREE from "three";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

export function initLogoViewer() {
    const btn = document.querySelector("#main-nav ul li:first-child .nav-btn");
    if (!btn) return;

    const img = btn.querySelector("img");
    if (img) btn.removeChild(img);

    const canvas = document.createElement("canvas");
    canvas.id = "logo-canvas";
    canvas.width = 120;
    canvas.height = 120;
    btn.appendChild(canvas);

    // Prevent drags/clicks on the canvas from firing the nav button's click handler
    canvas.addEventListener('click', (e) => e.stopPropagation());
    canvas.addEventListener('pointerdown', (e) => e.stopPropagation());

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(120, 120);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    camera.position.set(0, 0, 3);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(0, 1, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xff4422, 1.2);
    fill.position.set(-3, -1, 3);
    scene.add(fill);

    const controls = new OrbitControls(camera, canvas);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.dampingFactor = 0.08;
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 3.0;

    const fov = camera.fov * (Math.PI / 180);

    const loader = new GLTFLoader();
    loader.load("./assets/ProjectNSiteEYE.glb", (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const sphere = box.getBoundingSphere(new THREE.Sphere());

        model.position.sub(center);
        scene.add(model);

        const distance = (sphere.radius / Math.tan(fov / 2)) * 1.25;
        camera.position.set(0, 0, distance);
        camera.near = distance / 100;
        camera.far = distance * 10;
        camera.updateProjectionMatrix();

        controls.update();

        (function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        })();
    });
}
