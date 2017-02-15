import { EditableSet } from './properties/editable-set';
import { Prop } from './properties/prop';

const registeredClasses: AssetClass[] = [];

/**
 * Adds an asset class to the session
 */
export function addClass( instance: AssetClass ): AssetClass {
    if ( registeredClasses.indexOf( instance ) === -1 )
        registeredClasses.push( instance );

    return instance;
}

/**
 * Removes an asset class from the session
 */
export function removeClass( instance: AssetClass ): AssetClass {
    if ( registeredClasses.indexOf( instance ) !== -1 )
        registeredClasses.splice( registeredClasses.indexOf( instance ), 1 );

    return instance;
}

/**
 * Gets an asset class by its name
 * @param name The name of the asset class
 */
export function getClass( name: string ): AssetClass | null {
    let toReturn: AssetClass | null = null;

    for ( const instance of registeredClasses ) {
        toReturn = instance.findClass( name );
        if ( instance )
            return instance;
    }

    return null;
}

/**
 * Gets all asset classes registered with session
 */
export function getClasses() {
    return registeredClasses;
}

/**
 * This class describes a template. These templates are used when creating assets.
 */
export class AssetClass {
    public classes: Array<AssetClass>;
    public parentClass: AssetClass | null;
    public readonly abstractClass: boolean;
    public readonly name: string;
    public readonly imgURL: string;
    public readonly variables: Array<Prop<any>>;

    /**
     * Creates an instance of the asset class
     */
    constructor( name: string, parent: AssetClass | null, imgURL: string, abstractClass: boolean = false ) {
        this.abstractClass = abstractClass;
        this.name = name;
        this.parentClass = parent;
        this.imgURL = imgURL;
        this.variables = [];
        this.classes = [];
    }

    /**
     * Gets an array of all classes that are possible from this
     */
    getClasses(): AssetClass[] {
        let toRet: AssetClass[] = [];
        let classes = this.classes!;

        for ( let childClass of classes ) {
            toRet.push( childClass );
            classes.concat( childClass.getClasses() );
        }

        return toRet;
    }

    /**
     * Creates an object of all the variables for an instance of this class.
     * @returns The variables we are editing
     */
    buildVariables(): EditableSet {
        const toRet: EditableSet = new EditableSet( null );
        let topClass: AssetClass | null = this;
        while ( topClass !== null ) {

            //Add all the variables to the object we are returning
            for ( let i = 0; i < topClass.variables!.length; i++ ) {
                const variable = topClass.variables![ i ];

                // If the variable is added by a child class - then do not add it from the parent
                // this essentially makes sure child class variables hold top priority
                if ( !toRet.getVar( variable.name ) )
                    toRet.addVar( variable );
            }

            topClass = topClass.parentClass;
        }

        return toRet;
    }

    /**
     * Finds a class by its name. Returns null if nothing is found
     */
    findClass( name: string ): AssetClass | null {
        if ( this.name === name )
            return this;

        const classes: AssetClass[] = this.classes;
        for ( let i = 0, l = classes.length; i < l; i++ ) {
            const aClass: AssetClass | null = classes[ i ].findClass( name );
            if ( aClass )
                return aClass;
        }

        return null;
    }

    /**
     * Adds a variable to the class.
     * @param prop The property to add
     * @returns A reference to this AssetClass
     */
    addVar( prop: Prop<any> ): AssetClass {
        this.variables.push( prop );
        return this;
    }

    /**
     * This will clear and dispose of all the nodes
     */
    dispose() {
        for ( let i = 0, l = this.variables.length; i < l; i++ )
            this.variables[ i ].dispose();

        for ( let i = 0, l = this.classes.length; i < l; i++ )
            this.classes[ i ].dispose();

        this.parentClass = null;
    }

    /**
     * Gets a variable based on its name
     * @param name The name of the class
     */
    getVariablesByName<T>( name: string ): Prop<T> | null {
        for ( let i = 0, l = this.variables.length; i < l; i++ )
            if ( this.variables[ i ].name === name )
                return this.variables[ i ];

        return null;
    }


    /**
     * Adds a class
     * @param name The name of the class
     * @param img The optional image of the class
     * @param abstractClass A boolean to define if this class is abstract or not. I.e. does this class allow for creating assets or is it just the base for others.
     */
    addClass( name: string, img: string, abstractClass: boolean ): AssetClass {
        const toAdd = new AssetClass( name, this, img, abstractClass );
        this.classes.push( toAdd );
        return toAdd;
    }
}