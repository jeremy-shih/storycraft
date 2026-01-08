"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Loader2 } from "lucide-react";

interface ScenarioHeaderProps {
    isLoading: boolean;
    onGenerateStoryboard: () => void;
}

export const ScenarioHeader = memo(function ScenarioHeader({
    isLoading,
    onGenerateStoryboard,
}: ScenarioHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">
                    Review your scenario
                </h2>
                <p className="text-muted-foreground">
                    Refine the characters, settings, and story details.
                </p>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    size="lg"
                    onClick={onGenerateStoryboard}
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-sm"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <LayoutGrid className="mr-2 h-5 w-5" />
                            Generate Storyboard
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
});
