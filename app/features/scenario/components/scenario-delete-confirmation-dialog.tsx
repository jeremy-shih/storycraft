"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ScenarioDeleteConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    entityName: string;
}

export function ScenarioDeleteConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    entityName,
}: ScenarioDeleteConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remove {entityName}?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove {entityName} from your
                        scenario?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:justify-end">
                    <Button
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        No
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                    >
                        Yes, remove
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
