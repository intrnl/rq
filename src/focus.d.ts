export type FocusHandler = (callback: () => void) => void;

export function listenFocusChange (callback: () => void): void;

export function setFocusHandler (handler: FocusHandler): void;
