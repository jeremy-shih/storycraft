"use client";

import { RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/app/features/shared/hooks/use-file-upload";

interface ScenarioImageActionsProps {
    onRegenerate: () => void;
    onUpload: (file: File) => void;
    isLoading: boolean;
}

export function ScenarioImageActions({
    onRegenerate,
    onUpload,
    isLoading,
}: ScenarioImageActionsProps) {
    const { fileInputRef, handleUploadClick, handleFileChange, accept } =
        useFileUpload({
            onFileSelect: onUpload,
        });

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={onRegenerate}
                disabled={isLoading}
                className="flex items-center gap-2"
            >
                <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Regenerate
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={isLoading}
                className="flex items-center gap-2"
            >
                <Upload className="h-4 w-4" />
                Upload
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept}
                className="hidden"
            />
        </div>
    );
}
