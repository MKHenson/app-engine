namespace Animate {

    /**
     * Describes each of the splash screen action types
     */
    export type SplashActionType =
        'SPLASH_REQUEST_PENDING' |
        'SPLASH_REQUEST_FULFILLED' |
        'SPLASH_REQUEST_REJECTED';

    /**
     * A base interface for describing the splash screen actions
     */
    export interface ISplashAction extends Redux.Action {
        type: SplashActionType;
        data?: ISplashScreen;
    };
}