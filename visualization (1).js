/ Visualization functions for different qubit systems

let blochSphereScene, blochSphereCamera, blochSphereRenderer, blochSphereControls;
let twoQubitChart = null;
let threeQubitChart = null;
let threeQubitScene, threeQubitCamera, threeQubitRenderer, threeQubitControls;

// 1 Qubit - Bloch Sphere
function initBlochSphere(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    blochSphereScene = new THREE.Scene();
    blochSphereScene.background = new THREE.Color(0x0a0e27);

    // Camera setup
    blochSphereCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    blochSphereCamera.position.set(3, 3, 3);

    // Renderer setup
    blochSphereRenderer = new THREE.WebGLRenderer({ antialias: true });
    blochSphereRenderer.setSize(width, height);
    blochSphereRenderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(blochSphereRenderer.domElement);

    // Controls
    blochSphereControls = new THREE.OrbitControls(blochSphereCamera, blochSphereRenderer.domElement);
    blochSphereControls.enableDamping = true;
    blochSphereControls.dampingFactor = 0.05;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    blochSphereScene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    blochSphereScene.add(directionalLight);

    // Draw sphere wireframe
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        opacity: 0.3,
        transparent: true
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    blochSphereScene.add(sphere);

    // Draw axes
    const axesHelper = new THREE.AxesHelper(1.5);
    blochSphereScene.add(axesHelper);

    // Draw grid lines
    const gridHelper = new THREE.GridHelper(2, 10, 0x2d3748, 0x1e2749);
    blochSphereScene.add(gridHelper);

    // State vector arrow (will be updated)
    const arrowHelper = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 0),
        1,
        0xec4899,
        0.2,
        0.1
    );
    blochSphereScene.add(arrowHelper);
    blochSphereScene.userData.arrow = arrowHelper;

    animateBlochSphere();
}

function animateBlochSphere() {
    requestAnimationFrame(animateBlochSphere);
    if (blochSphereControls) {
        blochSphereControls.update();
    }
    if (blochSphereRenderer && blochSphereScene && blochSphereCamera) {
        blochSphereRenderer.render(blochSphereScene, blochSphereCamera);
    }
}

function updateBlochSphere(state) {
    if (!blochSphereScene) return;
    
    const coords = state.getBlochCoordinates();
    if (!coords) return;

    // Remove old arrow and point
    if (blochSphereScene.userData.arrow) {
        blochSphereScene.remove(blochSphereScene.userData.arrow);
    }
    if (blochSphereScene.userData.point) {
        blochSphereScene.remove(blochSphereScene.userData.point);
    }

    const direction = new THREE.Vector3(coords.x, coords.y, coords.z);
    const newArrow = new THREE.ArrowHelper(
        direction.normalize(),
        new THREE.Vector3(0, 0, 0),
        direction.length() || 1,
        0xec4899,
        0.2,
        0.1
    );
    blochSphereScene.add(newArrow);
    blochSphereScene.userData.arrow = newArrow;

    // Add a point at the tip
    const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    point.position.copy(direction);
    blochSphereScene.add(point);
    blochSphereScene.userData.point = point;
}

// 2 Qubit - Bar Charts
function initTwoQubitVisualization(container) {
    const canvas = document.createElement('canvas');
    canvas.id = 'two-qubit-chart';
    container.innerHTML = '';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    twoQubitChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['|00⟩', '|01⟩', '|10⟩', '|11⟩'],
            datasets: [{
                label: 'Probability',
                data: [0.25, 0.25, 0.25, 0.25],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Two-Qubit State Probabilities',
                    color: '#e2e8f0',
                    font: {
                        size: 18
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#2d3748'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#2d3748'
                    }
                }
            }
        }
    });
}

function updateTwoQubitVisualization(state) {
    if (!twoQubitChart) return;
    
    const probabilities = state.getProbabilities();
    const labels = getStateLabels(2);
    
    twoQubitChart.data.labels = labels;
    twoQubitChart.data.datasets[0].data = probabilities;
    twoQubitChart.update();
}

// 3 Qubit - Polytope (Triangular Bipyramid)
function initThreeQubitVisualization(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    threeQubitScene = new THREE.Scene();
    threeQubitScene.background = new THREE.Color(0x0a0e27);

    // Camera setup
    threeQubitCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    threeQubitCamera.position.set(5, 5, 5);

    // Renderer setup
    threeQubitRenderer = new THREE.WebGLRenderer({ antialias: true });
    threeQubitRenderer.setSize(width, height);
    threeQubitRenderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(threeQubitRenderer.domElement);

    // Controls
    threeQubitControls = new THREE.OrbitControls(threeQubitCamera, threeQubitRenderer.domElement);
    threeQubitControls.enableDamping = true;
    threeQubitControls.dampingFactor = 0.05;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    threeQubitScene.add(ambientLight);
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    threeQubitScene.add(directionalLight1);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    threeQubitScene.add(directionalLight2);

    // Create triangular bipyramid (polytope) - 8 vertices for 3 qubits
    // Top pyramid
    const topVertex = new THREE.Vector3(0, 2, 0);
    const base1 = new THREE.Vector3(1.5, 0, 0);
    const base2 = new THREE.Vector3(-0.75, 0, 1.3);
    const base3 = new THREE.Vector3(-0.75, 0, -1.3);
    
    // Bottom pyramid
    const bottomVertex = new THREE.Vector3(0, -2, 0);
    const base4 = new THREE.Vector3(0, 0, 1.5);
    const base5 = new THREE.Vector3(1.3, 0, -0.75);
    const base6 = new THREE.Vector3(-1.3, 0, -0.75);
    const base7 = new THREE.Vector3(0, 0, 0);

    const vertices = [
        topVertex, base1, base2, base3,
        bottomVertex, base4, base5, base6
    ];

    // Store vertices for state visualization
    threeQubitScene.userData.vertices = vertices;
    threeQubitScene.userData.spheres = [];
    threeQubitScene.userData.arrows = [];
    threeQubitScene.userData.labels = [];
    threeQubitScene.userData.labelSprites = [];

    // Create edges
    const edges = [
        // Top pyramid edges
        [0, 1], [0, 2], [0, 3],
        // Base triangle
        [1, 2], [2, 3], [3, 1],
        // Bottom pyramid edges
        [4, 5], [4, 6], [4, 7],
        // Connect bases
        [1, 5], [2, 6], [3, 7],
        [5, 6], [6, 7], [7, 5]
    ];

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x6366f1, linewidth: 2 });
    edges.forEach(edge => {
        const points = [vertices[edge[0]], vertices[edge[1]]];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        threeQubitScene.add(line);
    });

    // State labels for 3 qubits
    const stateLabels = ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'];
    const origin = new THREE.Vector3(0, 0, 0);

    // Add vertices as spheres with arrows and labels
    vertices.forEach((vertex, index) => {
        // Create sphere
        const sphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const sphereMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xec4899,
            emissive: 0x000000,
            shininess: 100
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(vertex);
        threeQubitScene.add(sphere);
        threeQubitScene.userData.spheres.push(sphere);

        // Create arrow from origin to vertex
        const direction = new THREE.Vector3().subVectors(vertex, origin).normalize();
        const distance = origin.distanceTo(vertex);
        
        // Create arrow with transparent materials
        const arrowColor = 0x10b981;
        const arrowHelper = new THREE.ArrowHelper(
            direction,
            origin,
            distance * 0.9, // Slightly shorter than full distance
            arrowColor, // Green color for arrows
            0.15, // Head length
            0.1  // Head width
        );
        
        // Make arrow materials transparent
        if (arrowHelper.line && arrowHelper.line.material) {
            arrowHelper.line.material.transparent = true;
            arrowHelper.line.material.opacity = 0.7;
        }
        if (arrowHelper.cone && arrowHelper.cone.material) {
            arrowHelper.cone.material.transparent = true;
            arrowHelper.cone.material.opacity = 0.7;
        }
        
        threeQubitScene.add(arrowHelper);
        threeQubitScene.userData.arrows.push(arrowHelper);

        // Create text label sprite
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = '#e2e8f0';
        context.font = 'Bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(stateLabels[index], canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.8, 0.4, 1);
        
        // Position label slightly offset from vertex
        const labelOffset = new THREE.Vector3().subVectors(vertex, origin).normalize().multiplyScalar(0.4);
        sprite.position.copy(vertex).add(labelOffset);
        
        threeQubitScene.add(sprite);
        threeQubitScene.userData.labelSprites.push(sprite);
    });

    animateThreeQubit();
}

function animateThreeQubit() {
    requestAnimationFrame(animateThreeQubit);
    if (threeQubitControls) {
        threeQubitControls.update();
    }
    
    // Update label sprites to always face camera
    if (threeQubitScene && threeQubitScene.userData.labelSprites && threeQubitCamera) {
        threeQubitScene.userData.labelSprites.forEach(sprite => {
            sprite.lookAt(threeQubitCamera.position);
        });
    }
    
    if (threeQubitRenderer && threeQubitScene && threeQubitCamera) {
        threeQubitRenderer.render(threeQubitScene, threeQubitCamera);
    }
}

// 3 Qubit - Chart Visualization
function initThreeQubitChart(container) {
    const canvas = document.createElement('canvas');
    canvas.id = 'three-qubit-chart';
    container.innerHTML = '';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    const stateLabels = ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'];
    
    threeQubitChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: stateLabels,
            datasets: [{
                label: 'Probability',
                data: [0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Three-Qubit State Probabilities',
                    color: '#e2e8f0',
                    font: {
                        size: 18
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#e2e8f0',
                    borderColor: '#6366f1',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: '#2d3748'
                    },
                    title: {
                        display: true,
                        text: 'Probability',
                        color: '#94a3b8'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: '#2d3748'
                    },
                    title: {
                        display: true,
                        text: 'State Vectors',
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

function updateThreeQubitChart(state) {
    if (!threeQubitChart) return;
    
    const probabilities = state.getProbabilities();
    const labels = getStateLabels(3);
    
    threeQubitChart.data.labels = labels;
    threeQubitChart.data.datasets[0].data = probabilities;
    threeQubitChart.update();
}

function updateThreeQubitVisualization(state) {
    if (!threeQubitScene) return;
    
    const probabilities = state.getProbabilities();
    const spheres = threeQubitScene.userData.spheres;
    const arrows = threeQubitScene.userData.arrows;
    const labelSprites = threeQubitScene.userData.labelSprites;
    
    if (!spheres || spheres.length !== 8) return;

    const stateLabels = ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'];
    const origin = new THREE.Vector3(0, 0, 0);

    // Update vertex sizes, colors, arrows, and labels based on probabilities
    spheres.forEach((sphere, index) => {
        if (index < probabilities.length) {
            const prob = probabilities[index];
            const vertex = threeQubitScene.userData.vertices[index];
            
            // Update sphere size and color
            const scale = 0.15 + prob * 0.5; // Scale from 0.15 to 0.65
            sphere.scale.set(scale, scale, scale);
            
            // Update color based on probability (brighter = higher probability)
            const intensity = prob;
            const r = 0.9 + intensity * 0.1;
            const g = 0.3 + intensity * 0.3;
            const b = 0.6 + intensity * 0.4;
            sphere.material.color.setRGB(r, g, b);
            sphere.material.emissive.setRGB(intensity * 0.3, intensity * 0.1, intensity * 0.2);

            // Update arrow visibility and color based on probability
            if (arrows && arrows[index]) {
                const arrow = arrows[index];
                const arrowOpacity = Math.max(0.4, 0.4 + prob * 0.6);
                
                // Update arrow materials - make more visible for higher probabilities
                if (arrow.line && arrow.line.material) {
                    arrow.line.material.opacity = arrowOpacity;
                    arrow.line.material.needsUpdate = true;
                }
                if (arrow.cone && arrow.cone.material) {
                    arrow.cone.material.opacity = arrowOpacity;
                    arrow.cone.material.needsUpdate = true;
                }
            }

            // Update label with probability information
            if (labelSprites && labelSprites[index]) {
                const sprite = labelSprites[index];
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 256;
                canvas.height = 128;
                
                // Background with transparency
                context.fillStyle = `rgba(0, 0, 0, ${0.7 + prob * 0.3})`;
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                // State label
                context.fillStyle = '#e2e8f0';
                context.font = 'Bold 40px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(stateLabels[index], canvas.width / 2, canvas.height / 2 - 15);
                
                // Probability value
                context.fillStyle = '#10b981';
                context.font = '24px Arial';
                context.fillText(`P: ${prob.toFixed(3)}`, canvas.width / 2, canvas.height / 2 + 20);
                
                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
                sprite.material.map = texture;
                
                // Update label position (slightly offset from vertex)
                const labelOffset = new THREE.Vector3().subVectors(vertex, origin).normalize().multiplyScalar(0.5);
                sprite.position.copy(vertex).add(labelOffset);
                
                // Make label more visible for higher probabilities
                sprite.material.opacity = Math.max(0.5, 0.5 + prob * 0.5);
            }
        }
    });
    
    // Also update the chart
    updateThreeQubitChart(state);
}

// Handle window resize
window.addEventListener('resize', () => {
    if (blochSphereRenderer && blochSphereCamera) {
        const container = document.getElementById('bloch-sphere-container');
        if (container) {
            blochSphereCamera.aspect = container.clientWidth / container.clientHeight;
            blochSphereCamera.updateProjectionMatrix();
            blochSphereRenderer.setSize(container.clientWidth, container.clientHeight);
        }
    }
    
    if (threeQubitRenderer && threeQubitCamera) {
        const container = document.getElementById('three-qubit-container');
        if (container) {
            threeQubitCamera.aspect = container.clientWidth / container.clientHeight;
            threeQubitCamera.updateProjectionMatrix();
            threeQubitRenderer.setSize(container.clientWidth, container.clientHeight);
        }
    }
    
    if (threeQubitChart) {
        const chartContainer = document.getElementById('three-qubit-chart-container');
        if (chartContainer) {
            const canvas = chartContainer.querySelector('canvas');
            if (canvas) {
                canvas.width = chartContainer.clientWidth;
                canvas.height = chartContainer.clientHeight;
            }
        }
    }
    
    if (twoQubitChart) {
        twoQubitChart.resize();
    }
    
    if (threeQubitChart) {
        threeQubitChart.resize();
    }
});

