export declare type FocusHandler = (callback: () => void) => void;

export declare const listenFocusChange: (callback: () => void) => void;

export declare const setFocusHandler: (handler: FocusHandler) => void;
