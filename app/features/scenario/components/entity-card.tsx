"use client";

import { useCallback, memo, useState, ReactNode } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GcsImage } from "@/app/features/shared/components/ui/gcs-image";
import { Entity } from "@/app/types";
import { useScenarioItemEditor } from "../hooks/use-scenario-item-editor";
import { ScenarioImageActions } from "./scenario-image-actions";
import { ScenarioFormActions } from "./scenario-form-actions";
import { ScenarioUpdateConfirmationDialog } from "./scenario-update-confirmation-dialog";
import { ScenarioDeleteConfirmationDialog } from "./scenario-delete-confirmation-dialog";

interface EntityCardProps<T extends Entity> {
    entity: T;
    index: number;
    title: string;
    entityType: string;
    isLoading: boolean;
    isDeleting: boolean;
    onUpdate: (
        index: number,
        updatedEntity: T,
        updateScenarioText?: boolean,
    ) => void;
    onRemove: (index: number) => void;
    onRegenerateImage: (
        index: number,
        entity: T,
    ) => Promise<Partial<T> | void> | Partial<T> | void;
    onUploadImage: (
        index: number,
        file: File,
    ) => Promise<Partial<T> | void> | Partial<T> | void;
    isInitiallyEditing?: boolean;
    renderExtraFields?: (
        editedEntity: T,
        setEditedEntity: (entity: T) => void,
    ) => ReactNode;
    renderExtraDisplay?: (entity: T) => ReactNode;
}

export const EntityCard = memo(function EntityCard<T extends Entity>({
    entity,
    index,
    title,
    entityType,
    isLoading,
    isDeleting,
    onUpdate,
    onRemove,
    onRegenerateImage,
    onUploadImage,
    isInitiallyEditing = false,
    renderExtraFields,
    renderExtraDisplay,
}: EntityCardProps<T>) {
    const {
        isEditing,
        editedEntity,
        isSaving,
        enterEditMode,
        updateField,
        handleSave: executeSave,
        handleCancel,
        setEditedEntity,
    } = useScenarioItemEditor({
        entity,
        onUpdate: (updated, ...args) => {
            const updateScenarioText = args[0] as boolean | undefined;
            return onUpdate(index, updated, updateScenarioText);
        },
        initialIsEditing: isInitiallyEditing,
    });

    const [showConfirm, setShowConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleRegenerate = useCallback(async () => {
        const result = await Promise.resolve(
            onRegenerateImage(index, editedEntity),
        );
        if (result && typeof result === "object") {
            setEditedEntity((prev) => ({
                ...prev,
                ...result,
            }));
        }
    }, [index, editedEntity, onRegenerateImage, setEditedEntity]);

    const handleUpload = useCallback(
        async (file: File) => {
            const result = await Promise.resolve(onUploadImage(index, file));
            if (result && typeof result === "object") {
                setEditedEntity((prev) => ({
                    ...prev,
                    ...result,
                }));
            }
        },
        [index, onUploadImage, setEditedEntity],
    );

    const handleConfirmUpdate = () => {
        executeSave(true);
    };

    const handleDeclineUpdate = () => {
        executeSave(false);
    };

    const handleConfirmDelete = () => {
        onRemove(index);
    };

    const handleCancelWrapped = useCallback(() => {
        handleCancel();
        if (isInitiallyEditing) {
            onRemove(index);
        }
    }, [handleCancel, isInitiallyEditing, onRemove, index]);

    return (
        <div
            className={`relative flex flex-col items-start gap-6 rounded-xl border p-6 transition-all md:flex-row ${isEditing ? "bg-accent/5 shadow-lg ring-1 ring-accent/20" : "bg-card hover:shadow-md"}`}
        >
            {isDeleting && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                </div>
            )}
            <div className="w-full flex-shrink-0 space-y-4 md:w-[200px]">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-sm">
                    {isLoading && !isDeleting && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}
                    <GcsImage
                        gcsUri={editedEntity.imageGcsUri || null}
                        alt={`${title} ${editedEntity.name}`}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 200px"
                    />
                </div>
                {isEditing && (
                    <ScenarioImageActions
                        onRegenerate={handleRegenerate}
                        onUpload={handleUpload}
                        isLoading={isLoading}
                    />
                )}
            </div>

            <div className="w-full flex-grow space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">
                                        {title} Name
                                    </label>
                                    <Input
                                        value={editedEntity.name}
                                        onChange={(e) =>
                                            updateField(
                                                "name" as keyof T,
                                                e.target.value as T[keyof T],
                                            )
                                        }
                                        placeholder={`Enter ${entityType} name...`}
                                        className="text-lg font-medium"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">
                                        {title} Description
                                    </label>
                                    <Textarea
                                        value={editedEntity.description}
                                        onChange={(e) =>
                                            updateField(
                                                "description" as keyof T,
                                                e.target.value as T[keyof T],
                                            )
                                        }
                                        className="min-h-[120px] w-full resize-none"
                                        placeholder={`Enter ${entityType} description...`}
                                    />
                                </div>
                                {renderExtraFields?.(editedEntity, (updated) =>
                                    setEditedEntity(updated),
                                )}

                                <ScenarioFormActions
                                    onSave={() => setShowConfirm(true)}
                                    onCancel={handleCancelWrapped}
                                    onDelete={() => setShowDeleteConfirm(true)}
                                    isSaving={isSaving}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xl font-bold tracking-tight">
                                        {entity.name}
                                    </h4>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={enterEditMode}
                                        className="flex items-center gap-2"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                </div>
                                <div className="prose prose-sm max-w-none rounded-lg border border-transparent bg-muted/30 p-4 text-muted-foreground transition-colors hover:border-border/50">
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                        {entity.description}
                                    </p>
                                </div>
                                {renderExtraDisplay?.(entity)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ScenarioUpdateConfirmationDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={handleConfirmUpdate}
                onDecline={handleDeclineUpdate}
            />

            <ScenarioDeleteConfirmationDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                onConfirm={handleConfirmDelete}
                entityName={entity.name}
            />
        </div>
    );
});
