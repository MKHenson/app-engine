
export namespace EventTypes {
    export const PORTAL_ADDED: string = 'portal-added';
    export const PORTAL_REMOVED: string = 'portal-removed';
    export const PORTAL_EDITED: string = 'edited';

    // Container events
    export const CONTAINER_DELETED: string = 'container-deleted';

    // Plugin events
    export const CONTAINER_SELECTED: string = 'container-selected';
    export const CONTAINER_CREATED: string = 'container-created';
}

/**
 * The type of attention message to display
 */
export enum AttentionType {
    WARNING,
    SUCCESS,
    ERROR
}

/**
 * An enum to describe the different types of validation
 */
export enum ValidationErrorType {
    /** The input had too few characters */
    MIN_CHARACTERS,
    /** The input had too many characters */
    MAX_CHARACTERS,
    /** The value must be a valid email format */
    EMAIL,
    /** The value must be a number */
    NUMBER,
    /** The value must only have alphanumeric characters */
    ALPHANUMERIC,
    /** The value must not be empty */
    NOT_EMPTY,
    /** The value cannot contain html */
    NO_HTML,
    /** The value must only alphanumeric characters as well as '_', '-' and '!' */
    ALPHANUMERIC_PLUS,
    /** The value must be alphanumeric characters as well as '_', '-' and '@' */
    ALPHA_EMAIL
}

/**
 * An enum to describe the different types of validation
 */
export enum ValidationType {
    /** The value must be a valid email format */
    EMAIL = 1,
    /** The value must be a number */
    NUMBER = 2,
    /** The value must only have alphanumeric characters */
    ALPHANUMERIC = 4,
    /** The value must not be empty */
    NOT_EMPTY = 8,
    /** The value cannot contain html */
    NO_HTML = 16,
    /** The value must only alphanumeric characters as well as '_', '-' and '!' */
    ALPHANUMERIC_PLUS = 32,
    /** The value must be alphanumeric characters as well as '_', '-' and '@' */
    ALPHA_EMAIL = 64
}

/**
 * Defines which types of files to search through
 */
export enum FileSearchType {
    Global,
    User,
    Project
}

/*
 * The payment type of the user
 */
export enum UserPlan {
    Free = 1,
    Bronze,
    Silver,
    Gold,
    Platinum,
    Custom
}

export enum ResourceType {
    GROUP = 1,
    ASSET,
    CONTAINER,
    FILE,
    SCRIPT

}

/**
 * Describes the type of access users have to a project
 */
export enum PrivilegeType {
    NONE = 0,
    READ,
    WRITE,
    ADMIN,
}

/**
 * Describes the category of a project
 */
export enum Category {
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
export enum PropertyType {
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