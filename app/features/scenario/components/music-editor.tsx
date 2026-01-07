"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScenarioFormActions } from "./scenario-form-actions";

interface MusicEditorProps {
    music: string;
    onSave: (newMusic: string) => void;
}

export const MusicEditor = memo(function MusicEditor({
    music,
    onSave,
}: MusicEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedMusic, setEditedMusic] = useState(music);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setEditedMusic(music);
        }
    }, [music, isEditing]);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            await Promise.resolve(onSave(editedMusic));
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save music description:", error);
        } finally {
            setIsSaving(false);
        }
    }, [editedMusic, onSave]);

    const handleCancel = useCallback(() => {
        setEditedMusic(music);
        setIsEditing(false);
    }, [music]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Music</h3>
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
                className={`rounded-xl border p-6 transition-all ${isEditing ? "bg-accent/5 ring-accent/20 shadow-lg ring-1" : "bg-card hover:shadow-md"}`}
            >
                {isEditing ? (
                    <div className="space-y-4">
                        <Textarea
                            value={editedMusic}
                            onChange={(e) => setEditedMusic(e.target.value)}
                            className="min-h-[100px] w-full resize-none"
                            placeholder="Enter music description..."
                            autoFocus
                        />
                        <ScenarioFormActions
                            onSave={handleSave}
                            onCancel={handleCancel}
                            isSaving={isSaving}
                        />
                    </div>
                ) : (
                    <div className="prose prose-sm bg-muted/30 text-muted-foreground hover:border-border/50 max-w-none rounded-lg border border-transparent p-4 transition-colors">
                        <p className="leading-relaxed whitespace-pre-wrap">
                            {music}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});
