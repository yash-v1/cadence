# Cadence

A calmer way to read on screen. Cadence is a free, in-browser reading aid for people with dyslexia, ADHD, and visual tracking fatigue. It reshapes text into a more comfortable form, guides your eyes with a paced focus ruler, and can pause that ruler when you look away, using only your ordinary webcam.

**[Live demo](https://focuswithcadence.vercel.app/)**

## Following Camera

![Resumed](cadence_resume.png)

## Not Following Camera

![Paused](cadence_paused.png)

> Cadence is a reading aid, not a medical or diagnostic tool. It makes no claims about treating or detecting any condition.

## Why I built it

Commercial eye-tracking hardware costs hundreds of dollars, which puts it out of reach for most readers and many schools. I wanted to see how much of a useful assistive reading experience could be built with no special hardware, no accounts, and no cost to run. Everything in Cadence runs locally in the browser.

## Features

**Comfortable text**
- Dyslexia-friendly fonts (Lexend and OpenDyslexic), plus a system font option
- Adjustable text size, letter spacing, word spacing, line height, and line length
- Light, cream, and dark themes
- Optional bionic reading, which bolds the start of each word (off by default)

**Guided reading**
- A focus ruler that moves line by line at a pace you choose (60 to 250 words per minute)
- Pacing is based on the number of words in each line, so short lines pass quickly and long lines take longer
- A focus tunnel that dims everything except the current line
- Full manual control: play, pause, previous and next line, restart, click any line to jump, and keyboard shortcuts

**Attention-aware pausing (optional)**
- Uses your webcam to notice when you look away from the screen
- The ruler pauses after a short moment and resumes gently when you look back
- Your own Pause button always wins, and the camera can only pause the ruler, never start it

**Documents and extras**
- Paste text, or open a PDF (read on your device, never uploaded)
- Click a word to hear it spoken, using your browser's built-in voices
- Quick setups, plus your own custom setups
- Save your settings to a small file and load them on another device

## Privacy

Privacy is a design rule, not an add-on.

- No backend, no accounts, and no analytics
- Camera frames are analysed in memory and immediately discarded. They are never saved or sent anywhere
- PDFs and pasted text stay in memory and are never uploaded or stored
- The only thing saved is your settings and custom setups, in your own browser's local storage
- The deployed site uses a strict Content-Security-Policy that only allows connections to its own origin

One detail worth knowing: the MediaPipe library tries to send a small usage-logging request when the face model starts. The Content-Security-Policy in `vercel.json` blocks it. If you host Cadence yourself, keep an equivalent policy in place so that request is blocked too.

## How the camera feature works

Cadence does not try to work out which line you are reading, because ordinary webcams are not accurate enough for that. Instead it makes a coarser, more reliable decision: are you facing the screen or not?

For each camera frame, the face model reports how far your head is turned and tilted, and where your eyes are pointing. A small tracker turns that into a calm "attending" or "away" state. It waits about half a second before pausing and a fraction of a second before resuming, so blinks and quick glances do not interrupt you.

Known limitations:
- Telling "reading the bottom of the screen" apart from "glancing at the keyboard" is hard for a webcam, and results vary with lighting, camera position, and glasses
- Sensitivity can be set to Relaxed, Standard, or Strict to suit your setup
- Scanned (image-only) PDFs cannot be read, because Cadence does not do OCR
- Text extraction from PDFs with multiple columns, headers, or footers can come out imperfect
- Interface and text processing are designed for English and other space-delimited scripts

## Tech stack

- React and Vite (JavaScript)
- Tailwind CSS
- Zustand, with local storage persistence
- Framer Motion for ruler movement
- MediaPipe Tasks Vision (Face Landmarker, WebAssembly) for attention detection
- PDF.js for PDF text extraction
- Web Speech API for pronunciation
- Vitest for unit tests
- Lexend and OpenDyslexic fonts, self-hosted

## Run it locally

You need Node.js 18 or newer.

```bash
git clone https://github.com/YOUR_USERNAME/cadence.git
cd cadence
npm install
npm run dev
```

Then open the address shown in the terminal, usually `http://localhost:5173`.

Other commands:

```bash
npm test          # run unit tests
npm run lint      # check code style
npm run build     # create the production build in dist/
npm run preview   # serve the production build locally
```

The face model and WebAssembly files are included in `public/mediapipe/`, so the camera feature works offline after the first load. The camera needs a secure context, which means `localhost` or HTTPS.

## Project structure

```
src/
  core/         Pure logic with unit tests: bionic text, line grouping,
                pacing, attention tracking, PDF text rebuilding, settings
                validation, presets
  hooks/        Camera and attention hook, voice list
  lib/          PDF and speech helpers
  store/        Settings store (Zustand)
  components/   Reader, controls, camera panel, presets, PDF loader, and more
public/
  mediapipe/    Self-hosted face model and WebAssembly files
```

The logic that decides things (pacing, attention, settings validation) lives in plain functions under `src/core`, separate from the React components, so it can be tested without a browser.

## Keyboard shortcuts

Click the text first, then use:

| Key | Action |
|---|---|
| Space | Play or pause |
| Up / Down arrow | Previous or next line |
| + / - | Faster or slower |
| Esc | Pause from anywhere |

## Roadmap

- Per-user camera calibration, and smarter handling of looking down while reading the bottom of the screen
- Installable offline version (PWA)
- Syllable and phoneme splitting for long words
- OCR for scanned PDFs
- Support for Indian languages
- A small user study with readers who have dyslexia or ADHD

## Acknowledgements

- [MediaPipe](https://ai.google.dev/edge/mediapipe) for face landmark detection
- [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
- [Lexend](https://www.lexend.com/) and [OpenDyslexic](https://opendyslexic.org/), each under their own open-source licences

