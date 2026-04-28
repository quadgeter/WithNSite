import App from './app.js';
import { initLogoViewer } from './logoViewer.js';

document.addEventListener('DOMContentLoaded', () => {
    const scene = new App();
    initLogoViewer();
});