"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useScenarioTabState } from "@/app/features/scenario/hooks/use-scenario-tab-state";
import { ScenarioHeader } from "./scenario-header";
import { ScenarioDescriptionEditor } from "./scenario-description-editor";
import { CharacterCard } from "./character-card";
import { SettingCard } from "./setting-card";
import { PropCard } from "./prop-card";
import { MusicEditor } from "./music-editor";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/utils";
import { LoadingMessages } from "@/app/features/shared/components/ui/loading-messages";

export const ScenarioTab = React.memo(function ScenarioTab() {
    const {
        scenario,
        isGeneratingStoryboard,
        handleGenerateStoryBoard,
        handleUpdateScenarioDescription,
        handleUpdateMusic,
        // Characters
        characters,
        isCharacterLoading,
        isCharacterDeleting,
        handleUpdateCharacter,
        handleAddCharacter,
        handleRemoveCharacter,
        handleRegenerateCharacterImage,
        handleUploadCharacterImage,
        newCharacterIndex,
        // Settings
        settings,
        isSettingLoading,
        isSettingDeleting,
        handleUpdateSetting,
        handleAddSetting,
        handleRemoveSetting,
        handleRegenerateSettingImage,
        handleUploadSettingImage,
        newSettingIndex,
        // Props
        props,
        isPropLoading,
        isPropDeleting,
        handleUpdateProp,
        handleAddProp,
        handleRemoveProp,
        handleRegeneratePropImage,
        handleUploadPropImage,
        newPropIndex,
    } = useScenarioTabState();

    if (!scenario) return null;

    return (
        <div className="relative mx-auto max-w-5xl">
            <div
                className={cn(
                    "space-y-8 pb-10 transition-all duration-500",
                    isGeneratingStoryboard &&
                        "pointer-events-none opacity-40 blur-[2px]",
                )}
            >
                <ScenarioHeader
                    isLoading={isGeneratingStoryboard}
                    onGenerateStoryboard={() => handleGenerateStoryBoard()}
                />

                <div className="mx-auto max-w-4xl space-y-8">
                    <ScenarioDescriptionEditor
                        description={scenario.scenario}
                        onSave={handleUpdateScenarioDescription}
                    />

                    {/* Characters Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">Characters</h3>
                            <Button
                                onClick={handleAddCharacter}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Character
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {characters.map((character, index) => (
                                <CharacterCard
                                    key={`char-${index}`}
                                    character={character}
                                    index={index}
                                    isLoading={isCharacterLoading(index)}
                                    isDeleting={isCharacterDeleting(index)}
                                    onUpdate={handleUpdateCharacter}
                                    onRemove={handleRemoveCharacter}
                                    onRegenerateImage={
                                        handleRegenerateCharacterImage
                                    }
                                    onUploadImage={handleUploadCharacterImage}
                                    isInitiallyEditing={
                                        newCharacterIndex === index
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    {/* Props Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">Props</h3>
                            <Button
                                onClick={handleAddProp}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Prop
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {props.map((prop, index) => (
                                <PropCard
                                    key={`prop-${index}`}
                                    prop={prop}
                                    index={index}
                                    isLoading={isPropLoading(index)}
                                    isDeleting={isPropDeleting(index)}
                                    onUpdate={handleUpdateProp}
                                    onRemove={handleRemoveProp}
                                    onRegenerateImage={
                                        handleRegeneratePropImage
                                    }
                                    onUploadImage={handleUploadPropImage}
                                    isInitiallyEditing={newPropIndex === index}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">Settings</h3>
                            <Button
                                onClick={handleAddSetting}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Setting
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {settings.map((setting, index) => (
                                <SettingCard
                                    key={`setting-${index}`}
                                    setting={setting}
                                    index={index}
                                    isLoading={isSettingLoading(index)}
                                    isDeleting={isSettingDeleting(index)}
                                    onUpdate={handleUpdateSetting}
                                    onRemove={handleRemoveSetting}
                                    onRegenerateImage={
                                        handleRegenerateSettingImage
                                    }
                                    onUploadImage={handleUploadSettingImage}
                                    isInitiallyEditing={
                                        newSettingIndex === index
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    <MusicEditor
                        music={scenario.music}
                        onSave={handleUpdateMusic}
                    />
                </div>
            </div>

            <AnimatePresence>
                {isGeneratingStoryboard && (
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
                                    Visualizing your story
                                </h3>
                                <LoadingMessages
                                    isLoading={isGeneratingStoryboard}
                                    phase="storyboard"
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
