
// Web Speech API types are built into TypeScript's DOM library
// This file extends the Window interface for better browser compatibility

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

// Ensure the SpeechRecognition constructor is available
declare var webkitSpeechRecognition: {
  new (): SpeechRecognition;
};
