namespace Animate {
    /**
    * A basic wrapper for a Portal interface
    */
    export interface IPortal {
        name: string;
        type: HatcheryRuntime.PortalType;
        custom: boolean;
        property: any;
        left?: number;
        top?: number;
        size?: number;
        behaviour?: number;
        links?: ILinkItem[]
    }

    /**
     * A basic wrapper for a CanvasItem interface
     */
    export interface ICanvasItem {
        id?: number;
        type?: HatcheryRuntime.ItemType | 'comment' | 'shortcut';
        left?: number;
        top?: number;
        selected?: boolean;
        width?:number;
        height?:number;
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
        points?: Point[];
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
        label: string;
    }

    /**
    * A basic wrapper for a BehaviourPortal interface
    */
    export interface IBehaviourPortal extends IBehaviour {
        portal: IPortal;
    }

    /**
    * A basic wrapper for a BehaviourScript interface
    */
    export interface IBehaviourScript extends IBehaviour {
        scriptId: string;
    }

    /**
    * A basic wrapper for a BehaviourShortcut interface
    */
    export interface IBehaviourShortcut extends IBehaviour {
        targetId: number;
    }
}