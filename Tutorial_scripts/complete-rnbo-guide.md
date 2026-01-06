# Complete RNBO Guitar Amp Development Guide

## Project Overview

This guide provides complete instructions for creating a real-time guitar amplifier application using RNBO (from Max/MSP) and React. The application will process audio from a Focusrite interface in real-time, applying guitar amp effects and processing.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 0: Creating a Basic Test Patch (Recommended First Step)](#part-0-creating-a-basic-test-patch-recommended-first-step)
3. [Part 1: Creating the RNBO Patch in Max/MSP](#part-1-creating-the-rnbo-patch-in-maxmsp)
4. [Part 2: Setting Up the React Application](#part-2-setting-up-the-react-application)
5. [Part 3: Implementation Details](#part-3-implementation-details)
6. [Part 4: Testing and Optimization](#part-4-testing-and-optimization)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Software Requirements
- **Max/MSP 8.5 or later** (includes RNBO)
- **Node.js 16+** and npm
- **Modern web browser** (Chrome, Edge, or Firefox recommended)

### Hardware Requirements
- **Focusrite audio interface** (or any audio interface)
- **Electric guitar**
- **Computer with decent CPU** (guitar processing is CPU-intensive)

### Knowledge Requirements
- Basic understanding of Max/MSP patching
- Basic React/JavaScript knowledge
- Understanding of audio signal flow

---

## Part 0: Creating a Basic Test Patch (Recommended First Step)

**Before building the full guitar amp, create a simple test patch to verify your React app works!**

This minimal patch will help you:
- Verify RNBO export works
- Test that your React app can load and run RNBO patches
- Confirm audio routing is working
- Debug any setup issues before building the complex amp

### Step 1: Create the Simplest Possible RNBO Patch

1. **Open Max/MSP**
2. **Create a new patcher** (File → New Patcher)
3. **Create an `rnbo~` object:**
   - Press 'n' to create a new object
   - Type `rnbo~` and press Enter
4. **Double-click the `rnbo~` object** to open the RNBO editor
5. **Inside the RNBO editor, create this simple patch:**

```
[inlet~]
    |
[outlet~]
```

**Instructions:**
1. Press 'n' and type `inlet~`, press Enter
2. Press 'n' and type `outlet~`, press Enter (place it below `inlet~`)
3. Connect `inlet~` output to `outlet~` input (click and drag from `inlet~` to `outlet~`)

**That's it!** This patch simply passes audio through unchanged - perfect for testing.

### Step 2: Add a Simple Parameter (Optional but Recommended)

To test that parameters work, add a volume control:

```
[inlet~]
    |
[*~ 1]
    |
[param volume @min 0 @max 2 @initial 1]
    |
[outlet~]
```

**Instructions:**
1. Add `*~ 1` between `inlet~` and `outlet~`
2. Add `param volume @min 0 @max 2 @initial 1`
3. Connect `inlet~` to `*~` left inlet
4. Connect `param` to `*~` right inlet
5. Connect `*~` to `outlet~`

### Step 3: Test in Max (Optional)

1. **Lock your patch** (Cmd/Ctrl + E)
2. **Connect your audio interface** (e.g., Focusrite)
3. **In Max preferences**, set audio interface to your device
4. **Turn on audio** (speaker icon in bottom-right)
5. **Play audio** - you should hear it pass through
6. **Adjust the volume parameter** - you should hear volume change

### Step 4: Export the Test Patch

1. **Save your patch** (inside the rnbo~ editor)
2. **In the RNBO editor window**, click the **sidebar icon** (☰) on the left
3. **Click the "Export" tab**
4. **Select "Web Export"**
5. **Choose export location** - remember this path!
6. **Click "Export" button**
7. **Wait for export to complete**

**Export Output:**
- `patch.export.json` (the file you need)
- `dependencies/` folder (may be empty for this simple patch)

### Step 5: Test in React App

1. **Copy the exported file:**
   - Copy `patch.export.json` from your export location
   - Paste it into `Tutorial_scripts/guitar-amp-rnbo/public/`
   - Make sure it's named exactly `patch.export.json`

2. **Start the React app:**
   ```bash
   cd Tutorial_scripts/guitar-amp-rnbo
   npm start
   ```

3. **Test the app:**
   - Click "Load RNBO Patch"
   - If it loads successfully, you'll see "RNBO device loaded successfully" in the console
   - Click "Start Processing"
   - When prompted, select your audio interface
   - Play your guitar or make noise into your mic
   - You should hear the audio pass through
   - If you added the volume parameter, adjust it and hear the volume change

### Troubleshooting the Test Patch

**If the patch doesn't load:**
- Check browser console for errors
- Verify `patch.export.json` is in the `public/` folder
- Make sure the file is valid JSON (open it in a text editor to check)

**If you don't hear audio:**
- Check that you selected the correct audio interface
- Verify your interface is connected and working
- Check browser console for audio errors
- Make sure your browser has permission to access the microphone

**If parameters don't work:**
- Check browser console - it should list available parameters
- Verify parameter names match what you created in Max

### Once the Test Patch Works

Once you've verified the test patch works in your React app, you're ready to build the full guitar amp patch following the instructions in Part 1.4 below.

---

## Part 1: Creating the RNBO Patch in Max/MSP

### 1.1 Understanding RNBO Basics

**What is RNBO?**
RNBO converts Max patches into portable, high-performance code that runs in web browsers, plugins, and hardware.

**RNBO-Compatible Objects:**
- `inlet~` - Access signal input (replaces `adc~` - RNBO does NOT support `adc~`)
- `outlet~` - Send signal output (replaces `dac~` - RNBO does NOT support `dac~`)
- `param` - Exposes parameters to the outside world
- All standard MSP signal objects (`*~`, `+~`, `clip~`, `biquad~`, etc.)
- `codebox~` - Custom DSP code
- `tapin~` / `tapout~` - Delay lines
- `comb~` / `allpass~` - Filters for reverb

**Objects NOT Compatible:**
- `live.*` objects
- `gen~` (use `codebox~` instead)
- VST/AU plugins
- UI objects (use `param` instead)

### 1.2 Creating the Main Patch

#### Step 1: Create New RNBO Patch

1. Open Max/MSP
2. Create a new patcher (File → New Patcher)
3. Create an `rnbo~` object (press 'n', type "rnbo~", press Enter)
4. Double-click the `rnbo~` object to open the RNBO editor
5. Inside the RNBO editor, you'll build your entire guitar amp

**Note:** If you haven't already, we strongly recommend starting with Part 0 above to create a basic test patch first. This will verify your setup works before building the full guitar amp.

### 1.3 Signal Chain Architecture

The complete signal flow should be:

```
inlet~ → Input Gain → High-Pass Filter → Distortion → 
EQ (Bass/Mid/Treble/Presence) → Cabinet Simulation → 
Delay → Reverb → Master Volume → Limiter → outlet~
```

**Note:** `inlet~` receives audio from your interface, and `outlet~` sends it to your speakers.

### 1.4 Building Each Stage

#### Stage 1: Input Stage

**IMPORTANT: RNBO doesn't use `adc~` or `dac~`!**
- RNBO automatically creates signal **inlets** for audio input
- RNBO automatically creates signal **outlets** for audio output
- You connect your processing chain between inlets and outlets

**Objects to create:**
```
[inlet~]
    |
[*~ 1]
    |
[param inputGain @min 0 @max 2 @initial 1]
```

**Instructions:**
1. Create `inlet~` object (this accesses the first signal inlet - audio input from your interface)
   - **Note:** If you need stereo input, create a second `inlet~` for the second channel
2. Create `*~ 1` object below it
3. Connect `inlet~` output to `*~ 1` left inlet
4. Create `param inputGain @min 0 @max 2 @initial 1`
5. Connect param output to `*~ 1` right inlet

#### Stage 2: High-Pass Filter

**Objects to create:**
```
[biquad~ @freq 80 @Q 0.707 @mode highpass]
```

**Instructions:**
1. Create `biquad~ @freq 80 @Q 0.707 @mode highpass`
2. Connect signal from previous stage to its input
3. This removes low-frequency rumble below 80Hz

**Optional: Make frequency controllable**
```
[biquad~ @mode highpass @Q 0.707]
    |
[param hpfFreq @min 20 @max 200 @initial 80]
```

#### Stage 3: Distortion Stage

**Objects to create:**
```
[*~ 5]
    |
[param drive @min 1 @max 20 @initial 5]
    |
[codebox~]
    |
[*~ 0.3]
```

**Instructions:**
1. Create `*~ 5` object
2. Connect signal to left inlet
3. Create `param drive @min 1 @max 20 @initial 5`
4. Connect param to right inlet of `*~`
5. Create `codebox~` object
6. Double-click `codebox~` and enter this code:

```javascript
// Soft clipping distortion using tanh
out1 = tanh(in1);
```

7. Create `*~ 0.3` object to compensate for gain
8. Connect codebox output to this multiplier

**Alternative distortion algorithms:**

For **asymmetric distortion** (tube-like):
```javascript
drive = in2;
x = in1 * drive;

if (x > 0) {
    out1 = tanh(x * 1.5) * 0.7;
} else {
    out1 = tanh(x * 1.2) * 0.8;
}
```

For **harder clipping**:
```javascript
out1 = clip(in1, -0.7, 0.7);
```

#### Stage 4: Three-Band EQ + Presence

**Objects to create:**
```
[biquad~ @mode lowshelf @freq 100 @Q 0.707]
[param bass @min -12 @max 12 @initial 0]
    ↓
[biquad~ @mode peaking @freq 800 @Q 1.0]
[param mid @min -12 @max 12 @initial 0]
    ↓
[biquad~ @mode highshelf @freq 3000 @Q 0.707]
[param treble @min -12 @max 12 @initial 0]
    ↓
[biquad~ @mode peaking @freq 2500 @Q 2.0]
[param presence @min -6 @max 6 @initial 0]
```

**Instructions:**
1. Create first `biquad~` with lowshelf mode for bass
2. Create `param bass @min -12 @max 12 @initial 0`
3. Connect param to the **gain inlet** (inlet 2) of biquad~
4. Connect signal output to next biquad~
5. Repeat for mid, treble, and presence
6. Each biquad~ receives signal on left inlet, param on gain inlet

**Important:** The gain inlet is typically the 2nd or 3rd inlet. Check Max's help file for `biquad~` to confirm.

#### Stage 5: Cabinet Simulation

**Objects to create:**
```
[biquad~ @mode lowpass @Q 0.707]
[param cabinet @min 2000 @max 8000 @initial 5000]
```

**Instructions:**
1. Create `biquad~ @mode lowpass @Q 0.707`
2. Create `param cabinet @min 2000 @max 8000 @initial 5000`
3. Connect param to frequency inlet of biquad~
4. This simulates speaker cabinet frequency rolloff

#### Stage 6: Delay Effect

**Objects to create:**
```
Input signal splits into two paths:

DRY PATH:
[*~ 0.5] (dry signal)

WET PATH:
[tapin~ 30000]
    |
[tapout~ 500]
[param delayTime @min 0 @max 2000 @initial 500]
    |
[*~ 0.3]
[param delayFeedback @min 0 @max 0.9 @initial 0.3]
    | (feedback to tapin~)

Both paths merge:
[+~]
[param delayMix @min 0 @max 1 @initial 0.3]
```

**Instructions:**
1. Split signal into two paths using patch cords
2. **Dry path**: Create `*~ 0.5` for dry signal
3. **Wet path**: 
   - Create `tapin~ 30000` (30-second max delay buffer)
   - Create `tapout~ 500` below it
   - Create `param delayTime @min 0 @max 2000 @initial 500`
   - Connect param to left inlet of `tapout~`
   - Create `*~ 0.3` below tapout
   - Create `param delayFeedback @min 0 @max 0.9 @initial 0.3`
   - Connect feedback param to right inlet of multiplier
   - Connect multiplier output BACK to `tapin~` input (creates feedback loop)
4. Create `+~` object to sum dry and wet
5. Connect both paths to `+~` inlets
6. Create `param delayMix @min 0 @max 1 @initial 0.3` to control wet/dry balance

#### Stage 7: Reverb (Parallel Comb Filters)

**Objects to create:**
```
Input splits to 4 parallel comb filters:
[comb~ 10000 1557]
[comb~ 10000 1617]
[comb~ 10000 1491]
[comb~ 10000 1422]
    |
   [+~] (sum all 4)
    |
   [*~ 0.25]
[param reverbDecay @min 0.1 @max 0.95 @initial 0.7]
    |
   [*~ 1]
[param reverbMix @min 0 @max 1 @initial 0.2]
```

**Instructions:**
1. Split input signal to 4 parallel paths
2. Create 4 `comb~` objects with different delay times:
   - `comb~ 10000 1557`
   - `comb~ 10000 1617`
   - `comb~ 10000 1491`
   - `comb~ 10000 1422`
3. Create `+~` object to sum all outputs
4. Create `*~ 0.25` to normalize (divide by 4)
5. Create feedback path with `param reverbDecay`
6. Create mix control with `param reverbMix`

**Note:** The different delay times (1557ms, 1617ms, etc.) create the reverb effect. These are prime numbers to avoid resonances.

#### Stage 8: Output Stage

**IMPORTANT: RNBO doesn't use `dac~`!**
- RNBO automatically creates signal **outlets** for audio output
- Use `outlet~` to send audio to the output

**Objects to create:**
```
[*~ 0.5]
[param master @min 0 @max 1 @initial 0.5]
    |
[clip~ -0.95 0.95]
    |
[outlet~]
```

**Instructions:**
1. Create `*~ 0.5` for master volume control
2. Create `param master @min 0 @max 1 @initial 0.5`
3. Connect param to right inlet of multiplier
4. Create `clip~ -0.95 0.95` as safety limiter
5. Create `outlet~` object (this sends audio to the first signal outlet)
   - **Note:** If you need stereo output, create a second `outlet~` for the second channel
6. Connect everything in series: multiplier → limiter → outlet~

### 1.5 Complete Parameter List

Here's the complete list of all parameters your patch should have:

```
// Input
param inputGain @min 0 @max 2 @initial 1

// Distortion
param drive @min 1 @max 20 @initial 5

// EQ
param bass @min -12 @max 12 @initial 0
param mid @min -12 @max 12 @initial 0
param treble @min -12 @max 12 @initial 0
param presence @min -6 @max 6 @initial 0

// Cabinet
param cabinet @min 2000 @max 8000 @initial 5000

// Delay
param delayTime @min 0 @max 2000 @initial 500
param delayFeedback @min 0 @max 0.9 @initial 0.3
param delayMix @min 0 @max 1 @initial 0.3

// Reverb
param reverbDecay @min 0.1 @max 0.95 @initial 0.7
param reverbMix @min 0 @max 1 @initial 0.2

// Output
param master @min 0 @max 1 @initial 0.5
```

### 1.6 Testing in Max

Before exporting:

1. **Lock your patch** (Cmd/Ctrl + E)
2. Connect your Focusrite interface
3. In Max preferences, set audio interface to your Focusrite
4. Turn on audio (speaker icon in bottom-right)
5. Play your guitar and adjust parameters
6. Monitor CPU usage (top-right corner of Max window)
7. Check for clicks, pops, or distortion
8. Test all parameter ranges

### 1.7 Exporting to Web

1. **Save your patch** (inside the rnbo~ editor)
2. In the RNBO editor window, click the **sidebar icon** (☰) on the left
3. Click the **"Export"** tab
4. Select **"Web Export"**
5. Choose your export location (remember this path!)
6. Click **"Export"** button
7. Wait for export to complete

**Export Output:**
- `patch.export.json` (main file you need)
- `dependencies/` folder (if you used audio files)

### 1.8 Optimization Tips

**To reduce CPU usage:**
- Keep delay buffer sizes reasonable (30000 samples = ~0.68 seconds at 44.1kHz)
- Use simple filters where possible
- Minimize number of `codebox~` operations
- Avoid nested `poly~` objects
- Test CPU usage in Max before exporting

**Target CPU usage:**
- Under 30% in Max = Good for web
- 30-50% = May struggle on some devices
- Over 50% = Needs optimization

---

## Part 2: Setting Up the React Application

### 2.1 Project Setup

#### Create React App

```bash
# Create new React app
npx create-react-app guitar-amp-rnbo
cd guitar-amp-rnbo

# Install RNBO.js library
npm install @rnbo/js

# Start development server (don't do this yet, finish setup first)
# npm start
```

#### Project Structure

```
guitar-amp-rnbo/
├── public/
│   ├── index.html
│   └── patch.export.json    ← Put your RNBO export here
├── src/
│   ├── App.js               ← Main application
│   ├── components/
│   │   ├── GuitarAmp.js     ← Amp component (we'll create this)
│   │   └── ParameterControl.js  ← Parameter UI (optional)
│   ├── index.js
│   └── index.css
└── package.json
```

### 2.2 Copy RNBO Export

```bash
# Copy your exported patch to the public folder
cp /path/to/your/patch.export.json ./public/
```

**Important:** The file MUST be named `patch.export.json` or update the fetch path in the code.

---

## Part 3: Implementation Details

### 3.1 Main Application Component

Create `src/components/GuitarAmp.js`:

```javascript
import React, { useState, useEffect, useRef } from 'react';

const GuitarAmp = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [deviceReady, setDeviceReady] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({});
  
  const audioContextRef = useRef(null);
  const rnboDeviceRef = useRef(null);
  const inputNodeRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Load RNBO patch
  const loadRNBOPatch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch the RNBO patch export
      const response = await fetch('/patch.export.json');
      if (!response.ok) {
        throw new Error('Failed to load patch.export.json. Make sure it\'s in the public folder.');
      }
      
      const patchExport = await response.json();
      
      // Import RNBO.js
      const { createDevice } = await import('@rnbo/js');
      
      const context = audioContextRef.current;
      
      // Create RNBO device
      const device = await createDevice({ context, patchExport });
      
      // Connect device to audio output
      device.node.connect(context.destination);
      
      rnboDeviceRef.current = device;
      
      // Extract all parameters from the device
      const parameters = {};
      device.parameters.forEach(param => {
        parameters[param.name] = {
          id: param.id,
          name: param.name,
          min: param.min,
          max: param.max,
          value: param.value,
          steps: param.steps
        };
      });
      
      setParams(parameters);
      setDeviceReady(true);
      setLoading(false);
      
      console.log('RNBO device loaded successfully');
      console.log('Available parameters:', Object.keys(parameters));
      
    } catch (err) {
      setError(`Failed to load RNBO patch: ${err.message}`);
      console.error(err);
      setLoading(false);
    }
  };

  // Start audio input from microphone/interface
  const startAudioInput = async () => {
    if (!audioContextRef.current || !rnboDeviceRef.current) {
      setError('RNBO device not loaded. Please load the patch first.');
      return;
    }
    
    try {
      // Request audio input with optimal settings for guitar
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          latency: 0,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      
      const context = audioContextRef.current;
      
      // Resume context if suspended (required by browsers)
      if (context.state === 'suspended') {
        await context.resume();
      }
      
      // Create input node from audio stream
      const inputNode = context.createMediaStreamSource(stream);
      inputNodeRef.current = inputNode;
      
      // Connect input to RNBO device
      inputNode.connect(rnboDeviceRef.current.node);
      
      setIsProcessing(true);
      setError(null);
      
      console.log('Audio processing started');
      
    } catch (err) {
      setError(`Failed to access audio input: ${err.message}`);
      console.error(err);
    }
  };

  // Stop audio processing
  const stopAudioInput = () => {
    if (inputNodeRef.current) {
      inputNodeRef.current.disconnect();
      inputNodeRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsProcessing(false);
    console.log('Audio processing stopped');
  };

  // Update a specific RNBO parameter
  const updateParameter = (paramName, value) => {
    if (rnboDeviceRef.current && params[paramName]) {
      const param = rnboDeviceRef.current.parametersById.get(params[paramName].id);
      if (param) {
        param.value = parseFloat(value);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioInput();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🎸 RNBO Guitar Amp
          </h1>
          <p className="text-gray-400">Real-time guitar processing in your browser</p>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}
        
        {/* Main Control Panel */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-8 mb-6 border border-gray-700">
          {/* Load Patch Section */}
          {!deviceReady && (
            <div className="text-center space-y-4">
              <button
                onClick={loadRNBOPatch}
                disabled={loading}
                className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/50'
                }`}
              >
                {loading ? 'Loading Patch...' : 'Load RNBO Patch'}
              </button>
              <p className="text-gray-400 text-sm">
                Make sure <code className="bg-gray-700 px-2 py-1 rounded">patch.export.json</code> is in your public folder
              </p>
            </div>
          )}
          
          {/* Audio Controls */}
          {deviceReady && (
            <div className="space-y-6">
              {/* Start/Stop Buttons */}
              <div className="flex justify-center gap-4">
                {!isProcessing ? (
                  <button
                    onClick={startAudioInput}
                    className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
                  >
                    ▶️ Start Processing
                  </button>
                ) : (
                  <button
                    onClick={stopAudioInput}
                    className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-red-500/50"
                  >
                    ⏹️ Stop Processing
                  </button>
                )}
              </div>
              
              {/* Processing Indicator */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="relative">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-green-400 font-semibold text-lg">LIVE</span>
                </div>
              )}
              
              {/* Parameters Grid */}
              {Object.keys(params).length > 0 && (
                <div className="space-y-6 mt-8">
                  <h2 className="text-2xl font-bold text-center mb-6">Effect Controls</h2>
                  
                  {/* Organize parameters by section */}
                  <ParameterSection 
                    title="Input" 
                    params={params} 
                    paramNames={['inputGain']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="Distortion" 
                    params={params} 
                    paramNames={['drive']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="EQ" 
                    params={params} 
                    paramNames={['bass', 'mid', 'treble', 'presence']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="Cabinet" 
                    params={params} 
                    paramNames={['cabinet']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="Delay" 
                    params={params} 
                    paramNames={['delayTime', 'delayFeedback', 'delayMix']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="Reverb" 
                    params={params} 
                    paramNames={['reverbDecay', 'reverbMix']}
                    updateParameter={updateParameter}
                  />
                  
                  <ParameterSection 
                    title="Output" 
                    params={params} 
                    paramNames={['master']}
                    updateParameter={updateParameter}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Instructions Panel */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="font-bold text-xl mb-4 text-blue-400">📋 Setup Instructions</h3>
          <ol className="space-y-3 text-gray-300 list-decimal list-inside">
            <li>Create your guitar amp patch in Max/MSP using RNBO</li>
            <li>Export the patch as "patch.export.json"</li>
            <li>Place the file in your React project's <code className="bg-gray-700 px-2 py-1 rounded">public/</code> folder</li>
            <li>Click "Load RNBO Patch" above</li>
            <li>When prompted, select your Focusrite interface</li>
            <li>Click "Start Processing" and play your guitar</li>
            <li>Adjust parameters in real-time to shape your tone</li>
          </ol>
          
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-300 text-sm">
              <strong>⚠️ Note:</strong> Your browser will request permission to access your audio interface.
              Make sure your Focusrite is connected before clicking "Start Processing".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for parameter sections
const ParameterSection = ({ title, params, paramNames, updateParameter }) => {
  // Filter to only show parameters that exist
  const existingParams = paramNames.filter(name => params[name]);
  
  if (existingParams.length === 0) return null;
  
  return (
    <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
      <h3 className="text-lg font-bold mb-4 text-blue-300">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {existingParams.map(paramName => {
          const param = params[paramName];
          return (
            <div key={paramName} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-300">
                  {param.name}
                </label>
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                  {param.value.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={(param.max - param.min) / 100}
                defaultValue={param.value}
                onChange={(e) => updateParameter(paramName, e.target.value)}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{param.min}</span>
                <span>{param.max}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuitarAmp;
```

### 3.2 Update App.js

Replace the contents of `src/App.js`:

```javascript
import React from 'react';
import GuitarAmp from './components/GuitarAmp';
import './App.css';

function App() {
  return (
    <div className="App">
      <GuitarAmp />
    </div>
  );
}

export default App;
```

### 3.3 Update index.css

Replace `src/index.css` with Tailwind-compatible styling:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* Custom slider styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box