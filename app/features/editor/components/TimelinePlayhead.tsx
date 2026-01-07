import { TIMELINE_DURATION } from "../constants/editor-constants";

interface TimelinePlayheadProps {
    currentTime: number;
}

export function TimelinePlayhead({ currentTime }: TimelinePlayheadProps) {
    return (
        <div
            className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-red-500 transition-none"
            style={{
                left: `${(currentTime / TIMELINE_DURATION) * 100}%`,
                height: "100%",
                willChange: "left",
            }}
        >
            <div className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-red-500 shadow-md" />
        </div>
    );
}
