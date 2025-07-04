import React, { useState, useEffect } from 'react';
import PasswordLogin from '@/components/PasswordLogin';
import FileUpload from '@/components/FileUpload';
import FileGrid from '@/components/FileGrid';
import FilePreview from '@/components/FilePreview';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, LogOut, Plus, Folder as FolderIcon, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
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
  read: boolean;
  uploadedAt: string;
  url?: string;
  uploadDate?: string;
}

interface FolderItem {
  _id: string;
  name: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  useEffect(() => {
    const authStatus = localStorage.getItem('fileVaultAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchFilesFromBackend();
      fetchFoldersFromBackend();
    }
  }, []);

  const fetchFilesFromBackend = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/files');
      const filesWithDate = response.data.map((file: any) => ({
        ...file,
        uploadDate: file.uploadedAt,
        tags: Array.isArray(file.tags) ? file.tags : [],
      }));
      setFiles(filesWithDate);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchFoldersFromBackend = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/files/folders');
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchFilesFromBackend();
  };

  const handleLogout = () => {
    localStorage.removeItem('fileVaultAuth');
    setIsAuthenticated(false);
  };

  const handleFileUpload = async (fileOrUrl: File | string, metadata: any) => {
    try {
      const formData = new FormData();
      formData.append('metadata', JSON.stringify(metadata));

      if (fileOrUrl instanceof File) {
        formData.append('file', fileOrUrl);
        await axios.post('http://localhost:5000/api/files/upload', formData);
      } else {
        await axios.post('http://localhost:5000/api/files/upload', {
          ...metadata,
          url: fileOrUrl,
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      fetchFilesFromBackend();
      setShowUpload(false);
      toast({ title: 'Success', description: 'File uploaded successfully!' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload Failed', description: 'There was an error uploading the file.', variant: 'destructive' });
    }
  };

  const handleToggleRead = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/api/files/${id}/toggle-read`);
      fetchFilesFromBackend();
    } catch (error) {
      console.error('Error toggling read status:', error);
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/files/${id}`);
      fetchFilesFromBackend();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleUpdateTags = async (id: string, newTags: string[]) => {
    try {
      await axios.put(`http://localhost:5000/api/files/${id}/tags`, { tags: newTags });
      await fetchFilesFromBackend();
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  const handlePreview = (file: FileItem) => {
    setSelectedFile(file);
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && !folders.some(f => f.name === folderName)) {
      try {
        await axios.post('http://localhost:5000/api/files/folders', { name: folderName });
        fetchFoldersFromBackend();
        toast({ title: 'Folder Created', description: `Folder '${folderName}' created successfully!` });
      } catch (error) {
        toast({ title: 'Create Failed', description: 'Could not create folder', variant: 'destructive' });
      }
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/files/folders/${folderId}`);
      fetchFoldersFromBackend();
      toast({ title: 'Folder Deleted', description: `Folder '${folderName}' deleted successfully!` });
      if (selectedFolder === folderName) setSelectedFolder('');
    } catch (error) {
      toast({ title: 'Delete Failed', description: 'Could not delete folder', variant: 'destructive' });
    }
  };

  const handleMoveToFolder = async (fileId: string, folder: string) => {
    try {
      await axios.put(`http://localhost:5000/api/files/${fileId}/folder`, { folder });
      fetchFilesFromBackend();
      toast({ title: 'File Moved', description: `File moved to folder '${folder}'` });
    } catch (error) {
      toast({ title: 'Move Failed', description: 'Could not move file to folder', variant: 'destructive' });
    }
  };

  const filteredFiles = files.filter(file =>
    (selectedFolder ? file.folder === selectedFolder : true) &&
    (file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  if (!isAuthenticated) {
    return <PasswordLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="https://zapsas.life/logo.png" alt="Logo" style={{ height: 36, marginRight: 12 }} />
              <h1 className="text-xl font-semibold text-gray-900">File Vault</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleCreateFolder} variant="outline" size="sm">
                + New Folder
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search files and tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowUpload(!showUpload)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Files
            </Button>
          </div>

          {showUpload && (
            <div className="mb-6 p-4 bg-white rounded-lg border">
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          )}
        </div>

        {/* Folder cards */}
        {folders.length > 0 && (
          <div className="flex gap-2 mb-6">
            <div
              className={`cursor-pointer px-4 py-2 rounded border ${selectedFolder === '' ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-300'}`}
              onClick={() => setSelectedFolder('')}
            >
              All Files
            </div>
            {folders.map(folder => (
              <div
                key={folder._id}
                className={`flex items-center cursor-pointer px-4 py-2 rounded border ${selectedFolder === folder.name ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-300'}`}
                onClick={() => setSelectedFolder(folder.name)}
              >
                <FolderIcon className="h-6 w-6 mr-2 text-blue-500" />
                <span className="font-medium mr-2">{folder.name}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={e => e.stopPropagation()}
                      title="Delete folder"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the folder "{folder.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteFolder(folder._id, folder.name)} className="bg-red-500 hover:bg-red-600">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No files uploaded yet</p>
            <Button onClick={() => setShowUpload(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First File
            </Button>
          </div>
        ) : (
          <FileGrid
            files={filteredFiles}
            onToggleRead={handleToggleRead}
            onPreview={handlePreview}
            onDelete={handleDeleteFile}
            onUpdateTags={handleUpdateTags}
            folders={folders.map(f => f.name)}
            onMoveToFolder={handleMoveToFolder}
          />
        )}

        <FilePreview
          file={selectedFile}
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      </main>
    </div>
  );
};

export default Index;