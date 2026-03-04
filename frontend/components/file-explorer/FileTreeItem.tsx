"use client";

import { useState } from "react";
import { Trash2, FilePlus, FolderPlus, Folder, FolderOpen, FileText } from "lucide-react";
import { getRequestSingle, postRequest, deleteRequest } from "@/app/api/serverRequests/methods";
import { UserView } from "../../models/user";

// folder / file
// composite
// folder je composite, file je leaf
// FileNode je component
// Nije klasican composite, modifikovan je da bude prirodnije i prilagodjenije za React kompoziciju

export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  parent_id?: string;
};

type FolderResponse = {
  _id: string;
  name: string;
  children?: Array<{ _id: string; name: string }>;
  files?: Array<{ _id: string; name: string }>;
};

type Props = {
  node: FileNode;
  onSelectFile?: (id: string) => void;
  onRefresh?: () => void | Promise<void>;
};

export function FileTreeItem({ node, onSelectFile, onRefresh }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<FileNode[] | null>(null);

  const isDirectory = node.type === "folder";

  const fetchChildren = async (dirId: string = node.id) => {
    const res = await getRequestSingle(`directories/${dirId}/children&files`);
    if (!res.ok) return;

    const payload = await res.json();
    const raw = payload?.data ?? payload;
    const data = (Array.isArray(raw) ? raw[0] : raw) as FolderResponse | null;
    if (!data) return;

    const folders: FileNode[] = (data.children || []).map((child) => ({
      id: child._id,
      name: child.name,
      type: "folder",
      parent_id: dirId,
    }));

    const files: FileNode[] = (data.files || []).map((file) => ({
      id: file._id,
      name: file.name,
      type: "file",
      parent_id: dirId,
    }));

    setItems([...folders, ...files]);
  };

  const handleClick = async () => {
    if (node.type === "file") {
      onSelectFile?.(node.id);
      return;
    }
    if (!open && isDirectory && !items) await fetchChildren();
    setOpen(!open);
  };

  const handleAddFile = async () => {
    if (!isDirectory) return;

    const fileName = prompt("Enter file name:");
    if (!fileName) return;

    const res = await postRequest("files/create", {
      parent: node.id,
      owner: UserView.getInstance().id,
      name: fileName,
      collaborators: [],
    });

    if (res.ok) await fetchChildren();
  };

  const handleAddFolder = async () => {
    if (!isDirectory) return;

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

    if (res.ok) await fetchChildren();
  };

  const handleDelete = async () => {
    const confirmDelete = confirm(`Are you sure you want to delete ${node.name}?`);
    if (!confirmDelete) return;

    const endpoint = node.type === "folder" ? `directories/${node.id}/delete` : `files/${node.id}/delete`;
    const res = await deleteRequest(endpoint);

    if (res.ok) await onRefresh?.();
  };

  return (
    <div className="pl-1">
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors group ${
          isDirectory ? "hover:bg-slate-800" : "hover:bg-blue-500/10"
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

          <span className="truncate text-slate-300 group-hover:text-white transition-colors" title={node.name}>
            {node.name}
          </span>
        </div>

        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isDirectory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddFolder();
              }}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-green-400 transition-colors"
              title="New Folder"
            >
              <FolderPlus size={14} />
            </button>
          )}

          {isDirectory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddFile();
              }}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors"
              title="New File"
            >
              <FilePlus size={14} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
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
            <FileTreeItem key={child.id} node={child} onRefresh={() => fetchChildren()} onSelectFile={onSelectFile} />
          ))}
        </div>
      )}
    </div>
  );
}