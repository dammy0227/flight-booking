import { useEffect, useState } from "react";

export default function InstallButton() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!prompt) {
      alert("Install not available yet");
      return;
    }

    prompt.prompt();
    const choice = await prompt.userChoice;

    console.log(choice.outcome);

    setPrompt(null);
  };

  if (!prompt) return null;

  return (
    <button
      onClick={installApp}
      className="fixed bottom-5 right-5 bg-[#C9A84C] text-black px-4 py-3 rounded-xl shadow-lg"
    >
      Install App
    </button>
  );
}