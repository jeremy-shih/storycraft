"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import {
    Grid,
    List,
    Loader2,
    Presentation,
    Video,
    Image as ImageIcon,
} from "lucide-react";
import { LoadingMessages } from "@/app/features/shared/components/ui/loading-messages";

export type ViewMode = "grid" | "list" | "slideshow";
export type DisplayMode = "image" | "video";

interface StoryboardHeaderProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    displayMode: DisplayMode;
    setDisplayMode: (mode: DisplayMode) => void;
    isVideoLoading: boolean;
    onGenerateAllVideos: () => void;
    hasScenes: boolean;
    isAnySceneGenerating: boolean;
}

export const StoryboardHeader = memo(function StoryboardHeader({
    viewMode,
    setViewMode,
    displayMode,
    setDisplayMode,
    isVideoLoading,
    onGenerateAllVideos,
    hasScenes,
    isAnySceneGenerating,
}: StoryboardHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight">
                        Visualize your story
                    </h2>
                    <p className="text-muted-foreground">
                        Review scenes and generate the actual video clips.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <LoadingMessages
                        isLoading={isVideoLoading || isAnySceneGenerating}
                        phase="video"
                    />
                    <Button
                        size="lg"
                        onClick={onGenerateAllVideos}
                        disabled={
                            isVideoLoading || !hasScenes || isAnySceneGenerating
                        }
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-sm"
                    >
                        {isVideoLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Video className="mr-2 h-5 w-5" />
                                Generate Videos
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className={cn(
                            "hover:bg-accent hover:text-accent-foreground h-8 w-8 border-0",
                            viewMode === "grid" &&
                                "bg-accent text-accent-foreground",
                        )}
                        aria-label="Grid view"
                    >
                        <Grid className="h-4 w-4" />
                        <span className="sr-only">Grid view</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "hover:bg-accent hover:text-accent-foreground h-8 w-8 border-0",
                            viewMode === "list" &&
                                "bg-accent text-accent-foreground",
                        )}
                        aria-label="List view"
                    >
                        <List className="h-4 w-4" />
                        <span className="sr-only">List view</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setViewMode("slideshow")}
                        className={cn(
                            "hover:bg-accent hover:text-accent-foreground h-8 w-8 border-0",
                            viewMode === "slideshow" &&
                                "bg-accent text-accent-foreground",
                        )}
                        aria-label="Slideshow view"
                    >
                        <Presentation className="h-4 w-4" />
                        <span className="sr-only">Slideshow view</span>
                    </Button>
                </div>

                <div className="ml-2 flex items-center gap-2">
                    <ImageIcon className="text-muted-foreground h-4 w-4" />
                    <div
                        className="bg-muted relative h-5 w-8 cursor-pointer rounded-full"
                        onClick={() =>
                            setDisplayMode(
                                displayMode === "image" ? "video" : "image",
                            )
                        }
                    >
                        <div
                            className={cn(
                                "bg-primary absolute top-0.5 h-4 w-4 rounded-full transition-transform duration-200",
                                displayMode === "video"
                                    ? "translate-x-3.5"
                                    : "translate-x-0.5",
                            )}
                        />
                    </div>
                    <Video className="text-muted-foreground h-4 w-4" />
                </div>
            </div>
        </div>
    );
});
