// Quantum state and gate operations

class QuantumState {
    constructor(amplitudes) {
        this.amplitudes = amplitudes.map(a => {
            if (typeof a === 'number') return { real: a, imag: 0 };
            return a;
        });
        this.normalize();
    }

    normalize() {
        const norm = this.getNorm();
        if (norm > 0) {
            this.amplitudes = this.amplitudes.map(a => ({
                real: a.real / norm,
                imag: a.imag / norm
            }));
        }
    }

    getNorm() {
        return Math.sqrt(
            this.amplitudes.reduce((sum, a) => sum + a.real ** 2 + a.imag ** 2, 0)
        );
    }

    getAmplitudes() {
        return this.amplitudes;
    }

    getProbabilities() {
        return this.amplitudes.map(a => a.real ** 2 + a.imag ** 2);
    }

    applyGate(gate) {
        const n = this.amplitudes.length;
        const result = new Array(n).fill(0).map(() => ({ real: 0, imag: 0 }));
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const gateElement = gate[i][j];
                const amplitude = this.amplitudes[j];
                
                let gateReal, gateImag;
                if (typeof gateElement === 'number') {
                    gateReal = gateElement;
                    gateImag = 0;
                } else {
                    gateReal = gateElement.real || 0;
                    gateImag = gateElement.imag || 0;
                }
                
                result[i].real += gateReal * amplitude.real - gateImag * amplitude.imag;
                result[i].imag += gateReal * amplitude.imag + gateImag * amplitude.real;
            }
        }
        
        this.amplitudes = result;
        this.normalize();
    }

    // Bloch sphere coordinates for 1 qubit
    getBlochCoordinates() {
        if (this.amplitudes.length !== 2) return null;
        const alpha = this.amplitudes[0];
        const beta = this.amplitudes[1];
        
        const alphaMag = Math.sqrt(alpha.real ** 2 + alpha.imag ** 2);
        const betaMag = Math.sqrt(beta.real ** 2 + beta.imag ** 2);
        
        const theta = 2 * Math.acos(alphaMag);
        
        let phi = 0;
        if (betaMag > 0.0001) {
            const alphaPhase = Math.atan2(alpha.imag, alpha.real);
            const betaPhase = Math.atan2(beta.imag, beta.real);
            phi = betaPhase - alphaPhase;
        }
        
        const x = Math.sin(theta) * Math.cos(phi);
        const y = Math.sin(theta) * Math.sin(phi);
        const z = Math.cos(theta);
        
        return { x, y, z, theta, phi };
    }
}

// Quantum Gates
const QuantumGates = {
    // Single qubit gates
    pauliX: [[0, 1], [1, 0]],
    pauliY: [[0, -1], [1, 0]], // Simplified: -i represented as -1
    pauliZ: [[1, 0], [0, -1]],
    hadamard: [
        [1/Math.sqrt(2), 1/Math.sqrt(2)],
        [1/Math.sqrt(2), -1/Math.sqrt(2)]
    ],

    // Two qubit gates
    cnot: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 1, 0]
    ],

    // Three qubit gates
    toffoli: (() => {
        const gate = Array(8).fill(0).map(() => Array(8).fill(0));
        for (let i = 0; i < 8; i++) {
            gate[i][i] = 1;
        }
        gate[6][7] = 1;
        gate[7][6] = 1;
        gate[6][6] = 0;
        gate[7][7] = 0;
        return gate;
    })()
};

// Rotation operations
function rotateState(state, axis, angle) {
    if (state.amplitudes.length !== 2) return state;
    
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    
    let rotationMatrix;
    switch(axis) {
        case 'x':
            rotationMatrix = [
                [{ real: cos, imag: 0 }, { real: 0, imag: -sin }],
                [{ real: 0, imag: -sin }, { real: cos, imag: 0 }]
            ];
            break;
        case 'y':
            rotationMatrix = [
                [{ real: cos, imag: 0 }, { real: -sin, imag: 0 }],
                [{ real: sin, imag: 0 }, { real: cos, imag: 0 }]
            ];
            break;
        case 'z':
            rotationMatrix = [
                [{ real: Math.cos(-angle / 2), imag: Math.sin(-angle / 2) }, { real: 0, imag: 0 }],
                [{ real: 0, imag: 0 }, { real: Math.cos(angle / 2), imag: Math.sin(angle / 2) }]
            ];
            break;
        default:
            return state;
    }
    
    state.applyGate(rotationMatrix);
    return state;
}

// Helper function to evaluate mathematical expressions
function evaluateExpression(str) {
    if (!str || str.trim() === '') return 0;
    
    str = str.trim().toLowerCase();
    
    // Handle sqrt expressions
    str = str.replace(/sqrt\(([^)]+)\)/g, (match, content) => {
        const val = parseFloat(content);
        return Math.sqrt(val || 1).toString();
    });
    
    // Handle division
    if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 2) {
            const num = parseFloat(parts[0]) || 1;
            const den = parseFloat(parts[1]) || 1;
            return num / den;
        }
    }
    
    // Handle multiplication
    if (str.includes('*')) {
        const parts = str.split('*');
        return parts.reduce((acc, part) => acc * (parseFloat(part) || 1), 1);
    }
    
    return parseFloat(str) || 0;
}

// Helper function to parse complex numbers
function parseComplex(str) {
    if (!str || str.trim() === '') return { real: 0, imag: 0 };
    
    str = str.trim().replace(/\s+/g, '');
    
    // Check if it contains imaginary part
    const hasImag = /[ij]/.test(str);
    
    if (!hasImag) {
        // Pure real number
        return { real: evaluateExpression(str), imag: 0 };
    }
    
    // Handle pure imaginary numbers
    if (str === 'i' || str === 'j') {
        return { real: 0, imag: 1 };
    }
    if (str === '-i' || str === '-j') {
        return { real: 0, imag: -1 };
    }
    
    // Split by + or - but keep them
    const parts = str.split(/(?=[+-])/);
    let real = 0;
    let imag = 0;
    
    for (let part of parts) {
        if (!part) continue;
        
        const hasImagPart = /[ij]/.test(part);
        const cleaned = part.replace(/[ij]/g, '');
        
        let value = 1;
        if (cleaned === '' || cleaned === '+' || cleaned === '-') {
            value = cleaned === '-' ? -1 : 1;
        } else {
            value = evaluateExpression(cleaned);
            if (part.startsWith('-') && !cleaned.startsWith('-')) {
                value = -value;
            }
        }
        
        if (hasImagPart) {
            imag += value;
        } else {
            real += value;
        }
    }
    
    return { real, imag };
}

// Helper function to create state from input
function createStateFromInput(inputs, numQubits) {
    const dimension = 2 ** numQubits;
    const amplitudes = [];
    
    for (let i = 0; i < dimension; i++) {
        const input = inputs[i] || '0';
        const complex = parseComplex(input);
        amplitudes.push(complex);
    }
    
    return new QuantumState(amplitudes);
}

// Get state labels for n qubits
function getStateLabels(numQubits) {
    const dimension = 2 ** numQubits;
    const labels = [];
    for (let i = 0; i < dimension; i++) {
        labels.push('|' + i.toString(2).padStart(numQubits, '0') + '⟩');
    }
    return labels;
}

