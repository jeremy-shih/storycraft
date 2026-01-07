"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { clientLogger } from "@/lib/utils/client-logger";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        clientLogger.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="bg-muted/30 flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-6 text-center">
                    <div className="bg-destructive/10 flex h-12 w-12 items-center justify-center rounded-full">
                        <AlertTriangle className="text-destructive h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Something went wrong
                        </h2>
                        <p className="text-muted-foreground max-w-[400px] text-sm">
                            {this.state.error?.message ||
                                "An unexpected error occurred in this section of the application."}
                        </p>
                    </div>
                    <Button
                        onClick={this.handleReset}
                        variant="outline"
                        size="sm"
                    >
                        Try again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
