// app/EditorPage.tsx
'use client';

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import FileExplorer from "./file-explorer/FileExplorer";
import CommentsPanel from "./CommentsPanel";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserView } from "../models/user";
import { useState } from "react";
import { PanelRightOpen, MessageSquare, LogOut } from "lucide-react";

export default function EditorPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [explorerWidth, setExplorerWidth] = useState(320);
  const [commentsWidth, setCommentsWidth] = useState(384);
  const [isResizingExplorer, setIsResizingExplorer] = useState(false);
  const [isResizingComments, setIsResizingComments] = useState(false);
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);

  const handleLogout = async (): Promise<void> => {
    UserView.getInstance().reset();
    await signOut({ redirect: false });
    router.push("/");
  };

  const resize = (e: React.MouseEvent) => {
    if (isResizingExplorer) {
      setExplorerWidth(Math.max(200, Math.min(600, e.clientX)));
    }
    if (isResizingComments) {
      const newWidth = window.innerWidth - e.clientX;
      setCommentsWidth(Math.max(250, Math.min(800, newWidth)));
    }
  };

  return (
      <div
          className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden select-none"
          onMouseMove={resize}
          onMouseUp={() => {
            setIsResizingExplorer(false);
            setIsResizingComments(false);
          }}
      >
        {/* LEFT SIDEBAR */}
        {!explorerCollapsed ? (
            <aside
                style={{ width: explorerWidth }}
                className="border-r border-slate-800 bg-slate-900/50 flex flex-col relative shrink-0"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h2 className="font-semibold text-slate-100 truncate">Fajlovi</h2>
                <button
                    onClick={() => setExplorerCollapsed(true)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400"
                >
                  <PanelRightOpen size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <FileExplorer onSelectFile={setSelectedFileId} />
              </div>

              <div className="p-4 border-t border-slate-800 space-y-2">
                <button
                    onClick={() => setShowComments((p) => !p)}
                    disabled={!selectedFileId}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
                >
                  Komentari
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                >
                  Odjavi se
                </button>
              </div>

              <div
                  onMouseDown={() => setIsResizingExplorer(true)}
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize"
              />
            </aside>
        ) : (
            /* COLLAPSED MINI PANEL */
            <aside className="w-16 border-r border-slate-800 bg-slate-900/80 flex flex-col items-center py-4 gap-4 shrink-0">

              <button
                  onClick={() => setExplorerCollapsed(false)}
                  className="p-2 hover:bg-slate-800 rounded text-slate-400"
                  title="Open Explorer"
              >
                <PanelRightOpen size={20} />
              </button>

              <button
                  onClick={() => setShowComments((p) => !p)}
                  disabled={!selectedFileId}
                  className="p-2 hover:bg-slate-800 rounded text-slate-400 disabled:opacity-40"
                  title="Comments"
              >
                <MessageSquare size={20} />
              </button>

              <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-slate-800 rounded text-red-400"
                  title="Logout"
              >
                <LogOut size={20} />
              </button>

            </aside>
        )}

        {/* MAIN EDITOR */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
          {selectedFileId ? (
              <SimpleEditor key={selectedFileId} fileId={selectedFileId} />
          ) : (
              <div className="flex-2 flex items-center justify-center text-slate-500">
                Izaberite fajl za uređivanje
              </div>
          )}
        </main>

        {/* COMMENTS PANEL */}
        {showComments && selectedFileId && (
            <aside
                style={{ width: commentsWidth }}
                className="border-l border-slate-800 bg-slate-900/50 flex flex-col relative shrink-0"
            >
              <div
                  onMouseDown={() => setIsResizingComments(true)}
                  className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize"
              />

              <div className="p-4 border-b border-slate-800 flex justify-between">
                <h2 className="font-semibold">Komentari</h2>
                <button onClick={() => setShowComments(false)}>✕</button>
              </div>

              <CommentsPanel fileId={selectedFileId} />
            </aside>
        )}
      </div>
  );
}