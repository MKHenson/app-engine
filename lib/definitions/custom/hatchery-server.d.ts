
// Extensions to the server interface that are relevant for the client
declare namespace HatcheryServer {

    /**
     * An interface for describing a container workspace
     * The frontend project can extend this interface and flesh out its inner workings
     */
    export interface IContainerWorkspace {
        items: Animate.ICanvasItem[];
        properties: any;
        activeLink: Animate.ILinkItem;
    }
}