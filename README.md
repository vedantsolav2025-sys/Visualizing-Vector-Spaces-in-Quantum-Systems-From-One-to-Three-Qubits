# Multi-Qubit Visualization Toolkit

An interactive web-based toolkit for visualizing quantum states in multi-qubit systems with a beautiful dark mode interface.

## Features

### 1 Qubit System
- **Bloch Sphere Visualization**: Interactive 3D representation of single qubit states
- **State Vector Display**: View amplitudes and probabilities
- **Gate Operations**: Apply Pauli X, Y, Z, and Hadamard gates
- **Rotation Controls**: Rotate the state vector around X, Y, and Z axes
- **Norm Calculation**: Calculate the norm of the state vector

### 2 Qubit System
- **Bar Chart Visualization**: Interactive bar charts showing state probabilities
- **CNOT Gate**: Apply controlled-NOT gate operations
- **State Vector Input**: Customize amplitudes for all 4 basis states

### 3 Qubit System
- **Polytope Visualization**: Triangular bipyramid (polytope) representation
- **Interactive Rotation**: Rotate the 3D polytope to view from different angles
- **Toffoli Gate**: Apply Toffoli (CCNOT) gate operations
- **Probability-based Vertex Sizing**: Vertices scale and color based on state probabilities

## How to Use

1. **Open the Application**
   - Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
   - No server required - works directly from the file system

2. **Select Number of Qubits**
   - Click on "1 Qubit", "2 Qubits", or "3 Qubits" button
   - The interface will update to show appropriate input fields and operations

3. **Input State Vector**
   - Enter amplitudes for each basis state
   - Supports complex numbers (e.g., "1", "0.5+0.5i", "1/sqrt(2)")
   - Click "Apply State" to visualize

4. **Apply Operations**
   - Use gate buttons to apply quantum gates
   - For 1 qubit: Use rotation sliders to rotate the state
   - Calculate norm to verify state normalization

5. **Interact with Visualizations**
   - **Bloch Sphere (1 qubit)**: Click and drag to rotate, scroll to zoom
   - **Bar Charts (2 qubits)**: Automatically updates with state changes
   - **Polytope (3 qubits)**: Click and drag to rotate, scroll to zoom

## File Structure

```
qubit-visualization-toolkit/
├── index.html          # Main HTML file
├── styles.css          # Dark mode styling
├── quantum.js          # Quantum state and gate operations
├── visualization.js    # 3D visualizations (Bloch sphere, polytope)
├── app.js             # Main application logic
├── OrbitControls.js   # Camera controls for 3D scenes
└── README.md          # This file
```

## Technical Details

### Dependencies
- **Three.js** (r128): For 3D visualizations
- **Chart.js** (3.9.1): For bar chart visualizations
- No build process required - pure HTML/CSS/JavaScript

### Quantum Operations
- State normalization is automatically applied
- Gates are implemented as matrix operations
- Complex number arithmetic is handled internally

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Internet Explorer: Not supported

## Examples

### 1 Qubit - Bell State Preparation
1. Select "1 Qubit"
2. Enter amplitude "1" for |0⟩ and "0" for |1⟩
3. Click "Apply State"
4. Click "Apply Hadamard" to create superposition

### 2 Qubit - Bell State
1. Select "2 Qubits"
2. Enter "1/sqrt(2)" for |00⟩, "0" for |01⟩, "0" for |10⟩, "1/sqrt(2)" for |11⟩
3. Click "Apply State"
4. View the probability distribution

### 3 Qubit - GHZ State
1. Select "3 Qubits"
2. Enter "1/sqrt(2)" for |000⟩, "0" for others, "1/sqrt(2)" for |111⟩
3. Click "Apply State"
4. Rotate the polytope to see the state distribution

## Notes

- All states are automatically normalized
- Complex numbers can be entered as "a+bi" or "a-bi"
- The visualizations update in real-time as you apply operations
- The dark mode interface is designed for comfortable viewing

## License

This is an educational tool for learning quantum computing concepts.

