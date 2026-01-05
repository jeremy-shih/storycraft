import { useState, useCallback } from "react";

interface AsyncOperationState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export function useAsyncOperation<T, Args extends unknown[]>(
    asyncFn: (...args: Args) => Promise<T>,
) {
    const [state, setState] = useState<AsyncOperationState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(
        async (...args: Args) => {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                const result = await asyncFn(...args);
                setState({ data: result, loading: false, error: null });
                return result;
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error:
                        error instanceof Error
                            ? error
                            : new Error(String(error)),
                }));
                throw error;
            }
        },
        [asyncFn],
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return { ...state, execute, reset };
}
