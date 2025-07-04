import React, { useState } from 'react';
import { FileText, Image, ExternalLink, Check, Folder, Trash2, Edit, X, Plus } from 'lucide-react';
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

interface FileItem {
  _id: string;
  name: string;
  type: 'PDF' | 'Image' | 'Link';
  folder?: string;
  tags: string[];
  isRead: boolean;
  uploadDate: string;
  url?: string;
}

interface FileGridProps {
  files: FileItem[];
  onToggleRead: (id: string) => void;
  onPreview: (file: FileItem) => void;
  onDelete: (id: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
}

const FileGrid = ({ files, onToggleRead, onPreview, onDelete, onUpdateTags }: FileGridProps) => {
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
    if (newTag.trim() && !tempTags.includes(newTag.trim())) {
      setTempTags([...tempTags, newTag.trim()]);
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
            file.isRead ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            {getFileIcon(file.type)}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={file.isRead}
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

          <div className="mb-3">
            {editingTags === file._id ? (
              <div className="space-y-2">
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
            ) : (
              <div className="flex items-center gap-1 flex-wrap">
                {file.tags.map((tag) => (
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
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(file.uploadDate).toLocaleDateString()}
            </span>
            <Button size="sm" onClick={() => onPreview(file)}>
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

interface FileUploadProps {
  onFileUpload: (fileOrUrl: File | string, metadata: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [type, setType] = useState<'PDF' | 'Image' | 'Link'>('PDF');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setType('PDF');
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onFileUpload(file, {
        name: name || file.name,
        type: 'PDF',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
    } else if (url) {
      onFileUpload(url, {
        name: name || url,
        type: 'Link',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        url,
      });
    }
    setFile(null);
    setUrl('');
    setName('');
    setTags('');
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-4">
      <div>
        <label className="block mb-1 font-medium">Upload File (PDF/Image)</label>
        <Input type="file" accept="application/pdf,image/*" onChange={handleFileChange} />
      </div>
      <div className="text-center text-gray-400">or</div>
      <div>
        <label className="block mb-1 font-medium">Add Link</label>
        <Input type="url" placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} />
      </div>
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <Input type="text" placeholder="File or Link Name" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="block mb-1 font-medium">Tags (comma separated)</label>
        <Input type="text" placeholder="tag1, tag2" value={tags} onChange={e => setTags(e.target.value)} />
      </div>
      <Button type="submit">Upload</Button>
    </form>
  );
};

export default FileUpload;
