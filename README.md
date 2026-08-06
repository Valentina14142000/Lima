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
Lima streamlines your thought capture by converting unstructured audio memos into professional, actionable intelligence. Built with an optimized App Router architecture, it bridges high-performance client-side audio recording with lightning-fast cloud inference.

## Tech Stack
* **Framework:** Next.js 16 (App Router) + TypeScript
* **Styling:** Tailwind CSS
* **AI & Audio Engine:** Groq SDK (`whisper-large-v3` & `llama-3.3-70b-versatile`)
* **Icons:** Lucide React

## Getting Started

1. Clone the repository:
   ```bash
   git clone github repository
   cd Lima

2. Install dependencies:
```Bash
npm install
```

3. Set up your environment variables:
Create a .env.local file in the root directory and add your Groq API key:
```Code snippet
GROQ_API_KEY=your_groq_api_key_here
```

4. Run the development server:
```Bash
npm run dev
```
