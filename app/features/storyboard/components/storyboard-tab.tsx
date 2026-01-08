"use client";

import React from "react";
import { StoryboardHeader } from "./storyboard-header";
import { GridView } from "./grid-view";
import { ListView } from "./list-view";
import { SlideshowView } from "./slideshow-view";
import { useStoryboardTabState } from "@/app/features/storyboard/hooks/use-storyboard-tab-state";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/utils";
import { LoadingMessages } from "@/app/features/shared/components/ui/loading-messages";

export const StoryboardTab = React.memo(function StoryboardTab() {
    const {
        scenario,
        errorMessage,
        isVideoLoading,
        generatingScenes,
        viewMode,
        setViewMode,
        displayMode,
        setDisplayMode,
        dragOverIndex,
        isAnySceneGenerating,
        // Actions
        handleRegenerateImage,
        handleGenerateAllVideos,
        handleGenerateVideo,
        handleUpdateScene,
        handleUploadImage,
        handleAddScene,
        handleRemoveScene,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDrop,
    } = useStoryboardTabState();

    if (!scenario) return null;

    const renderScenes = () => {
        const commonProps = {
            scenes: scenario.scenes,
            scenario,
            displayMode,
            generatingScenes,
            dragOverIndex,
            onUpdateScene: handleUpdateScene,
            onRegenerateImage: handleRegenerateImage,
            onGenerateVideo: handleGenerateVideo,
            onUploadImage: handleUploadImage,
            onRemoveScene: handleRemoveScene,
            onAddScene: handleAddScene,
            onDragStart: handleDragStart,
            onDragEnd: handleDragEnd,
            onDragOver: handleDragOver,
            onDrop: handleDrop,
        };

        switch (viewMode) {
            case "grid":
                return <GridView {...commonProps} />;
            case "list":
                return <ListView {...commonProps} />;
            case "slideshow":
                return (
                    <SlideshowView
                        scenes={scenario.scenes}
                        scenario={scenario}
                        displayMode={displayMode}
                        onAddScene={handleAddScene}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative mx-auto max-w-5xl">
            <div
                className={cn(
                    "space-y-8 pb-10 transition-all duration-500",
                    isVideoLoading &&
                        "pointer-events-none opacity-40 blur-[2px]",
                )}
            >
                <StoryboardHeader
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    displayMode={displayMode}
                    setDisplayMode={setDisplayMode}
                    isVideoLoading={isVideoLoading}
                    onGenerateAllVideos={() => handleGenerateAllVideos()}
                    hasScenes={scenario.scenes.length > 0}
                    isAnySceneGenerating={isAnySceneGenerating}
                />

                {renderScenes()}

                {errorMessage && (
                    <div className="mt-4 rounded border border-red-400 bg-red-100 p-4 whitespace-pre-wrap text-red-700">
                        {errorMessage}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isVideoLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px]"
                    >
                        <div className="bg-background/95 border-border/50 flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border p-12 shadow-2xl backdrop-blur-md">
                            <div className="relative">
                                <Loader2 className="text-primary h-12 w-12 animate-spin" />
                                <div className="bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-xl" />
                            </div>
                            <div className="space-y-4 text-center">
                                <h3 className="text-xl font-semibold tracking-tight">
                                    Bringing it to life
                                </h3>
                                <LoadingMessages
                                    isLoading={isVideoLoading}
                                    phase="video"
                                    className="h-auto justify-center"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
