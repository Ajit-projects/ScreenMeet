import { Video } from "lucide-react";

function Footer() {
  return (
    <footer className="relative border-t mt-auto">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Video className="size-5 text-emerald-500" />
            <span>Making technical interviews effortless</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;