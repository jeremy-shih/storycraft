"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScenarioFormActions } from "./scenario-form-actions";

interface ScenarioDescriptionEditorProps {
    description: string;
    onSave: (newDescription: string) => void;
}

export const ScenarioDescriptionEditor = memo(
    function ScenarioDescriptionEditor({
        description,
        onSave,
    }: ScenarioDescriptionEditorProps) {
        const [isEditing, setIsEditing] = useState(false);
        const [editedDescription, setEditedDescription] = useState(description);
        const [isSaving, setIsSaving] = useState(false);

        useEffect(() => {
            if (!isEditing) {
                setEditedDescription(description);
            }
        }, [description, isEditing]);

        const handleSave = useCallback(async () => {
            setIsSaving(true);
            try {
                await Promise.resolve(onSave(editedDescription));
                setIsEditing(false);
            } catch (error) {
                console.error("Failed to save scenario description:", error);
            } finally {
                setIsSaving(false);
            }
        }, [editedDescription, onSave]);

        const handleCancel = useCallback(() => {
            setEditedDescription(description);
            setIsEditing(false);
        }, [description]);

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Scenario</h3>
                    {!isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                        </Button>
                    )}
                </div>

                <div
                    className={`rounded-xl border p-6 transition-all ${isEditing ? "bg-accent/5 shadow-lg ring-1 ring-accent/20" : "bg-card hover:shadow-md"}`}
                >
                    {isEditing ? (
                        <div className="space-y-4">
                            <Textarea
                                value={editedDescription}
                                onChange={(e) =>
                                    setEditedDescription(e.target.value)
                                }
                                className="min-h-[200px] w-full resize-none"
                                placeholder="Enter your scenario..."
                                autoFocus
                            />
                            <ScenarioFormActions
                                onSave={handleSave}
                                onCancel={handleCancel}
                                isSaving={isSaving}
                            />
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none rounded-lg border border-transparent bg-muted/30 p-4 text-muted-foreground transition-colors hover:border-border/50">
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    },
);
