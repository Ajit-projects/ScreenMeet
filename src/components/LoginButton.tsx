import { SignInButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";

function LoginButton() {
  return (
    <SignInButton mode="modal">
      <button
        className="
        ml-auto flex items-center gap-2
        px-4 py-2
        text-sm font-medium text-white
        rounded-lg
        bg-emerald-600
        hover:bg-emerald-700
        transition-all duration-200
        shadow-md hover:shadow-lg
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-emerald-500
        hover:scale-[1.02]
        "
      >
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </button>
    </SignInButton>
  );
}

export default LoginButton;