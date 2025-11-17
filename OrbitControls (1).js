// Simplified OrbitControls for Three.js
// Basic implementation for camera rotation and zoom

(function() {
    'use strict';
    
    THREE.OrbitControls = function(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement !== undefined ? domElement : document;
        
        this.enableDamping = false;
        this.dampingFactor = 0.05;
        
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        let spherical = new THREE.Spherical();
        let target = new THREE.Vector3(0, 0, 0);
        
        const updateSpherical = () => {
            const offset = new THREE.Vector3();
            offset.subVectors(this.camera.position, target);
            spherical.setFromVector3(offset);
        };
        
        updateSpherical();
        
        const onMouseDown = (event) => {
            if (event.button === 0) { // Left mouse button
                isMouseDown = true;
                mouseX = event.clientX;
                mouseY = event.clientY;
                this.domElement.style.cursor = 'grabbing';
            }
        };
        
        const onMouseMove = (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            const offset = new THREE.Vector3();
            offset.setFromSpherical(spherical);
            this.camera.position.copy(offset.add(target));
            this.camera.lookAt(target);
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        };
        
        const onMouseUp = () => {
            isMouseDown = false;
            this.domElement.style.cursor = 'grab';
        };
        
        const onWheel = (event) => {
            event.preventDefault();
            const delta = event.deltaY * 0.001;
            spherical.radius += delta;
            spherical.radius = Math.max(1, Math.min(10, spherical.radius));
            
            const offset = new THREE.Vector3();
            offset.setFromSpherical(spherical);
            this.camera.position.copy(offset.add(target));
            this.camera.lookAt(target);
        };
        
        // Touch events for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        const onTouchStart = (event) => {
            if (event.touches.length === 1) {
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
            }
        };
        
        const onTouchMove = (event) => {
            if (event.touches.length === 1) {
                const deltaX = event.touches[0].clientX - touchStartX;
                const deltaY = event.touches[0].clientY - touchStartY;
                
                spherical.theta -= deltaX * 0.01;
                spherical.phi += deltaY * 0.01;
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                
                const offset = new THREE.Vector3();
                offset.setFromSpherical(spherical);
                this.camera.position.copy(offset.add(target));
                this.camera.lookAt(target);
                
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
            }
        };
        
        this.domElement.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        this.domElement.addEventListener('wheel', onWheel);
        this.domElement.addEventListener('touchstart', onTouchStart);
        this.domElement.addEventListener('touchmove', onTouchMove);
        
        if (this.domElement.style) {
            this.domElement.style.cursor = 'grab';
        }
        
        this.update = function() {
            if (this.enableDamping) {
                // Damping logic can be added here if needed
            }
        };
    };
})();

