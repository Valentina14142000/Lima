# Lima 

Lima is a modern, full-stack AI-powered voice note assistant that records audio directly from the browser, transcribes it using Whisper, and automatically structures the raw speech into clean titles, executive summaries, and action items using advanced LLMs.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

</div>

<img width="780" height="764" alt="Screenshot 2026-08-06 at 23 32 11" src="https://github.com/user-attachments/assets/38fa0a1f-7b08-4d57-a3db-80856de2f9e7" />

## Overview
Lima streamlines your thought capture by converting unstructured audio memos into professional, actionable intelligence. Built with an optimized Next.js App Router architecture, it bridges high-performance client-side audio recording with lightning-fast cloud inference to instantly transcribe and structure your notes.

##  Features

- **Instant Voice Recording:** Record your thoughts directly from your browser.
- **Lightning-Fast Transcription:** Powered by **Groq Whisper (`whisper-large-v3-turbo`)** for ultra-fast speech-to-text.
- **Actionable Intelligence:** Uses **Groq Llama 3 (`llama-3.1-8b-instant`)** to automatically extract summaries, clear action items, and deadlines into clean JSON.
- **Modern UI & Deployment:** Styled with Tailwind CSS and deployed globally on Vercel.

---

##  Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **AI & Audio Engine:** Groq SDK (`whisper-large-v3-turbo` & `llama-3.1-8b-instant`)
- **Icons:** Lucide React

---

##  Getting Started Locally

Follow these steps to run Lima on your local machine:

### 1. Clone the repository
```bash
git clone https://github.com/Valentina14142000/Lima.git
cd Lima
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory and add your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
```
*(You can get a free API key at [console.groq.com](https://console.groq.com))*

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to test the application.

---

##  Live Application
Access the fully deployed application here: **[lima-nu-three.vercel.app](https://lima-nu-three.vercel.app/)**

---


