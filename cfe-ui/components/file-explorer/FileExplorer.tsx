"use client";

import { Trash2, FilePlus, FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Folder, FolderOpen, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import { getRequestSingle, postRequest, putRequest, deleteRequest } from "../../src/app/api/serverRequests/methods";
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


function FileItem({ node, onRefresh }: FileItemProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<FileNode[] | null>(null);

  const isDirectory = node.type === "folder";

  const fetchChildren = async (dirId: string = node.id) => {
    const res = await getRequestSingle(`directories/${dirId}/children&files`);
    if (res.ok) {
      const payload: any = await res.json();
      const raw = payload?.data ?? payload;

      const data = (Array.isArray(raw) ? raw[0] : raw) as FolderResponse | null;

      if (!data) return;
      const folders = (data.children || []).map((child) => ({ id: child._id, name: child.name, type: "folder" as const , parent_id: dirId }));
      const files = (data.files || []).map((file) => ({ id: file._id, name: file.name, type: "file" as const, parent_id: dirId }));
      setItems([...folders, ...files]);
    }
  };

  const handleToggle = async () => {
    if (!open && isDirectory && !items) await fetchChildren();
    setOpen(!open);
  };

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
        ? `directory/${node.id}/delete`
        : `file/${node.id}/delete`;

    const res = await deleteRequest(endpoint);
    if (res.ok && onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="pl-2">
      <div className="flex items-center gap-2 py-1 hover:bg-blue-400 rounded cursor-pointer justify-between">
        <div className="flex items-center gap-2" onClick={handleToggle}>
          {isDirectory ? (open ? <FolderOpen size={16} /> : <Folder size={16} />) : <FileText size={16} />}
          {node.name}
        </div>

        <div className="flex gap-2 pr-2">
          {isDirectory && <FolderPlus size={16} onClick={handleAddFolder} className="hover:text-green-500 cursor-pointer" />}
          {isDirectory && <FilePlus size={16} onClick={handleAddFile} className="hover:text-blue-500 cursor-pointer" />}
          <Trash2 size={16} onClick={handleDelete} className="hover:text-red-500 cursor-pointer" />
        </div>
      </div>

      {open && items && (
        <div className="pl-4">
          {items.map((child) => (
            <FileItem key={child.id} node={child} onRefresh={fetchChildren} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer() {
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
    <div className="w-full h-full text-sm font-mono overflow-y-auto p-2">
      <FileItem node={root} />
    </div>
  );
}