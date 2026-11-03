import type { ReactNode } from "react";
import { Link, useViewTransitionState } from "react-router";

/**
 * A project's cover link. While the browser moves to that project, the cover
 * carries the shared transition name, so it grows into the case-study hero.
 */
export default function ProjectMediaLink({ to, className, children }: { to: string; className: string; children: ReactNode }) {
  const moving = useViewTransitionState(to);
  return (
    <Link
      to={to}
      viewTransition
      className={className}
      tabIndex={-1}
      aria-hidden="true"
      style={moving ? { viewTransitionName: "project-cover" } : undefined}
    >
      {children}
    </Link>
  );
}
