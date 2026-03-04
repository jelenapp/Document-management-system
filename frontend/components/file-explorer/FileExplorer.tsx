"use client";

import { Trash2, FilePlus, FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Folder, FolderOpen, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import { getRequestSingle, postRequest, deleteRequest } from "@/app/api/serverRequests/methods";
import { UserView } from "../../models/user";

// folder / file
// composite
// folder je composite, file je leaf
// FileNode je component
// Nije klasican composite, modifikovan je da bude prirodnije i prilagodjenije za React kompoziciju
interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";

  parent_id?: string;
}

interface FolderResponse {
  _id: string;
  name: string;
  children: Array<{ _id: string; name: string }>; // folderi
  files: Array<{ _id: string; name: string }>;    // fajlovi
}

interface FileItemProps {
  node: FileNode;
  onRefresh?: () => void;
}


function FileItem({ node, onRefresh, onSelectFile }: FileItemProps & { onSelectFile?: (id: string)=>void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<FileNode[] | null>(null);

  const isDirectory = node.type === "folder";

  const fetchChildren = async (dirId: string = node.id) => {
    const res = await getRequestSingle(`directories/${dirId}/children&files`);
    if (res.ok) {
      const payload = await res.json();
      const raw = payload?.data ?? payload;

      const data = (Array.isArray(raw) ? raw[0] : raw) as FolderResponse | null;

      if (!data) return;
      const folders = (data.children || []).map((child) => ({ id: child._id, name: child.name, type: "folder" as const , parent_id: dirId }));
      const files = (data.files || []).map((file) => ({ id: file._id, name: file.name, type: "file" as const, parent_id: dirId }));
      setItems([...folders, ...files]);
    }
  };

  const handleClick = async () => {
  if (node.type === "file") {
    onSelectFile?.(node.id);
    return;
  }
  // folder toggle
  if (!open && isDirectory && !items) await fetchChildren();
  setOpen(!open);
};

  // const handleToggle = async () => {
  //   if (!open && isDirectory && !items) await fetchChildren();
  //   setOpen(!open);
  // };

  const handleAddFile = async () => {
    const fileName = prompt("Enter file name:");
    if (!fileName) return;

    // ovo je put u bazu prepraviti!!!
    const res = await postRequest("files/create", {
      parent: node.id,
      owner: UserView.getInstance().id,
      name: fileName,
      collaborators: [],
    });
    if (res.ok) await fetchChildren(); // update UI
  };

  const handleAddFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;
    const res = await postRequest("directories/create", {
      name: folderName,
      owner: UserView.getInstance().id,
      parents: [node.id],
      children: [],
      files: [],
      collaborators: [],
    });
    if (res.ok) await fetchChildren(); // update UI
  };

  const handleDelete = async () => {
    const confirmDelete = confirm(`Are you sure you want to delete ${node.name}?`);
    if (!confirmDelete) return;
    const endpoint =
      node.type === "folder"
        ? `directories/${node.id}/delete`
        : `files/${node.id}/delete`;

    const res = await deleteRequest(endpoint);
    if (res.ok && onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="pl-1">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors group ${
          isDirectory ? 'hover:bg-slate-800' : 'hover:bg-blue-500/10'
        }`}
      >
        <div className="flex flex-1 items-center gap-2.5 min-w-0" onClick={handleClick}>
          <div className="text-slate-400 group-hover:text-blue-400 transition-colors">
            {isDirectory ? (
              open ? <FolderOpen size={16} fill="currentColor" className="fill-blue-500/20" /> : <Folder size={16} fill="currentColor" className="fill-slate-500/20" />
            ) : (
              <FileText size={16} />
            )}
          </div>
          <span 
            className="truncate text-slate-300 group-hover:text-white transition-colors"
            title={node.name}
          >
            {node.name}
          </span>
        </div>

        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isDirectory && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleAddFolder(); }}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-green-400 transition-colors"
              title="New Folder"
            >
              <FolderPlus size={14} />
            </button>
          )}
          {isDirectory && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleAddFile(); }}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors"
              title="New File"
            >
              <FilePlus size={14} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {open && items && (
        <div className="ml-3.5 pl-3 border-l border-slate-800 mt-0.5 space-y-0.5">
          {items.map((child) => (
            <FileItem key={child.id} node={child} onRefresh={fetchChildren} onSelectFile={onSelectFile} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({ onSelectFile }: { onSelectFile?: (id: string) => void }) {
  const [root, setRoot] = useState<FileNode | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      UserView.getInstance().fillFromSession(session.user);

      const fetchRoot = async () => {
        const userId = UserView.getInstance().id;
        const res = await getRequestSingle(`directories/${userId}/root`);

        if (res.ok) {
          const payload = await res.json();
          const raw = payload?.data ?? payload;

          // ako je niz, uzmi prvi element
          const rootDir = Array.isArray(raw) ? raw[0] : raw;

          if (!rootDir?._id) {
            console.log("Bad root payload:", payload);
            return;
          }

          setRoot({
            id: rootDir._id,
            name: rootDir.name,
            type: "folder",
          });
        }
      };

      fetchRoot();
    }
  }, [status, session]);

  if (status === "loading") return <p>Loading session...</p>;
  if (!session) return <p>No session, user is not logged in.</p>;
  if (!root) return <p>Loading root directory...</p>;

  return (
    <div className="w-full h-full text-[13px] overflow-y-auto p-3 custom-scrollbar">
      <div className="mb-2 px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        Workspace
      </div>
      <FileItem node={root} onSelectFile={onSelectFile} />
    </div>
  );
}