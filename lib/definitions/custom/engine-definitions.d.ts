declare module Engine {
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

    // Extends the editor namespace with new data
    export namespace Editor {

        export type ItemType = HatcheryRuntime.ItemType | 'comment' | 'shortcut';

        /**
        * A basic wrapper for a Portal interface
        */
        export interface IPortal {
            behaviour?: number;
            name?: string;
            type?: HatcheryRuntime.PortalType;
            custom?: boolean;
            property?: any;
            links?: number[];
            left?: number;
            top?: number;
            size?: number;
        }

        /**
         * A basic wrapper for a CanvasItem interface
         */
        export interface ICanvasItem {
            id?: number;
            type?: ItemType;
            left?: number;
            top?: number;
            width?: number;
            height?: number;
            selected?: boolean;
        }

        /**
        * A basic wrapper for a Link interface
        */
        export interface ILinkItem extends ICanvasItem {
            frameDelay?: number;
            startPortal?: string;
            endPortal?: string;
            startBehaviour?: number;
            endBehaviour?: number;
            points?: { x: number; y: number; }[];
        }

        /**
        * A basic wrapper for a Behaviour interface
        */
        export interface IBehaviour extends ICanvasItem {
            alias?: string;
            behaviourType?: string;
            portals?: IPortal[];
        }

        /**
        * A basic wrapper for a Comment interface
        */
        export interface IComment extends ICanvasItem {
            label?: string;
        }

        /**
        * A basic wrapper for a BehaviourPortal interface
        */
        export interface IBehaviourPortal extends IBehaviour {
            portal?: IPortal;
        }

        /**
        * A basic wrapper for a BehaviourScript interface
        */
        export interface IBehaviourScript extends IBehaviour {
            scriptId?: string;
        }

        /**
        * A basic wrapper for a BehaviourShortcut interface
        */
        export interface IBehaviourShortcut extends IBehaviour {
            targetId?: number;
        }

        /**
        * A basic interface for a container object
        */
        export interface IContainerWorkspace {
            activeLink?: Animate.Serializable<ILinkItem>;
            items: Animate.Serializable<ICanvasItem>[];
            properties: any;
        }
    }
}