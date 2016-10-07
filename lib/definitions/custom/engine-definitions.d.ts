﻿declare module HatcheryServer {
    // Extends the IProject interface to include additional data
    export interface IProject {
        $plugins?: Array<IPlugin>;
    }

    // Extends the IPlugin interface to include additional data
    export interface IPlugin {
        $loaded?: boolean;
        $error?: string;
        $instance?: Animate.IPlugin;
    }
}