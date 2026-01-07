"use client";

import { memo, useCallback } from "react";
import { EntityCard } from "./entity-card";
import { Setting } from "@/app/types";

interface SettingCardProps {
    setting: Setting;
    index: number;
    isLoading: boolean;
    isDeleting: boolean;
    onUpdate: (
        index: number,
        updatedSetting: Setting,
        updateScenarioText?: boolean,
    ) => void;
    onRemove: (index: number) => void;
    onRegenerateImage: (
        index: number,
        name: string,
        description: string,
    ) => Promise<Partial<Setting> | void>;
    onUploadImage: (
        index: number,
        file: File,
    ) => Promise<Partial<Setting> | void>;
    isInitiallyEditing?: boolean;
}

export const SettingCard = memo(function SettingCard({
    setting,
    index,
    isLoading,
    isDeleting,
    onUpdate,
    onRemove,
    onRegenerateImage,
    onUploadImage,
    isInitiallyEditing = false,
}: SettingCardProps) {
    const handleRegenerate = useCallback(
        (idx: number, s: Setting) => {
            return onRegenerateImage(idx, s.name, s.description);
        },
        [onRegenerateImage],
    );

    return (
        <EntityCard
            entity={setting}
            index={index}
            title="Setting"
            entityType="setting"
            isLoading={isLoading}
            isDeleting={isDeleting}
            onUpdate={onUpdate}
            onRemove={onRemove}
            onRegenerateImage={handleRegenerate}
            onUploadImage={onUploadImage}
            isInitiallyEditing={isInitiallyEditing}
        />
    );
});
