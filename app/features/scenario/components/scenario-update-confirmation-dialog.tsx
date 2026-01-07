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

interface ScenarioUpdateConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    onDecline: () => void;
}

export function ScenarioUpdateConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    onDecline,
}: ScenarioUpdateConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Scenario Text?</DialogTitle>
                    <DialogDescription>
                        Do you want to modify the scenario text to include your
                        changes?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:justify-end">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            onDecline();
                            onOpenChange(false);
                        }}
                    >
                        No, just save entity
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                    >
                        Yes, update scenario
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
