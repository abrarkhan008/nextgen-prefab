import { useState } from "react";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

export default function MicButton({ onResult, className = "" }) {
  const [listening, setListening] = useState(false);

  const startMic = async () => {
    try {
      const permission = await SpeechRecognition.requestPermissions();

      if (permission.speechRecognition !== "granted") {
        alert("Microphone permission required");
        return;
      }

      setListening(true);

      await SpeechRecognition.start({
        language: "en-IN",
        maxResults: 1,
        partialResults: false,
      });

      SpeechRecognition.addListener("speechRecognitionResult", (result) => {
        if (result.matches.length > 0) {
          onResult(result.matches[0]);
        }

        setListening(false);
      });
    } catch (error) {
      console.log(error);
      setListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startMic}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
        listening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-gray-200 text-gray-700"
      } ${className}`}
    >
      🎤
    </button>
  );
}
