module Animate
{
    export module EventTypes
    {
        export const PORTAL_ADDED: string = "portal-added";
        export const PORTAL_REMOVED: string = "portal-removed";
        export const PORTAL_EDITED: string = "edited";
        export const CONTAINER_DELETED: string = "container-deleted";
    }

    /**
	* Defines which types of files to search through 
	*/
    export enum FileSearchType
    {
        Global,
        User,
        Project
    }

    export enum PortalType
    {
        PARAMETER,
        PRODUCT,
        INPUT,
        OUTPUT
    }

    /*
    * The payment type of the user
    */
    export enum UserPlan
    {
        Free = 1,
        Bronze,
        Silver,
        Gold,
        Platinum,
        Custom
    }

    export enum ResourceType
    {
        GROUP = 1,
        ASSET,
        CONTAINER,
        FILE,
        SCRIPT

    }
    
    /**
    * Describes the type of access users have to a project
    */
    export enum PrivilegeType
    {
        NONE = 0,
        READ,
        WRITE,
        ADMIN,
    }

    /**
    * Describes the category of a project
    */
    export enum Category
    {
        Other = 1,
        Artistic,
        Gaming,
        Informative,
        Musical,
        Technical,
        Promotional,
    }

    /**
    * Describes a property type
    */
    export enum PropertyType
    {
        ASSET,
        ASSET_LIST,
        NUMBER,
        COLOR,
        GROUP,
        FILE,
        STRING,
        OBJECT,
        BOOL,
        ENUM,
        HIDDEN,
        HIDDEN_FILE,
        OPTIONS
    }

    /**
    * Describes the type of canvas item to create
    */
    export enum CanvasItemType
    {
        Link,
        Behaviour,
        BehaviourAsset,
        BehaviourShortcut,
        BehaviourPortal,
        BehaviourScript,
        BehaviourComment,
        BehaviourInstance
    }
}