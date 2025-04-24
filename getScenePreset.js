export function getScenePreset(view, isMobile) {
    const presets = {
        "home": {
            desktop: {
                modelPos: { x: 75, y: -30, z: 30 },
                modelRot: { x: 0, y: -Math.PI + 0.75, z: 0 },
                modelScale: { x: 320, y: 350, z: 320 },
                cameraPos: { x: 0.25, y: 0.15, z: 0.25 }
            },
            mobile: {
                modelPos: { x: 7.5, y: -3.5, z: 3 },
                modelRot: { x: 0, y: -2.25, z: 0 },
                modelScale: { x: 20, y: 20, z: 15 },
                cameraPos: { x: 0.25, y: 0.15, z: 0.25 }
            }
        },
        "videos": {
            desktop: {
                modelPos:   { x: 75, y: -30 ,z: -20 }, // y assumed from previous scene
                modelScale: { x: 320, y: 350, z: 320 },
                modelRot:   { y: -Math.PI * 1.4},
                cameraPos:  { x: 0.3, y: 0.155, z: 0.175 }
            },
            mobile: {
                modelPos:   { x: 4.5, y: -0.5, z: 2.85 },
                modelRot:   { x: 0, y: Math.PI - 1.65, z: 0 },
                modelScale: { x: 18, y: 18, z: 13 },
                cameraPos:  { x: 0, y: 0.1, z: 2.25 }
            }
        },
        "lookbook": {
            desktop: {
                modelPos1: { x: 90, y: -40, z: 0 },
                modelPos2: { x: -50, y: -50, z: 0.8 },
                modelRot:  { y: -4.75, z: -0.025 },
                modelScale: { x: 320, y: 350, z: 320 },
                cameraPos: { x: 0.25, y: 0.15, z: 0.25 },
                timeToComplete: 0.3
            },
            mobile: {
                modelPos1: { x: 0.25, y: -2.25, z: -0.25 },
                modelPos2: { x: -20, y: -2.25, z: -10 },
                modelRot:  { x: 0, y: Math.PI / 2 - 0.2, z: -0.025 },
                modelScale: { x: 0.5, y: 0.5, z: 0.5 },
                cameraPos: { x: 0.25, y: 0.15, z: 0.25 },
                timeToComplete: 0.1
            }
        },
        "about": {
            desktop: {
                modelPos:   { x: 75, y: -30, z: -35 },
                modelRot:   { x: 0, y: Math.PI - 1, z: 0 },
                modelScale: { x: 250, y: 280, z: 250 },
                cameraPos:  { x: 0.3, y: 0.155, z: 0.175 }
            },
            mobile: {
                modelPos:   { x: 8.4, y: -4.75, z: 2.4 },
                modelRot:   { x: 0.0, y: Math.PI - 1.6, z: -0.0 },
                modelScale: { x: 20, y: 20, z: 15 },
                cameraPos:  { x: 0, y: 0.2, z: 2.25 }
            }
        }
    };
  
    return isMobile ? presets[view].mobile : presets[view].desktop;
}
  