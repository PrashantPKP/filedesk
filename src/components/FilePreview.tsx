import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileItem {
  _id: string;
  name: string;
  type: 'PDF' | 'Image' | 'Link';
  url?: string;
}

interface FilePreviewProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const FilePreview = ({ file, isOpen, onClose }: FilePreviewProps) => {
  if (!file) return null;

  const renderPreview = () => {
    if (file.type === 'Link') {
      return (
        <div className="text-center p-8">
          <ExternalLink className="mx-auto h-16 w-16 text-blue-500 mb-4" />
          <p className="text-gray-600 mb-4">External link</p>
          <Button
            onClick={() => window.open(file.url, '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open Link
          </Button>
        </div>
      );
    }

    if ((file.type === 'Image' || file.type === 'PDF') && file.url) {
      return (
        <div className="flex flex-col h-[80vh] items-center">
          {file.type === 'Image' ? (
            <>
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-[70vh] mx-auto mb-4"
              />
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = file.url!;
                  link.download = file.name;
                  link.click();
                }}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </>
          ) : (
            <>
              <div className="mb-4 flex justify-center">
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = file.url!;
                    link.download = file.name;
                    link.click();
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
              <iframe
                src={file.url}
                className="w-full flex-1 border-0"
                title={file.name}
              />
            </>
          )}
        </div>
      );
    }

    return <p className="text-center text-gray-500">Preview not available</p>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview;
