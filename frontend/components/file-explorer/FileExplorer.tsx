"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getRequestSingle } from "@/app/api/serverRequests/methods";
import { UserView } from "../../models/user";
import { FileTreeItem, FileNode } from "./FileTreeItem";
import CollaborationExplorer from "./CollaborationExplorer";

export default function FileExplorer({ onSelectFile }: { onSelectFile?: (id: string) => void }) {
  const [root, setRoot] = useState<FileNode | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      UserView.getInstance().fillFromSession(session.user);

      const fetchRoot = async () => {
        const userId = UserView.getInstance().id;
        const res = await getRequestSingle(`directories/${userId}/root`);
        if (!res.ok) return;

        const payload = await res.json();
        const raw = payload?.data ?? payload;
        const rootDir = Array.isArray(raw) ? raw[0] : raw;

        if (!rootDir?._id) return;

        setRoot({ id: rootDir._id, name: rootDir.name, type: "folder" });
      };

      fetchRoot();
    }
  }, [status, session]);

  if (status === "loading") return <p>Loading session...</p>;
  if (!session) return <p>No session, user is not logged in.</p>;
  if (!root) return <p>Loading root directory...</p>;

  return (
    <div className="w-full h-full text-[13px] overflow-y-auto p-3 custom-scrollbar">
      <div className="mb-2 px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Workspace</div>
      <FileTreeItem node={root} onSelectFile={onSelectFile} />

      <div className="mt-5 pt-4 border-t border-slate-800">
        <CollaborationExplorer onSelectFile={onSelectFile} />
      </div>
    </div>
  );
}