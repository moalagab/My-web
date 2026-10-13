import type { RefObject } from "react";
import { Link } from "react-router";
import { ArrowUpRight, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteSettings } from "@/lib/site-content";
import type { SystemDictionary } from "@/lib/dictionary";

type MobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: { label: string; path: string }[];
  to: (path?: string) => string;
  d: SystemDictionary;
  isRtl: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

/** Loaded on first open so the dialog code stays out of the initial bundle. */
export default function MobileMenu({ open, onOpenChange, items, to, d, isRtl, triggerRef }: MobileMenuProps) {
  const close = () => onOpenChange(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="studio-mobile-menu"
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
        aria-describedby={undefined}
      >
        <DialogTitle className="studio-eyebrow">{d.navigation.label}</DialogTitle>
        <DialogClose asChild>
          <button className="mobile-close" aria-label={d.navigation.closeMenu}>
            <X size={24} />
          </button>
        </DialogClose>
        <div className="mobile-menu-links">
          {items.map((i, n) => (
            <Link key={i.path} to={to(i.path)} onClick={close}>
              <small dir="ltr">0{n + 1}</small>
              {i.label}
              <ArrowUpRight className={isRtl ? "-scale-x-100" : ""} />
            </Link>
          ))}
        </div>
        <Link to={to("/start")} onClick={close} className="studio-button">
          {d.navigation.start}
          <ArrowUpRight size={19} />
        </Link>
        <a href={`mailto:${siteSettings.email}`} className="mobile-menu-email">
          {siteSettings.email}
        </a>
      </DialogContent>
    </Dialog>
  );
}
