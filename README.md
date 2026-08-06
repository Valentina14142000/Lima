# Lima AI 🎙️✨

Lima is a modern, full-stack AI-powered voice note assistant that records audio directly from the browser, transcribes it using Whisper, and automatically structures the raw speech into clean titles, executive summaries, and action items using advanced LLMs.

## Tech Stack
* **Framework:** Next.js 16 (App Router) + TypeScript
* **Styling:** Tailwind CSS
* **AI & Audio Engine:** Groq SDK (`whisper-large-v3` & `llama-3.3-70b-versatile`)
* **Icons:** Lucide React

## Getting Started

1. Clone the repository:
   ```bash
   git clone [https://github.com/Valentina14142000/Lima.git](https://github.com/Valentina14142000/Lima.git)
   cd Lima    Install dependencies:

Bash
npm install
Set up your environment variables:
Create a .env.local file in the root directory and add your Groq API key:

Code snippet
GROQ_API_KEY=your_groq_api_key_here
Run the development server:

Bash
npm run dev
