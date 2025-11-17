// Main application logic

let currentQubits = 0;
let currentState = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupQubitSelector();
    setupStateInput();
    setupOperations();
});

function setupQubitSelector() {
    const qubitButtons = document.querySelectorAll('.qubit-btn');
    qubitButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const numQubits = parseInt(btn.dataset.qubits);
            selectQubits(numQubits);
            
            // Update active state
            qubitButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function selectQubits(numQubits) {
    currentQubits = numQubits;
    currentState = null;
    
    // Update state input
    updateStateInput(numQubits);
    
    // Update operations
    updateOperations(numQubits);
    
    // Initialize visualization
    initVisualization(numQubits);
    
    // Clear info panel
    document.getElementById('state-info').innerHTML = '';
}

function updateStateInput(numQubits) {
    const container = document.getElementById('state-input-container');
    const dimension = 2 ** numQubits;
    const labels = getStateLabels(numQubits);
    
    container.innerHTML = '';
    
    for (let i = 0; i < dimension; i++) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        
        const label = document.createElement('label');
        label.textContent = `${labels[i]} amplitude:`;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `state-input-${i}`;
        input.placeholder = i === 0 ? '1' : '0';
        input.value = i === 0 ? '1' : '0';
        
        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        container.appendChild(inputGroup);
    }
}

function updateOperations(numQubits) {
    const container = document.getElementById('operations-container');
    container.innerHTML = '';
    
    if (numQubits === 1) {
        // Single qubit operations
        addOperationButton(container, 'Calculate Norm', () => calculateNorm());
        addOperationButton(container, 'Apply Pauli X', () => applyGate('pauliX'));
        addOperationButton(container, 'Apply Pauli Y', () => applyGate('pauliY'));
        addOperationButton(container, 'Apply Pauli Z', () => applyGate('pauliZ'));
        addOperationButton(container, 'Apply Hadamard', () => applyGate('hadamard'));
        
        // Rotation controls
        const rotationDiv = document.createElement('div');
        rotationDiv.className = 'rotation-controls';
        rotationDiv.innerHTML = `
            <div class="rotation-input">
                <label>X Rotation (radians)</label>
                <input type="range" id="rot-x" min="0" max="6.28" step="0.1" value="0">
                <div class="rotation-value" id="rot-x-value">0</div>
            </div>
            <div class="rotation-input">
                <label>Y Rotation (radians)</label>
                <input type="range" id="rot-y" min="0" max="6.28" step="0.1" value="0">
                <div class="rotation-value" id="rot-y-value">0</div>
            </div>
            <div class="rotation-input">
                <label>Z Rotation (radians)</label>
                <input type="range" id="rot-z" min="0" max="6.28" step="0.1" value="0">
                <div class="rotation-value" id="rot-z-value">0</div>
            </div>
        `;
        container.appendChild(rotationDiv);
        
        // Add rotation event listeners
        ['x', 'y', 'z'].forEach(axis => {
            const slider = document.getElementById(`rot-${axis}`);
            const valueDisplay = document.getElementById(`rot-${axis}-value`);
            if (slider && valueDisplay) {
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    valueDisplay.textContent = value.toFixed(2);
                    if (currentState) {
                        rotateState(currentState, axis, value);
                        updateVisualization();
                        updateStateInfo();
                    }
                });
            }
        });
    } else if (numQubits === 2) {
        addOperationButton(container, 'Calculate Norm', () => calculateNorm());
        addOperationButton(container, 'Apply CNOT Gate', () => applyGate('cnot'));
    } else if (numQubits === 3) {
        addOperationButton(container, 'Calculate Norm', () => calculateNorm());
        addOperationButton(container, 'Apply Toffoli Gate', () => applyGate('toffoli'));
    }
}

function addOperationButton(container, text, onClick) {
    const btn = document.createElement('button');
    btn.className = 'operation-btn';
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    container.appendChild(btn);
}

function setupStateInput() {
    document.getElementById('apply-state-btn').addEventListener('click', () => {
        applyState();
    });
}

function applyState() {
    if (currentQubits === 0) {
        alert('Please select number of qubits first');
        return;
    }
    
    const dimension = 2 ** currentQubits;
    const inputs = [];
    
    for (let i = 0; i < dimension; i++) {
        const input = document.getElementById(`state-input-${i}`);
        if (input) {
            inputs.push(input.value);
        } else {
            inputs.push('0');
        }
    }
    
    try {
        currentState = createStateFromInput(inputs, currentQubits);
        updateVisualization();
        updateStateInfo();
    } catch (error) {
        alert('Error creating state: ' + error.message);
        console.error(error);
    }
}

function initVisualization(numQubits) {
    const container = document.getElementById('visualization-container');
    container.innerHTML = '';
    
    if (numQubits === 1) {
        const div = document.createElement('div');
        div.id = 'bloch-sphere-container';
        container.appendChild(div);
        setTimeout(() => initBlochSphere(div), 100);
    } else if (numQubits === 2) {
        const div = document.createElement('div');
        div.id = 'two-qubit-container';
        container.appendChild(div);
        setTimeout(() => initTwoQubitVisualization(div), 100);
    } else if (numQubits === 3) {
        // Create container for polytope
        const polytopeDiv = document.createElement('div');
        polytopeDiv.id = 'three-qubit-container';
        polytopeDiv.style.width = '100%';
        polytopeDiv.style.height = '500px';
        polytopeDiv.style.marginBottom = '20px';
        container.appendChild(polytopeDiv);
        
        // Create container for chart
        const chartDiv = document.createElement('div');
        chartDiv.id = 'three-qubit-chart-container';
        chartDiv.style.width = '100%';
        chartDiv.style.height = '400px';
        container.appendChild(chartDiv);
        
        setTimeout(() => {
            initThreeQubitVisualization(polytopeDiv);
            initThreeQubitChart(chartDiv);
        }, 100);
    }
}

function updateVisualization() {
    if (!currentState) return;
    
    if (currentQubits === 1) {
        updateBlochSphere(currentState);
    } else if (currentQubits === 2) {
        updateTwoQubitVisualization(currentState);
    } else if (currentQubits === 3) {
        updateThreeQubitVisualization(currentState);
        // Chart is updated within updateThreeQubitVisualization
    }
}

function updateStateInfo() {
    if (!currentState) return;
    
    const infoDiv = document.getElementById('state-info');
    const amplitudes = currentState.getAmplitudes();
    const probabilities = currentState.getProbabilities();
    const labels = getStateLabels(currentQubits);
    const norm = currentState.getNorm();
    
    let html = `<div class="state-vector">`;
    html += `<strong>State Vector:</strong><br>`;
    amplitudes.forEach((amp, i) => {
        const real = amp.real || 0;
        const imag = amp.imag || 0;
        let ampStr;
        if (Math.abs(imag) < 0.0001) {
            ampStr = real.toFixed(4);
        } else if (Math.abs(real) < 0.0001) {
            ampStr = imag.toFixed(4) + 'i';
        } else {
            const sign = imag >= 0 ? '+' : '';
            ampStr = `${real.toFixed(4)} ${sign}${imag.toFixed(4)}i`;
        }
        html += `${labels[i]}: ${ampStr}<br>`;
    });
    html += `</div>`;
    
    html += `<div class="state-vector">`;
    html += `<strong>Amplitudes & Probabilities:</strong><br>`;
    amplitudes.forEach((amp, i) => {
        const real = amp.real || 0;
        const imag = amp.imag || 0;
        const magnitude = Math.sqrt(real ** 2 + imag ** 2);
        html += `
            <div class="amplitude-display">
                <span class="amplitude-label">${labels[i]}</span>
                <span class="amplitude-value">|${magnitude.toFixed(4)}|, P=${probabilities[i].toFixed(4)}</span>
            </div>
        `;
    });
    html += `</div>`;
    
    html += `<div class="state-vector">`;
    html += `<strong>Norm:</strong> ${norm.toFixed(6)}<br>`;
    html += `</div>`;
    
    if (currentQubits === 1) {
        const coords = currentState.getBlochCoordinates();
        if (coords) {
            html += `<div class="state-vector">`;
            html += `<strong>Bloch Sphere Coordinates:</strong><br>`;
            html += `x: ${coords.x.toFixed(4)}, y: ${coords.y.toFixed(4)}, z: ${coords.z.toFixed(4)}<br>`;
            html += `θ: ${coords.theta.toFixed(4)}, φ: ${coords.phi.toFixed(4)}<br>`;
            html += `</div>`;
        }
    }
    
    infoDiv.innerHTML = html;
}

function calculateNorm() {
    if (!currentState) {
        alert('Please apply a state first');
        return;
    }
    
    const norm = currentState.getNorm();
    alert(`Norm of the state vector: ${norm.toFixed(6)}`);
}

function applyGate(gateName) {
    if (!currentState) {
        alert('Please apply a state first');
        return;
    }
    
    try {
        let gate;
        if (gateName === 'pauliX') {
            gate = QuantumGates.pauliX;
        } else if (gateName === 'pauliY') {
            gate = QuantumGates.pauliY;
        } else if (gateName === 'pauliZ') {
            gate = QuantumGates.pauliZ;
        } else if (gateName === 'hadamard') {
            gate = QuantumGates.hadamard;
        } else if (gateName === 'cnot') {
            gate = QuantumGates.cnot;
        } else if (gateName === 'toffoli') {
            gate = QuantumGates.toffoli;
        }
        
        if (gate && gate.length === currentState.amplitudes.length) {
            currentState.applyGate(gate);
            updateVisualization();
            updateStateInfo();
        } else {
            alert('Gate dimension does not match state dimension');
        }
    } catch (error) {
        alert('Error applying gate: ' + error.message);
        console.error(error);
    }
}

