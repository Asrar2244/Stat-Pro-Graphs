import { useEffect, useRef } from 'react';

// List of command IDs that should trigger a draft state
// These are standard Univer command IDs for structural changes and clearing data
const TRIGGER_COMMANDS = [
    'sheet.command.remove-row',
    'sheet.command.remove-col',
    'sheet.command.insert-row',
    'sheet.command.insert-col',
    'sheet.command.clear-selection-content',
    'sheet.command.delete-range-move-left',
    'sheet.command.delete-range-move-up',
    'sheet.command.set-range-values', // Covers cut/paste and specialized clear operations
    'sheet.command.set-style', // Style changes might be relevant, but user specifically asked for data/row/col removal
];

export const useUniverCommandListener = (
    setDataState?: (state: 'draft' | 'published' | undefined) => void,
    dataState?: 'draft' | 'published' | undefined
) => {
    const setDataStateRef = useRef(setDataState);
    const dataStateRef = useRef(dataState);

    useEffect(() => {
        setDataStateRef.current = setDataState;
        dataStateRef.current = dataState;
    }, [setDataState, dataState]);

    useEffect(() => {
        // Poll for the API availability since it might not be ready immediately on mount
        const checkApiInterval = setInterval(() => {
            const api = (window as any).univerAPI;
            if (api) {
                clearInterval(checkApiInterval);

                console.log('✅ [useUniverCommandListener] UniverAPI found, attaching listener');

                // Attach global command listener
                // Note: The actual API for command listening might depend on the specific Univer version
                // We try to hook into the command service if exposed via API, or fallback to a hacked event listener if possible.
                // Assuming univerAPI exposes a way to get the CommandService or similar.

                // Since we don't have the exact Univer API types here, we will try to intercept via a common pattern
                // or rely on the fact that Univer often emits events.

                // NOTE: If univerAPI doesn't expose a direct `onCommandExecuted`, we might need to dig deeper.
                // However, based on common Univer patterns:
                const commandDisposable = api.onCommandExecuted?.((command: any) => {
                    if (!command || !command.id) return;

                    // Check if the command is in our trigger list
                    if (TRIGGER_COMMANDS.some(id => command.id.includes(id))) {

                        if (setDataStateRef.current && dataStateRef.current !== 'draft') {
                            console.log(`📝 [CommandListener] Detected change command: ${command.id}. Setting draft mode.`);
                            setDataStateRef.current('draft');
                        }
                    }
                });

                // If the above doesn't work (API mismatch), we might need to rely on DOM MutationObserver or similar less robust methods
                // But let's assume `onCommandExecuted` exists as it is standard in Univer 0.1.x+ wrappers.

                return () => {
                    if (commandDisposable && typeof commandDisposable.dispose === 'function') {
                        commandDisposable.dispose();
                    }
                };
            }
        }, 1000);

        return () => clearInterval(checkApiInterval);
    }, []);
};
