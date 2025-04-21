
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PersistenceControls } from "./PersistenceControls";

export function Header() {
  return (
    <header className="h-14 border-b px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium">
          Risk Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <PersistenceControls />
        <ThemeToggle />
      </div>
    </header>
  );
}
