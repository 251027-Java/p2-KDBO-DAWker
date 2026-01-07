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

