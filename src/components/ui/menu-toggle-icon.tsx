import { cn } from "@/lib/utils";

export function MenuToggleIcon({ open, className, duration = 300 }: { open: boolean, className?: string, duration?: number }) {
  return (
    <div className={cn("flex flex-col gap-1.5 items-center justify-center w-5 h-5 relative", className)}>
      <span className={cn("w-full h-[2px] bg-current transition-transform ease-out", open ? "rotate-45 absolute" : "")} style={{ transitionDuration: `${duration}ms` }} />
      <span className={cn("w-full h-[2px] bg-current transition-opacity ease-out", open ? "opacity-0" : "")} style={{ transitionDuration: `${duration}ms` }} />
      <span className={cn("w-full h-[2px] bg-current transition-transform ease-out", open ? "-rotate-45 absolute" : "")} style={{ transitionDuration: `${duration}ms` }} />
    </div>
  );
}
