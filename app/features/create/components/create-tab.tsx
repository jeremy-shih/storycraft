"use client";

import React from "react";
import { useCreateTabState } from "../hooks/use-create-tab-state";
import { CreateHeader } from "./create-header";
import { StoryBasicsForm } from "./story-basics-form";
import { FormatSelector } from "./format-selector";
import { VideoConfigForm } from "./video-config-form";
import { VisualStyleSelector } from "./visual-style-selector";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/utils";
import { LoadingMessages } from "@/app/features/shared/components/ui/loading-messages";

export const CreateTab = React.memo(function CreateTab() {
    const {
        name,
        setName,
        pitch,
        setPitch,
        numScenes,
        setNumScenes,
        style,
        setStyle,
        aspectRatio,
        setAspectRatio,
        durationSeconds,
        setDurationSeconds,
        language,
        setLanguage,
        styleImageUri,
        setStyleImageUri,
        errorMessage,
        isLoading,
        totalLength,
        canGenerate,
        handleGenerateScenario,
    } = useCreateTabState();

    return (
        <div className="relative mx-auto max-w-5xl">
            <div
                className={cn(
                    "space-y-8 pb-10 transition-all duration-500",
                    isLoading && "pointer-events-none opacity-40 blur-[2px]",
                )}
            >
                <CreateHeader
                    isLoading={isLoading}
                    onGenerate={() => handleGenerateScenario()}
                    canGenerate={canGenerate}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <StoryBasicsForm
                        name={name}
                        setName={setName}
                        pitch={pitch}
                        setPitch={setPitch}
                        language={language}
                        setLanguage={setLanguage}
                    />

                    <div className="flex flex-col gap-6 md:col-span-3 lg:col-span-1">
                        <FormatSelector
                            aspectRatio={aspectRatio}
                            setAspectRatio={setAspectRatio}
                        />

                        <VideoConfigForm
                            numScenes={numScenes}
                            setNumScenes={setNumScenes}
                            durationSeconds={durationSeconds}
                            setDurationSeconds={setDurationSeconds}
                            totalLength={totalLength}
                        />
                    </div>
                </div>

                <VisualStyleSelector
                    style={style}
                    setStyle={setStyle}
                    styleImageUri={styleImageUri}
                    setStyleImageUri={setStyleImageUri}
                />

                {errorMessage && (
                    <div className="border-destructive/50 bg-destructive/10 text-destructive animate-in fade-in slide-in-from-top-4 mt-4 rounded-xl border p-6 shadow-sm">
                        {errorMessage}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isLoading && (
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
                                    Crafting your scenario
                                </h3>
                                <LoadingMessages
                                    isLoading={isLoading}
                                    phase="scenario"
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
