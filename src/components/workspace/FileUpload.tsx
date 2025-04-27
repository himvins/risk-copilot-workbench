
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Paperclip, Upload, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 transition-colors",
        isDragging ? "border-primary bg-primary/10" : "border-border"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <Upload className="h-8 w-8 text-muted-foreground/60" />
        <p>Drag and drop a file here, or</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={open}
        >
          <Paperclip size={16} />
          Browse files
        </Button>
      </div>
    </div>
  );
}
