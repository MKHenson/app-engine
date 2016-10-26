import { IPlugin } from 'hatchery-editor-plugins';

export class TypeConverter {
    public plugin: IPlugin;
    public typeA: string;
    public typeB: string;
    public conversionOptions: Array<string>;

    constructor( typeA: string, typeB: string, conversionOptions: Array<string>, plugin: IPlugin ) {
        this.typeA = typeA;
        this.typeB = typeB;
        this.conversionOptions = conversionOptions;
        this.plugin = plugin;
    }

    /** Checks if this converter supports a conversion. */
    canConvert( typeA, typeB ) {
        if ( this.typeA === typeA && this.typeB === typeB )
            return true;
        else
            return false;
    }

    /** Cleans up the object. */
    dispose() {
        this.conversionOptions.splice( 0, this.conversionOptions.length );
    }
}