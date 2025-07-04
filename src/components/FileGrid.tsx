import React, { useState } from 'react';
import {
  FileText,
  Image,
  ExternalLink,
  Check,
  Folder,
  Trash2,
  Edit,
  X,
  Plus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

const BACKEND_URL = 'http://localhost:5000';

export interface FileItem {
  _id: string;
  name: string;
  type: 'PDF' | 'Image' | 'Link';
  folder?: string;
  tags: string[];
  read: boolean;
  uploadedAt?: string;
  uploadDate?: string;
  url?: string;
}

interface FileGridProps {
  files: FileItem[];
  onToggleRead: (id: string) => void;
  onPreview: (file: FileItem) => void;
  onDelete: (id: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  folders?: string[];
  onMoveToFolder?: (fileId: string, folder: string) => void;
}

const FileGrid = ({ files, onToggleRead, onPreview, onDelete, onUpdateTags, folders = [], onMoveToFolder }: FileGridProps) => {
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [tempTags, setTempTags] = useState<string[]>([]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'Image':
        return <Image className="h-8 w-8 text-green-500" />;
      case 'Link':
        return <ExternalLink className="h-8 w-8 text-blue-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const startEditingTags = (file: FileItem) => {
    setEditingTags(file._id);
    setTempTags([...file.tags]);
    setNewTag('');
  };

  const saveTagChanges = (fileId: string) => {
    onUpdateTags(fileId, tempTags);
    setEditingTags(null);
    setTempTags([]);
  };

  const cancelTagEdit = () => {
    setEditingTags(null);
    setTempTags([]);
    setNewTag('');
  };

  const addNewTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tempTags.includes(trimmed)) {
      setTempTags([...tempTags, trimmed]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTempTags(tempTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <div
          key={file._id}
          className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
            file.read ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            {getFileIcon(file.type)}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={file.read}
                onCheckedChange={() => onToggleRead(file._id)}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete File</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{file.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(file._id)} className="bg-red-500 hover:bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <h3 className="font-medium text-sm mb-2 line-clamp-2">{file.name}</h3>

          {file.folder && (
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <Folder className="h-3 w-3 mr-1" />
              {file.folder}
            </div>
          )}

          {/* Always show tags as badges below the file name */}
          <div className="flex items-center gap-1 flex-wrap mb-3">
            {file.tags && file.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startEditingTags(file)}
              className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>

          {/* Tag editing UI, only shown when editingTags === file._id */}
          {editingTags === file._id && (
            <div className="space-y-2 mb-3">
              <div className="flex flex-wrap gap-1">
                {tempTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  className="h-6 text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && addNewTag()}
                />
                <Button size="sm" onClick={addNewTag} className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => saveTagChanges(file._id)} className="h-6 text-xs px-2">
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelTagEdit} className="h-6 text-xs px-2">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : ''}
            </span>
            <Button size="sm" onClick={() => {
              if ((file.type === 'PDF' || file.type === 'Image') && file.url) {
                const url = file.url.startsWith('http') ? file.url : `${BACKEND_URL}${file.url}`;
                window.open(url, '_blank');
              } else {
                onPreview(file);
              }
            }}>
              View
            </Button>
            {folders.length > 0 && onMoveToFolder && (
              <select
                className="ml-2 border rounded px-2 py-1 text-xs"
                value={file.folder || ''}
                onChange={e => onMoveToFolder(file._id, e.target.value)}
              >
                <option value="">Move to folder</option>
                {folders.map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileGrid;