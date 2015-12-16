module Animate
{
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
}