"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScenarioFormActionsProps {
    onSave: () => void;
    onCancel: () => void;
    onDelete?: () => void;
    isSaving: boolean;
}

export function ScenarioFormActions({
    onSave,
    onCancel,
    onDelete,
    isSaving,
}: ScenarioFormActionsProps) {
    return (
        <div className="mt-6 flex items-center justify-between gap-4 border-t pt-4">
            {onDelete ? (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            ) : (
                <div />
            )}
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSaving}
                >
                    Cancel
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving}
                    className="min-w-[80px]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </>
                    ) : (
                        "Save"
                    )}
                </Button>
            </div>
        </div>
    );
}
