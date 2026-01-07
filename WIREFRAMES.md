# DAWker – Wireframes (Textual)

---

## 1. Landing Page (`/`)

```text
+-----------------------------------------------------------------------------------+
|                                DAWker Landing                                     |
+-----------------------------------------------------------------------------------+
|  [ Logo ]  DAWker – Share Your Guitar Rigs                                       |
|-----------------------------------------------------------------------------------|
|  [ Hero Illustration / Screenshot of DAW UI ]                                     |
|                                                                                   |
|  Headline:  "Build, save, and share guitar amp setups in your browser."          |
|  Subtext:   "Create real-time guitar tones, save DAWs, and share with others."   |
|                                                                                   |
|  [ Get Started ]   [ View Community Rigs ]                                       |
|                                                                                   |
|-----------------------------------------------------------------------------------|
|  Key Features (3–4 columns):                                                      |
|   [Icon] Real-time Amp    [Icon] Preset Sharing   [Icon] Forums   [Icon] Ratings  |
|   Short description...                                                            |
|                                                                                   |
|-----------------------------------------------------------------------------------|
|  Footer:  Links (Docs | GitHub | Contact)                                        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Auth – Login / Create Account (`/login`, `/create-account`)

```text
+--------------------------------------+
|              Login                  |
+--------------------------------------+
|  DAWker Logo                        |
|  "Welcome back"                     |
|-------------------------------------|
|  [ Email Input        ]             |
|  [ Password Input     ]             |
|                                     |
|  [  Log In  ]                       |
|                                     |
|  "Don't have an account?" [Sign Up] |
+--------------------------------------+


+--------------------------------------+
|           Create Account             |
+--------------------------------------+
|  DAWker Logo                        |
|  "Create your account"              |
|-------------------------------------|
|  [ Username Input     ]             |
|  [ Email Input        ]             |
|  [ Password Input     ]             |
|                                     |
|  [  Sign Up  ]                      |
|                                     |
|  "Already have an account?" [Login] |
+--------------------------------------+
```

---

## 3. Main Layout Shell (`Layout` + `Sidebar`)

```text
+-----------------------------------------------------------------------------------+
| Sidebar (left, fixed)              |                Main Content (Outlet)         |
|------------------------------------+----------------------------------------------|
|  [ DAWker Logo ]                   |  (Changes per route: UserPage, Search, etc.)|
|                                    |                                              |
|  [ Home / Dashboard ]              |                                              |
|  [ Search Rigs     ]               |                                              |
|  [ Community       ]               |                                              |
|  [ Settings        ]               |                                              |
|                                    |                                              |
|  --------------------------------  |                                              |
|  [ Settings link + icon ]          |                                              |
+-----------------------------------------------------------------------------------+
```

---

## 4. User Dashboard (`/userpage`)

```text
+--------------------------------------------------------------+
| Header: "Your DAWs & Rigs"   [New DAW] [Import] [Logout]    |
+--------------------------------------------------------------+
| Filters / Stats:                                             |
|   [ My Rigs ▼ ]   [ Sort by: Recently Updated ▼ ]            |
|--------------------------------------------------------------|
|  Grid of DAW Cards (listOfConfigs)                           |
|                                                              |
|  +----------------------+   +----------------------+         |
|  |  DAW Name           |   |  DAW Name           |          |
|  |  "Atmospheric Rig"  |   |  "Metal Chain"      |          |
|  |  • 3 configs        |   |  • 2 configs        |          |
|  |  ★ 4.5 (12 ratings) |   |  ★ 3.8 (5 ratings)  |          |
|  |  [Open] [Share]     |   |  [Open] [Share]     |          |
|  +----------------------+   +----------------------+         |
|                                                              |
+--------------------------------------------------------------+
```

---

## 5. Search & Browse DAWs (`/search`)

```text
+-----------------------------------------------------------------------------------+
| Header: "Search Community Rigs"                                                   |
|-----------------------------------------------------------------------------------|
| Search bar & filters:                                                             |
|   [ Search by name / user ...           ][ Search ]   [x] Only My Rigs           |
|   [ Min Rating ▼ ]  [ Sort: Most Popular ▼ ]                                      |
|-----------------------------------------------------------------------------------|
| Results list (cards or rows):                                                     |
|                                                                                   |
|  +-----------------------------------------------+  (click → open details drawer) |
|  | DAW: "Atmospheric Post-Rock Rig"             |                                   |
|  | By: @Donov  •  ★ 4.7 (23 ratings)            |                                   |
|  | Tags: [Ambient] [Post-Rock] [RNBO]           |                                   |
|  +-----------------------------------------------+                                 |
|                                                                                   |
|  +-----------------------------------------------+                                 |
|  | DAW: "High Gain Metal Stack"                |                                   |
|  | By: @UserX  •  ★ 4.2 (10 ratings)           |                                   |
|  | Tags: [Metal] [High Gain]                   |                                   |
|  +-----------------------------------------------+                                 |
|                                                                                   |
|-----------------------------------------------------------------------------------|
| Right-side Drawer (opens when a DAW is selected):                                 |
|  [ DAW Name ]   ★ 4.7 (23 ratings)                                                |
|  By @username  |  [Load in Studio] [Save Copy]                                    |
|                                                                                   |
|  Configs:                                                                          |
|   - Main Stereo Out (3 components)                                                |
|   - Wet Only (2 components)                                                       |
|                                                                                   |
|  Ratings & Comments:                                                              |
|   ★★★★☆  "Great clean tones" – @userA                                            |
|   ★★★★★  "Perfect for ambient stuff" – @userB                                     |
|                                                                                   |
|   [ ★☆☆☆☆  Rating Slider ]                                                       |
|   [ Comment textarea............................. ] [ Submit Rating ]             |
|-----------------------------------------------------------------------------------|
```

---

## 6. Forums (`/forums`) & Forum Thread (`/forums/:postId`)

```text
Forums Index (/forums)
----------------------

+--------------------------------------------------------------+
| Header: "Community Forums"          [ New Post ]             |
+--------------------------------------------------------------+
| Filters: [ All Tags ▼ ]  [ My Posts Only ☐ ]                 |
|--------------------------------------------------------------|
| Post List:                                                   |
|  [HELP]   "How do I get a tight metal tone?"   @user1  12💬  |
|  [CONVO]  "Share your favorite ambient rigs"   @user2  34💬  |
|  [COLLAB] "Looking for bassist for online jam" @user3  5💬   |
|--------------------------------------------------------------|
| Click row → navigate to `/forums/:postId`                    |
+--------------------------------------------------------------+


Forum Thread (/forums/:postId)
------------------------------

+--------------------------------------------------------------+
| [Back to Forums]                                             |
| [TAG] Thread Title                                          |
| by @username • Posted: 2026-01-07                            |
|--------------------------------------------------------------|
| Original Post:                                               |
|  Long text body...                                           |
|--------------------------------------------------------------|
| Comments:                                                    |
|  @userA · 2026-01-07                                         |
|    > This rig works great with a Tube Screamer in front...   |
|                                                              |
|  @userB · 2026-01-08                                         |
|    > Try lowering the input gain in NativeAmp to 3.0         |
|--------------------------------------------------------------|
| [ Add a comment ]                                            |
|  [ textarea............................................. ]   |
|  [ Post Comment ]                                            |
+--------------------------------------------------------------+
```

---

## 7. Native Amp Demo (`/native-amp`)

```text
+-----------------------------------------------------------------------------------+
| Header: "Native Web Audio Amp"     [ Start Processing ] [ Stop ]                 |
|-----------------------------------------------------------------------------------|
| LIVE Indicator: [● LIVE]                                                         |
|-----------------------------------------------------------------------------------|
| Controls Grid:                                                                   |
|                                                                                  |
|  Input Section:          |  Distortion:            |  EQ:                        |
  -------------------------+-------------------------+-----------------------------|
  [Input Gain  0 ----|-- ] | [Drive   0 ----|---- ] | [Bass   -12 ----|---- +12 ] |
                       ^   |                         | [Mid    -12 ----|---- +12 ]|
                           |                         | [Treble -12 ----|---- +12 ]|
                                                                                  |
  Cabinet:                 |  Delay:                 |  Reverb:                   |
  -------------------------+-------------------------+-----------------------------|
  [Cabinet Freq 2k - 8k ]  | [Time  0 ----|---- 2s] | [Decay 0.1 ----|---- 0.95] |
                           | [Mix   0 ----|---- 1 ] | [Mix   0 ----|---- 1   ]   |
                                                                                  |
  Master:                  |                                                          |
  -------------------------+----------------------------------------------------------|
  [Master Volume 0 ----|-- ]   (with peak meter)                                      |
--------------------------------------------------------------------------------------+
| Instructions panel:                                                                 |
|  1. Create RNBO patch and export `patch.export.json`.                               |
|  2. Place file in `public/`.                                                        |
|  3. Click "Load RNBO Patch", then "Start Processing".                               |
--------------------------------------------------------------------------------------+
```

---

## 8. Settings Page (`/settings`)

```text
+--------------------------------------------------------------+
| Header: "Settings"                                           |
+--------------------------------------------------------------+
| Profile Section:                                             |
|  Username: [ @username          ] [ Change ]                 |
|  Email:    [ user@example.com  ] [ Change ]                 |
|--------------------------------------------------------------|
| Audio Preferences:                                           |
|  [x] Use Native Web Audio Amp as default                    |
|  [ ] Enable RNBO components (if available)                  |
|  [x] Show live level meters                                 |
|--------------------------------------------------------------|
| DAW Defaults:                                               |
|  Default input gain:   [ 5.0 ]                              |
|  Default master volume:[ -6 dB ]                            |
|--------------------------------------------------------------|
| [ Save Settings ]                                           |
| [ Reset to Defaults ]                                       |
+--------------------------------------------------------------+
```

---


