# 🎙️ InterviewAI - Your Personal AI Interview Coach

![InterviewAI Banner](https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=2070&auto=format&fit=crop)

**InterviewAI** is a premium, AI-powered mock interview platform designed to help candidates ace their technical and behavioral interviews. Unlike generic tools, InterviewAI reads your **Resume** and the **Job Description** to ask highly personalized questions, just like a real recruiter.

With a beautiful glass-morphism interface, voice interaction, and an integrated code editor, it provides the most realistic interview simulation available.

---

## ✨ Key Features

### 🤖 Context-Aware Intelligence
-   **Resume Analysis**: Upload your PDF resume, and the AI extracts your skills and projects to ask specific follow-up questions.
-   **Job Description Matching**: Paste the JD to simulate an interview for that exact role.
-   **Personalized Questions**: "I see you used React in Project X, how would you handle state management there?"

### 💻 Integrated Coding Environment
-   **Monaco Editor**: Built-in code editor (same as VS Code) with syntax highlighting.
-   **Multi-Language**: Supports JavaScript, Python, Java, and C++.
-   **AI Code Review**: Submitting code gets you instant feedback on **Time Complexity (Big O)**, **Correctness**, and **Code Quality**.

### 🗣️ Voice-First Experience
-   **Speech-to-Text**: Answer questions naturally using your microphone.
-   **Text-to-Speech**: The interviewer "speaks" the questions to you.
-   **Audio Visualizer**: Real-time audio feedback during the session.

### 🎨 Premium User Experience
-   **Glassmorphism Design**: Modern, sleek dark mode UI with blurs and gradients.
-   **Dashboard**: Track your progress, average scores, and session history locally.
-   **Privacy Focused**: All your data (Resume, History) is stored in your browser's `localStorage`.

---

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), TypeScript
-   **Styling**: Tailwind CSS, Shadcn/UI, Lucide Icons
-   **AI Model**: Google Gemini 1.5 Flash
-   **Editor**: Monaco Editor (`@monaco-editor/react`)
-   **PDF Processing**: PDF.js (`pdfjs-dist`)
-   **State Management**: React Hooks + LocalStorage
-   **Speech**: Web Speech API

---

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+
-   A Google Gemini API Key (Free)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/saharsh3008/project_interviewai.git
    cd project_interviewai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

---

## 📦 Deployment

This project is optimized for deployment on **Vercel** or **Netlify**.

1.  Push your code to GitHub.
2.  Import the repo in Vercel.
3.  **IMPORTANT**: Add `VITE_GEMINI_API_KEY` in Vercel's "Environment Variables" settings.
4.  Deploy!

> *Note: If your API key doesn't work after deployment, try "Redeploying" to ensure the key is baked into the build.*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
