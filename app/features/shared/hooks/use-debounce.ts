import { useEffect, useRef, useMemo } from "react";
import { debounce, DebouncedFunc } from "lodash";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => any>(
    callback: T,
    delay: number,
): DebouncedFunc<T> {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useMemo(
        () =>
            // eslint-disable-next-line react-hooks/refs
            debounce((...args: Parameters<T>) => {
                return callbackRef.current(...args);
            }, delay),
        [delay],
    );
}
