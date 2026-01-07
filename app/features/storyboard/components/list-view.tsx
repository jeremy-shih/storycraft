"use client";

import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SceneData } from "./scene-data";
import { ImagePromptDisplay } from "./image-prompt-display";
import { VideoPromptDisplay } from "./video-prompt-display";
import { Scenario, Scene } from "@/app/types";
import { useState } from "react";

interface ListViewProps {
    scenes: Scene[];
    scenario: Scenario;
    displayMode: "image" | "video";
    generatingScenes: Set<number>;
    dragOverIndex: number | null;
    onUpdateScene: (index: number, updatedScene: Scene) => void;
    onRegenerateImage: (index: number) => void;
    onGenerateVideo: (index: number) => void;
    onUploadImage: (index: number, file: File) => void;
    onRemoveScene: (index: number) => void;
    onAddScene: () => void;
    onDragStart: (index: number) => (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onDragOver: (index: number) => (e: React.DragEvent) => void;
    onDrop: (index: number) => (e: React.DragEvent) => void;
}

export function ListView({
    scenes,
    scenario,
    displayMode,
    generatingScenes,
    dragOverIndex,
    onUpdateScene,
    onRegenerateImage,
    onGenerateVideo,
    onUploadImage,
    onRemoveScene,
    onAddScene,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
}: ListViewProps) {
    const [activeTabs, setActiveTabs] = useState<{ [key: number]: string }>({});

    const setActiveTab = (sceneIndex: number, tab: string) => {
        setActiveTabs((prev) => ({
            ...prev,
            [sceneIndex]: tab,
        }));
    };

    const getActiveTab = (sceneIndex: number) => {
        return activeTabs[sceneIndex] || "general";
    };

    return (
        <div className="space-y-6">
            {scenes.map((scene, index) => (
                <div key={index} className="flex gap-6">
                    <div className="w-1/3">
                        <SceneData
                            sceneNumber={index + 1}
                            scene={scene}
                            scenario={scenario}
                            onUpdate={(updatedScene) =>
                                onUpdateScene(index, updatedScene)
                            }
                            onRegenerateImage={() => onRegenerateImage(index)}
                            onGenerateVideo={() => onGenerateVideo(index)}
                            onUploadImage={(file) => onUploadImage(index, file)}
                            onRemoveScene={() => onRemoveScene(index)}
                            isGenerating={generatingScenes.has(index)}
                            canDelete={scenes.length > 1}
                            displayMode={displayMode}
                            hideControls
                            isDragOver={dragOverIndex === index}
                            onDragStart={onDragStart(index)}
                            onDragEnd={onDragEnd}
                            onDragOver={onDragOver(index)}
                            onDrop={onDrop(index)}
                        />
                    </div>
                    <div className="w-2/3">
                        <div className="bg-card h-full rounded-lg border p-4">
                            <h3 className="text-card-foreground mb-4 font-semibold">
                                Scene {index + 1}
                            </h3>

                            {/* Tab Navigation */}
                            <div className="border-border mb-4 flex border-b">
                                {["general", "image", "video"].map((tab) => (
                                    <div
                                        key={tab}
                                        role="tab"
                                        tabIndex={0}
                                        onClick={() => setActiveTab(index, tab)}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                            ) {
                                                e.preventDefault();
                                                setActiveTab(index, tab);
                                            }
                                        }}
                                        className={`cursor-pointer border-b-2 px-3 py-2 text-sm font-medium capitalize transition-colors select-none ${
                                            getActiveTab(index) === tab
                                                ? "border-primary text-primary"
                                                : "text-muted-foreground hover:border-border hover:text-foreground border-transparent"
                                        }`}
                                    >
                                        {tab === "general"
                                            ? "General"
                                            : tab === "image"
                                              ? "Image Prompt"
                                              : "Video Prompt"}
                                    </div>
                                ))}
                            </div>

                            {/* Tab Content */}
                            {getActiveTab(index) === "general" && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-card-foreground mb-1 text-sm font-medium">
                                            Description
                                        </h4>
                                        <p className="text-card-foreground/80 text-sm whitespace-pre-wrap">
                                            {scene.description}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-card-foreground mb-1 text-sm font-medium">
                                            Voiceover
                                        </h4>
                                        <p className="text-card-foreground/80 text-sm whitespace-pre-wrap">
                                            {scene.voiceover}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {getActiveTab(index) === "image" && (
                                <div className="space-y-4">
                                    <ImagePromptDisplay
                                        imagePrompt={scene.imagePrompt}
                                    />
                                </div>
                            )}

                            {getActiveTab(index) === "video" && (
                                <div className="space-y-4">
                                    <VideoPromptDisplay
                                        videoPrompt={scene.videoPrompt}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {/* Add Scene Card */}
            <div className="flex gap-6">
                <div className="w-1/3">
                    <Card
                        className="hover:bg-accent/50 cursor-pointer overflow-hidden border-2 border-dashed transition-colors"
                        onClick={onAddScene}
                    >
                        <div className="flex h-full flex-col">
                            <div className="bg-muted/30 relative flex aspect-video w-full items-center justify-center overflow-hidden">
                                <div className="text-center">
                                    <Plus className="text-muted-foreground mx-auto mb-1 h-8 w-8" />
                                    <p className="text-muted-foreground text-xs">
                                        Add Scene
                                    </p>
                                </div>
                            </div>
                            <CardContent className="p-2">
                                <p className="text-muted-foreground text-center text-xs">
                                    New Scene
                                </p>
                            </CardContent>
                        </div>
                    </Card>
                </div>
                <div className="w-2/3">
                    <div className="bg-muted/30 flex h-full items-center justify-center rounded-lg border-2 border-dashed p-4">
                        <p className="text-muted-foreground text-sm">
                            Click to add a new scene
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
