import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";

export default function InstallButton() {
  const [prompt, setPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!prompt) return;

    prompt.prompt();
    const choice = await prompt.userChoice;
    console.log(choice.outcome);

    setPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={installApp}
      className="group relative overflow-hidden px-5 md:px-6 py-2.5 md:py-3 bg-[#1C2438] border border-[#C9A84C]/30 rounded-xl text-[#C9A84C] font-semibold text-sm md:text-base hover:bg-[#C9A84C]/10 transition-all duration-300 flex items-center gap-2 hover:border-[#C9A84C]/60 hover:shadow-lg hover:shadow-[#C9A84C]/10"
    >
      {/* Animated gradient overlay on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C]/5 to-[#C9A84C]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
      
      {/* Download icon with animation */}
      <FiDownload className="text-[#C9A84C] group-hover:animate-bounce transition-all duration-300" size={16} />
      
      {/* Button text */}
      <span className="relative">Install App</span>
      
      {/* Optional: Small badge indicator */}
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
    </button>
  );
}