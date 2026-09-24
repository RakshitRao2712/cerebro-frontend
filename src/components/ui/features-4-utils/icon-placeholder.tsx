import * as LucideIcons from "lucide-react";
import React from "react";

export function IconPlaceholder({
  lucide,
  tabler,
  hugeicons,
  phosphor,
  remixicon,
  className,
  ...props
}: {
  lucide?: string;
  tabler?: string;
  hugeicons?: string;
  phosphor?: string;
  remixicon?: string;
  className?: string;
  [key: string]: any;
}) {
  if (lucide) {
    const Icon = (LucideIcons as any)[lucide];
    if (Icon) {
      return <Icon className={className} {...props} />;
    }
  }
  return <div className={className} {...props} />;
}
