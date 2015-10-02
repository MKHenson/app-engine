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
}