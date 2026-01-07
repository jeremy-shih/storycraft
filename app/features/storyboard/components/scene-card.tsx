"use client";

import { Button } from "@/components/ui/button";
import {
    Loader2,
    Pencil,
    RefreshCw,
    Upload,
    Video,
    Trash2,
    GripVertical,
    MessageCircle,
} from "lucide-react";
import { useRef, useState, memo } from "react";
import { Scene, Scenario } from "@/app/types";
import { EditSceneModal } from "./edit-scene-modal";
import { ConversationalEditModal } from "./conversational-edit-modal";
import { VideoPlayer } from "@/app/features/editor/components/video-player";
import { GcsImage } from "@/app/features/shared/components/ui/gcs-image";
import { cn } from "@/lib/utils/utils";

interface SceneCardProps {
    scene: Scene;
    sceneNumber: number;
    scenario: Scenario;
    onUpdate: (updatedScene: Scene) => void;
    onRegenerateImage: () => void;
    onGenerateVideo: () => void;
    onUploadImage: (file: File) => void;
    onRemoveScene: () => void;
    isGenerating: boolean;
    canDelete: boolean;
    displayMode?: "image" | "video";
    hideControls?: boolean;
    isDragOver?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
}

export const SceneCard = memo(function SceneCard({
    scene,
    sceneNumber,
    scenario,
    onUpdate,
    onRegenerateImage,
    onGenerateVideo,
    onUploadImage,
    onRemoveScene,
    isGenerating,
    canDelete,
    displayMode = "image",
    hideControls = false,
    isDragOver = false,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
}: SceneCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConversationalEditOpen, setIsConversationalEditOpen] =
        useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUploadImage(file);
        }
    };

    return (
        <div
            className={cn(
                "group border-border/10 bg-card relative rounded-[20px] border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
                isDragOver && "bg-primary/5 ring-primary ring-2",
            )}
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {/* Helper for Dragging - only visible on hover */}
            {!hideControls && (
                <div className="absolute top-3 left-3 z-20 opacity-0 transition-opacity group-hover:opacity-100">
                    <div
                        className="hover:bg-primary/80 cursor-grab rounded-full bg-black/40 p-2 text-white backdrop-blur-md active:cursor-grabbing"
                        title="Drag to reorder"
                        onMouseDown={(e) => e.stopPropagation()}
                        role="button"
                        tabIndex={0}
                        aria-label="Drag to reorder"
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>
                </div>
            )}

            {/* Media Area */}
            <div className="bg-muted/20 relative aspect-[16/9] w-full overflow-hidden rounded-t-[20px]">
                {isGenerating && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                )}

                {displayMode === "video" && scene.videoUri ? (
                    <VideoPlayer
                        videoGcsUri={scene.videoUri}
                        aspectRatio={scenario.aspectRatio}
                    />
                ) : (
                    <GcsImage
                        gcsUri={scene.imageGcsUri || null}
                        alt={scene.description || `Scene ${sceneNumber}`}
                        className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                )}

                {/* Overlay Actions */}
                {!hideControls && (
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <div className="flex gap-2">
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 rounded-full border-0 bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-black"
                                onClick={onRegenerateImage}
                                disabled={isGenerating}
                                title="Regenerate Image"
                                aria-label="Regenerate Image"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 rounded-full border-0 bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-black"
                                onClick={handleUploadClick}
                                disabled={isGenerating}
                                title="Upload Image"
                                aria-label="Upload Image"
                            >
                                <Upload className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 rounded-full border-0 bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-black"
                                onClick={() =>
                                    setIsConversationalEditOpen(true)
                                }
                                disabled={isGenerating}
                                title="Magic Edit"
                                aria-label="Magic Edit"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                size="icon"
                                variant="secondary"
                                className="bg-primary/80 hover:bg-primary h-8 w-8 rounded-full border-0 text-white shadow-sm"
                                onClick={onGenerateVideo}
                                disabled={isGenerating}
                                title="Generate Video"
                                aria-label="Generate Video"
                            >
                                <Video className="h-3.5 w-3.5" />
                            </Button>
                            {canDelete && (
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8 rounded-full border-0 bg-red-500/80 text-white hover:bg-red-600"
                                    onClick={onRemoveScene}
                                    disabled={isGenerating}
                                    title="Delete Scene"
                                    aria-label="Delete Scene"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            {/* Content Area */}
            <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                    <span className="bg-secondary/30 text-foreground text-secondary-foreground rounded-full px-3 py-1 text-sm font-bold">
                        Scene {sceneNumber}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-muted-foreground hover:bg-primary/5 hover:text-primary rounded-full px-3"
                    >
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                    </Button>
                </div>

                {scene.errorMessage && (
                    <div className="mb-3 rounded-lg border border-red-100 bg-red-50 p-2 text-xs text-red-600">
                        {scene.errorMessage}
                    </div>
                )}

                <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                    {scene.description}
                </p>
            </div>

            <EditSceneModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                scene={scene}
                sceneNumber={sceneNumber}
                scenario={scenario}
                onUpdate={onUpdate}
                displayMode={displayMode}
            />
            <ConversationalEditModal
                isOpen={isConversationalEditOpen}
                onClose={() => setIsConversationalEditOpen(false)}
                scene={scene}
                sceneNumber={sceneNumber}
                scenario={scenario}
                onUpdate={onUpdate}
            />
        </div>
    );
});
