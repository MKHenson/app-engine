/// <reference path='./hatchery-plugins.d.ts' />

import { ICanvasItem, ILinkItem } from 'hatchery-editor';
import { IPlugin } from 'hatchery-editor-plugins';

// Extensions to the server interface that are relevant for the client
declare module 'hatchery-server' {

    // Extends the IProject interface to include additional data
    export interface IProject {
        selected?: boolean;
    }

    // Extends the IPlugin interface to include additional data
    export interface IPlugin {
        loaded?: boolean;
        error?: string | null;
        instance?: IPlugin;
        expanded?: boolean;
        selected?: boolean;
    }

    // Extends the IPluginVersion interface
    export interface IPluginVersion {
        mouseOver?: boolean;
        selected?: boolean;
    }

    /**
     * An interface for describing a container workspace
     * The frontend project can extend this interface and flesh out its inner workings
     */
    export interface IContainerWorkspace {
        items: ICanvasItem[];
        properties: any;
        activeLink: ILinkItem | null;
    }
}