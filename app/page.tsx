import { Toolbox } from "@/features/toolbox/components/Toolbox";
import { Workspace } from "@/features/workspace/components/Workspace";
import { LayerPanel } from "@/features/workspace/components/LayerPanel";
import { PromptBar } from "@/features/workspace/components/PromptBar";

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* 3-column main area: Left Sidebar | Center Workspace | Right Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — Toolbox + Prompt History */}
        <Toolbox />

        {/* Center — TopNav + Canvas + Split Button */}
        <Workspace />

        {/* Right Sidebar — Layer Panel */}
        <LayerPanel />
      </div>

      {/* Bottom Bar — Prompt Input */}
      <PromptBar />
    </div>
  );
}
