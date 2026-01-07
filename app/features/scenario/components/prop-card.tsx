"use client";

import { memo, useCallback } from "react";
import { EntityCard } from "./entity-card";
import { Prop } from "@/app/types";

interface PropCardProps {
    prop: Prop;
    index: number;
    isLoading: boolean;
    isDeleting: boolean;
    onUpdate: (
        index: number,
        updatedProp: Prop,
        updateScenarioText?: boolean,
    ) => void;
    onRemove: (index: number) => void;
    onRegenerateImage: (
        index: number,
        name: string,
        description: string,
    ) => Promise<Partial<Prop> | void>;
    onUploadImage: (index: number, file: File) => Promise<Partial<Prop> | void>;
    isInitiallyEditing?: boolean;
}

export const PropCard = memo(function PropCard({
    prop,
    index,
    isLoading,
    isDeleting,
    onUpdate,
    onRemove,
    onRegenerateImage,
    onUploadImage,
    isInitiallyEditing = false,
}: PropCardProps) {
    const handleRegenerate = useCallback(
        (idx: number, p: Prop) => {
            return onRegenerateImage(idx, p.name, p.description);
        },
        [onRegenerateImage],
    );

    return (
        <EntityCard
            entity={prop}
            index={index}
            title="Prop"
            entityType="prop"
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
