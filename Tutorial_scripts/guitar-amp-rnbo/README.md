# RNBO Guitar Amp

Real-time guitar amplifier application using RNBO (from Max/MSP) and React.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create your RNBO patch in Max/MSP:**
   - Follow the instructions in `complete-rnbo-guide.md`
   - Export the patch as "patch.export.json"

3. **Place the exported patch:**
   - Copy `patch.export.json` to the `public/` folder

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Use the application:**
   - Click "Load RNBO Patch" to load your exported patch
   - When prompted, select your audio interface (e.g., Focusrite)
   - Click "Start Processing" and play your guitar
   - Adjust parameters in real-time to shape your tone

## Project Structure

```
guitar-amp-rnbo/
├── public/
│   ├── index.html
│   └── patch.export.json    ← Put your RNBO export here
├── src/
│   ├── App.js               ← Main application
│   ├── components/
│   │   └── GuitarAmp.js     ← Amp component
│   ├── index.js
│   └── index.css
└── package.json
```

## Requirements

- Node.js 16+ and npm
- Modern web browser (Chrome, Edge, or Firefox recommended)
- Audio interface (e.g., Focusrite)
- Electric guitar

## Notes

- The browser will request permission to access your audio interface
- Make sure your audio interface is connected before clicking "Start Processing"
- For best results, disable echo cancellation, noise suppression, and auto gain control in your browser's audio settings

# How the Guitar Amp RNBO Application Works

## Overview

This React application provides a web-based interface for running real-time guitar amplifier processing using RNBO (Realtime Native Binary Objects) patches exported from Max/MSP. The application loads an exported RNBO patch, connects it to your audio interface, and provides a user interface to control all the amplifier parameters in real-time.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Key Components](#key-components)
4. [How It Works: Step-by-Step](#how-it-works-step-by-step)
5. [Technical Details](#technical-details)
6. [Audio Processing Flow](#audio-processing-flow)
7. [Parameter Management](#parameter-management)
8. [Dependencies](#dependencies)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The application follows a simple but powerful architecture:

```
Browser Audio Input (Guitar/Interface)
    ↓
Web Audio API (getUserMedia)
    ↓
AudioContext → MediaStreamSource
    ↓
RNBO Device (processes audio using exported Max patch)
    ↓
AudioContext.destination (speakers/headphones)
```

**Key Technologies:**
- **React** - User interface framework
- **RNBO.js** - Runtime library for executing Max/MSP patches in the browser
- **Web Audio API** - Browser audio processing and routing
- **Tailwind CSS** - Styling framework

---

## Project Structure

```
guitar-amp-rnbo/
├── public/
│   ├── index.html              # Main HTML entry point
│   └── patch.export.json       # Exported RNBO patch from Max/MSP
├── src/
│   ├── components/
│   │   └── GuitarAmp.js        # Main component (all the logic)
│   ├── App.js                   # Root component (renders GuitarAmp)
│   ├── App.css                  # App-specific styles
│   ├── index.js                 # React entry point
│   └── index.css                # Global styles (includes Tailwind)
├── package.json                 # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration for Tailwind
└── README.md                    # Basic setup instructions
```

---

## Key Components

### 1. `GuitarAmp.js` - The Main Component

This is the heart of the application. It handles:

- **State Management**: Tracks loading, processing status, errors, and parameters
- **RNBO Device Loading**: Fetches and initializes the exported patch
- **Audio Input/Output**: Manages audio stream from interface to speakers
- **Parameter Control**: Updates RNBO patch parameters in real-time
- **UI Rendering**: Displays controls and status information

### 2. `App.js` - Root Component

Simple wrapper that renders the `GuitarAmp` component.

### 3. `patch.export.json` - The RNBO Patch

This file contains the entire guitar amp processing algorithm exported from Max/MSP. It includes:
- All signal processing objects (filters, distortion, delay, reverb, etc.)
- Parameter definitions (min, max, initial values)
- Audio routing information
- DSP code (if using `codebox~`)

---

## How It Works: Step-by-Step

### Step 1: Application Initialization

When the React app loads:

1. **AudioContext Creation**: The app creates a Web Audio API `AudioContext` on component mount
   ```javascript
   audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
   ```

2. **UI Display**: The user sees a "Load RNBO Patch" button

### Step 2: Loading the RNBO Patch

When the user clicks "Load RNBO Patch":

1. **Fetch Patch File**: The app fetches `patch.export.json` from the `public/` folder
   ```javascript
   const response = await fetch('/patch.export.json');
   const patchExport = await response.json();
   ```

2. **Import RNBO Library**: Dynamically imports the `@rnbo/js` library
   ```javascript
   const { createDevice } = await import('@rnbo/js');
   ```

3. **Create RNBO Device**: Instantiates the RNBO device with the patch export
   ```javascript
   const device = await createDevice({ context, patchExport });
   ```

4. **Connect to Output**: Connects the device's audio node to the browser's audio output
   ```javascript
   device.node.connect(context.destination);
   ```

5. **Extract Parameters**: Reads all parameters from the device and stores them in state
   ```javascript
   device.parameters.forEach(param => {
     parameters[param.name] = { /* parameter info */ };
   });
   ```

6. **Update UI**: Shows "Start Processing" button and parameter controls

### Step 3: Starting Audio Processing

When the user clicks "Start Processing":

1. **Request Audio Input**: Uses `getUserMedia` to access the audio interface
   ```javascript
   const stream = await navigator.mediaDevices.getUserMedia({
     audio: {
       echoCancellation: false,
       noiseSuppression: false,
       autoGainControl: false,
       latency: 0,
       sampleRate: 44100
     }
   });
   ```

2. **Resume Audio Context**: Browsers require user interaction to start audio
   ```javascript
   if (context.state === 'suspended') {
     await context.resume();
   }
   ```

3. **Create Input Node**: Creates a `MediaStreamSource` from the audio stream
   ```javascript
   const inputNode = context.createMediaStreamSource(stream);
   ```

4. **Connect to RNBO**: Connects the input node to the RNBO device
   ```javascript
   inputNode.connect(rnboDeviceRef.current.node);
   ```

5. **Start Processing**: Audio now flows: Interface → Input Node → RNBO Device → Speakers

### Step 4: Real-Time Parameter Control

When the user adjusts a parameter slider:

1. **Slider Change**: User moves a slider in the UI
2. **Update Function**: `updateParameter()` is called with the parameter name and new value
3. **Find Parameter**: Looks up the parameter in the RNBO device's parameter map
4. **Update Value**: Sets the new value directly on the RNBO parameter
   ```javascript
   const param = rnboDeviceRef.current.parametersById.get(params[paramName].id);
   param.value = parseFloat(value);
   ```
5. **Immediate Effect**: The RNBO patch processes the change in real-time (no latency)

### Step 5: Stopping Audio Processing

When the user clicks "Stop Processing":

1. **Disconnect Input**: Disconnects the input node from the RNBO device
2. **Stop Media Stream**: Stops all audio tracks in the media stream
3. **Cleanup**: Clears references and updates UI state

---

## Technical Details

### Audio Context Management

The application uses a single `AudioContext` instance that:
- Is created when the component mounts
- Is suspended initially (browser security requirement)
- Is resumed when the user starts processing
- Is closed when the component unmounts

### RNBO Device Lifecycle

1. **Creation**: Device is created after patch file is loaded
2. **Connection**: Device node is connected to audio output immediately
3. **Processing**: Device processes audio only when input is connected
4. **Parameter Updates**: Parameters can be changed at any time, even when not processing

### State Management

The component uses React hooks for state:

- **`useState`**: Manages UI state (loading, errors, parameters, processing status)
- **`useRef`**: Stores persistent references (AudioContext, RNBO device, input node, stream)
- **`useEffect`**: Handles initialization and cleanup

### Parameter Organization

Parameters are organized into logical sections:
- **Input**: `inputGain`
- **Distortion**: `drive`
- **EQ**: `bass`, `mid`, `treble`, `presence`
- **Cabinet**: `cabinet`
- **Delay**: `delayTime`, `delayFeedback`, `delayMix`
- **Reverb**: `reverbDecay`, `reverbMix`
- **Output**: `master`

The UI dynamically shows only parameters that exist in the loaded patch.

---

## Audio Processing Flow

Here's the complete audio signal path:

```
1. Guitar/Interface
   ↓ (analog audio)
2. Audio Interface (Focusrite, etc.)
   ↓ (USB/Firewire/Thunderbolt)
3. Browser (getUserMedia API)
   ↓ (digital audio stream)
4. Web Audio API (MediaStreamSource)
   ↓ (AudioNode)
5. RNBO Device (patch.export.json)
   ├── Input Gain
   ├── High-Pass Filter
   ├── Distortion
   ├── EQ (Bass/Mid/Treble/Presence)
   ├── Cabinet Simulation
   ├── Delay
   ├── Reverb
   └── Master Volume + Limiter
   ↓ (processed audio)
6. AudioContext.destination
   ↓ (digital audio)
7. Audio Interface Output
   ↓ (analog audio)
8. Speakers/Headphones
```

**Latency Considerations:**
- Browser audio processing: ~5-20ms
- RNBO processing: ~1-5ms (depends on patch complexity)
- Interface latency: ~2-10ms
- **Total latency: ~8-35ms** (acceptable for real-time performance)

---

## Parameter Management

### How Parameters Work

1. **Definition in Max/MSP**: Parameters are defined using `param` objects in the RNBO patch
   ```
   param inputGain @min 0 @max 2 @initial 1
   ```

2. **Export**: When exported, parameters are included in `patch.export.json`

3. **Loading**: RNBO.js reads parameters and exposes them via `device.parameters`

4. **Access**: Each parameter has:
   - `id`: Unique identifier
   - `name`: Parameter name (e.g., "inputGain")
   - `min`: Minimum value
   - `max`: Maximum value
   - `value`: Current value
   - `steps`: Number of discrete steps (if applicable)

5. **Updates**: Values are updated via `parametersById` map:
   ```javascript
   device.parametersById.get(parameterId).value = newValue;
   ```

### Parameter UI

The UI uses HTML range sliders (`<input type="range">`) that:
- Show current value in real-time
- Display min/max values
- Update RNBO parameters on change
- Are organized into logical sections

---

## Dependencies

### Core Dependencies

- **`react`** (^18.2.0): UI framework
- **`react-dom`** (^18.2.0): React DOM rendering
- **`@rnbo/js`** (^1.4.2): RNBO runtime library for executing Max patches

### Development Dependencies

- **`react-scripts`** (5.0.1): Create React App build tools
- **`tailwindcss`** (^3.4.19): Utility-first CSS framework
- **`autoprefixer`** (^10.4.23): CSS vendor prefixing
- **`postcss`** (^8.5.6): CSS processing

### Browser Requirements

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support (may require user gesture for audio)
- **Mobile browsers**: Limited support (not recommended for real-time audio)

---

## Troubleshooting

### Problem: "Failed to load patch.export.json"

**Solutions:**
- Verify the file exists in the `public/` folder
- Check the file name is exactly `patch.export.json`
- Restart the development server (`npm start`)
- Check browser console for specific error messages
- Verify the file is valid JSON (open it in a text editor)

### Problem: No audio output

**Solutions:**
- Check that audio interface is selected in browser permissions
- Verify "Start Processing" was clicked (not just "Load RNBO Patch")
- Check browser console for audio errors
- Try increasing `master` and `inputGain` parameters
- Verify your audio interface is working (test in another app)
- Check browser audio settings (some browsers mute by default)

### Problem: High latency or audio glitches

**Solutions:**
- Close other applications using the audio interface
- Reduce buffer size in browser audio settings (if available)
- Simplify the RNBO patch (fewer effects = lower CPU usage)
- Use a faster computer or dedicated audio interface
- Check CPU usage in Task Manager/Activity Monitor

### Problem: Parameters don't update

**Solutions:**
- Check browser console for errors
- Verify parameter names match between patch and UI
- Ensure the patch was loaded successfully
- Try reloading the page and loading the patch again

### Problem: "AudioContext was not allowed to start"

**Solutions:**
- This is a browser security feature - audio must start from user interaction
- Make sure you click "Start Processing" (not just load the patch)
- Some browsers require HTTPS for audio access
- Check browser permissions for microphone/audio access

### Problem: Distorted or clipping audio

**Solutions:**
- Reduce `inputGain` parameter
- Reduce `drive` parameter
- Reduce `master` parameter
- Check that the limiter (`clip~`) is working in your patch
- Lower the input level on your audio interface

---

## Key Concepts Explained

### What is RNBO?

**RNBO (Realtime Native Binary Objects)** is a technology from Cycling '74 that converts Max/MSP patches into portable code that can run:
- In web browsers (via RNBO.js)
- As VST/AU plugins
- On embedded hardware
- In other applications

### Why Use RNBO Instead of Native Max?

- **Portability**: Run Max patches in any web browser
- **Performance**: Compiled code runs faster than interpreted Max patches
- **Distribution**: Share your audio processing without requiring Max/MSP
- **Integration**: Easily integrate with web applications

### How Does the Web Audio API Work?

The Web Audio API provides:
- **AudioContext**: The main audio processing environment
- **AudioNodes**: Processing units (sources, effects, destinations)
- **Audio Routing**: Connect nodes together to create signal chains
- **Real-time Processing**: Low-latency audio processing in the browser

### What Happens When You Export from Max?

When you export an RNBO patch:
1. Max analyzes your patch
2. Converts all objects to optimized code
3. Extracts parameter definitions
4. Packages everything into a JSON file
5. The JSON file contains everything needed to recreate the patch in the browser

---

## Next Steps

### Enhancing the Application

1. **Add Presets**: Save and load parameter combinations
2. **Visual Feedback**: Add VU meters or waveform visualization
3. **MIDI Control**: Allow MIDI controllers to adjust parameters
4. **Recording**: Add ability to record processed audio
5. **Multiple Patches**: Load different amp models
6. **Stereo Processing**: Support stereo input/output
7. **Latency Compensation**: Add delay compensation for monitoring

### Learning More

- **RNBO Documentation**: [Cycling '74 RNBO Docs](https://rnbo.cycling74.com/)
- **Web Audio API**: [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- **React Hooks**: [React Hooks Documentation](https://react.dev/reference/react)
- **Max/MSP**: [Max Documentation](https://docs.cycling74.com/max8)

---

## Summary

This application demonstrates how to:
1. Load and execute Max/MSP patches in a web browser
2. Connect audio interfaces to web applications
3. Control audio processing parameters in real-time
4. Build a professional-looking UI for audio applications

The architecture is simple but powerful: React handles the UI, RNBO.js executes the audio processing, and the Web Audio API manages audio routing. Together, they create a complete real-time guitar amplifier that runs entirely in the browser!