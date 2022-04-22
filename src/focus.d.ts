export declare type FocusHandler = (callback: () => void) => void;

export declare function listenFocusChange (callback: () => void): void;

export declare function setFocusHandler (handler: FocusHandler): void;
