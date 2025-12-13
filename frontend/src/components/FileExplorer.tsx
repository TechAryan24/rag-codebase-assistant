import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileCode,
  FileText,
  File,
} from "lucide-react";

export interface FileNodeData {
  name: string;
  type: "folder" | "file";
  path?: string;
  children?: FileNodeData[];
}

interface FileExplorerProps {
  files: FileNodeData[];
}

const FileIcon = ({ name }: { name: string }) => {
  const ext = name.split(".").pop()?.toLowerCase();

  // STYLE FIX: Icons now adapt color intensity for Light/Dark backgrounds
  switch (ext) {
    case "tsx":
    case "ts":
      return <FileCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case "py":
      return (
        <FileCode className="w-4 h-4 text-yellow-600 dark:text-yellow-300" />
      );
    case "js":
    case "jsx":
      return (
        <FileCode className="w-4 h-4 text-yellow-500 dark:text-yellow-200" />
      );
    case "css":
    case "scss":
      return <FileCode className="w-4 h-4 text-cyan-600 dark:text-cyan-300" />;
    case "md":
      return <FileText className="w-4 h-4 text-gray-500 dark:text-zinc-400" />;
    case "json":
      return (
        <FileCode className="w-4 h-4 text-orange-600 dark:text-orange-400" />
      );
    case "html":
      return <FileCode className="w-4 h-4 text-red-600 dark:text-red-400" />;
    default:
      return <File className="w-4 h-4 text-gray-400 dark:text-zinc-500" />;
  }
};

const sortNodes = (nodes: FileNodeData[]) => {
  return [...nodes].sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === "folder" ? -1 : 1;
  });
};

const FileNode = ({ node, level }: { node: FileNodeData; level: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === "folder";
  const children = node.children ? sortNodes(node.children) : [];

  return (
    <div className="select-none text-sm">
      <div
        // STYLE FIX: Hover background visible on light mode
        className="flex items-center py-1 hover:bg-gray-200 dark:hover:bg-zinc-800/50 rounded-sm cursor-pointer transition-colors"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => isFolder && setIsOpen(!isOpen)}
      >
        <span className="mr-1 text-gray-400 dark:text-zinc-500 flex-shrink-0">
          {isFolder ? (
            isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4" />
          )}
        </span>

        <span className="mr-2 flex-shrink-0">
          {isFolder ? (
            <Folder
              className={`w-4 h-4 ${
                isOpen
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-zinc-500"
              }`}
            />
          ) : (
            <FileIcon name={node.name} />
          )}
        </span>

        {/* STYLE FIX: File names are dark gray in Light Mode */}
        <span
          className={`truncate ${
            isFolder
              ? "font-medium text-gray-800 dark:text-zinc-200"
              : "text-gray-600 dark:text-zinc-400"
          }`}
        >
          {node.name}
        </span>
      </div>

      {isFolder && isOpen && (
        <div>
          {children.map((child, idx) => (
            <FileNode
              key={`${child.path}-${idx}`}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = ({ files }: FileExplorerProps) => {
  if (!files || files.length === 0) {
    return (
      <div className="text-gray-500 dark:text-zinc-500 text-xs px-4 py-2 italic">
        No files loaded
      </div>
    );
  }

  const sortedFiles = sortNodes(files);

  return (
    <div className="space-y-0.5">
      {sortedFiles.map((node, idx) => (
        <FileNode key={`${node.path}-${idx}`} node={node} level={0} />
      ))}
    </div>
  );
};

export default FileExplorer;
