import logoSrc from "@/assets/bookflow-logo.webp";
const logo = { url: logoSrc };
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return <img src={logo.url} alt="BookFlow logo" className={cn("size-9 rounded-xl object-contain", className)} />;
}
