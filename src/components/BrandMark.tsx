import { cn } from "@/lib/utils";

// Served from /public so it loads the same on every host (Lovable, Vercel, Netlify).
export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/bookflow-logo.webp"
      alt="BookFlow logo"
      width={36}
      height={36}
      className={cn("size-9 rounded-xl object-contain", className)}
    />
  );
}
