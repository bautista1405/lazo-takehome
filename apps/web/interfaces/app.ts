import type { ReactNode } from "react";
import type { SearchParams } from "../types/obligations";

export interface RootLayoutProps {
  children: ReactNode;
}

export interface HomePageProps {
  searchParams?: Promise<SearchParams>;
}

export interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}
