"use client";

import { ImagePrompt } from "@/app/types";

export function ImagePromptDisplay({
    imagePrompt,
}: {
    imagePrompt: ImagePrompt;
}) {
    return (
        <div className="space-y-3">
            <div>
                <span className="text-xs font-medium">Style:</span>
                <p className="text-card-foreground/80 text-sm">
                    {imagePrompt.Style}
                </p>
            </div>
            <div>
                <span className="text-xs font-medium">Scene:</span>
                <p className="text-card-foreground/80 text-sm">
                    {imagePrompt.Scene}
                </p>
            </div>
            <div>
                <span className="text-xs font-medium">Composition:</span>
                <p className="text-card-foreground/80 text-sm">
                    {imagePrompt.Composition.shot_type},{" "}
                    {imagePrompt.Composition.lighting},{" "}
                    {imagePrompt.Composition.overall_mood}
                </p>
            </div>
            <div>
                <span className="text-xs font-medium">Subjects:</span>
                {imagePrompt.Subject.map((subject, index) => (
                    <p
                        key={index}
                        className="text-card-foreground/80 ml-2 text-sm"
                    >
                        • {subject.name}
                    </p>
                ))}
            </div>
            {imagePrompt.Prop && imagePrompt.Prop.length > 0 && (
                <div>
                    <span className="text-xs font-medium">Props:</span>
                    {imagePrompt.Prop.map((prop, index) => (
                        <p
                            key={index}
                            className="text-card-foreground/80 ml-2 text-sm"
                        >
                            • {prop.name}
                        </p>
                    ))}
                </div>
            )}
            <div>
                <span className="text-xs font-medium">Context:</span>
                {imagePrompt.Context.map((context, index) => (
                    <p
                        key={index}
                        className="text-card-foreground/80 ml-2 text-sm"
                    >
                        • {context.name}
                    </p>
                ))}
            </div>
        </div>
    );
}
