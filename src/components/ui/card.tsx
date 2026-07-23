import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardLinkProps {
  href: string;
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
}

export function CardLink({ href, title, description, icon, className }: CardLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "surface flex flex-col gap-3 rounded-[var(--radius-card)] p-6 transition-shadow hover:shadow-md",
        className
      )}
    >
      {icon && (
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-primary-700">
          {icon}
        </span>
      )}
      <h3 className="text-lg font-semibold text-primary-900">{title}</h3>
      <p className="text-sm text-primary-600">{description}</p>
    </Link>
  );
}
