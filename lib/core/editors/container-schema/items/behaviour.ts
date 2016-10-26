import { EditableSet } from '../../../properties/editable-set';
import { Prop } from '../../../properties/prop';
import { BehaviourDefinition } from '../../../behaviour-definition';
import { CanvasItem } from './canvas-item';
import { Portal } from './portal';
import { IBehaviour, IPortal } from 'hatchery-editor';
import { createProperty } from '../../../utils';

/**
 * Behaviours are the model data of BehaviourComponents and represent a behaviour/set of functionality
 * that has been added to a container.
 */
export class Behaviour extends CanvasItem {
    public alias: string;
    public canGhost: boolean;
    public behaviourType: string;
    public parameters: Portal[];
    public products: Portal[];
    public outputs: Portal[];
    public inputs: Portal[];
    public portals: Portal[];
    public properties: EditableSet;
    public template: BehaviourDefinition;

    /**
     * Creates an instance of the behaviour
     */
    constructor( template: BehaviourDefinition ) {
        super();

        this.parameters = [];
        this.products = [];
        this.outputs = [];
        this.inputs = [];
        this.portals = [];
        this.alias = template.behaviourName;
        this.template = template;
        this.behaviourType = template.behaviourName;
        this.canGhost = true;
        this.properties = new EditableSet( this );

        const portalTemplates = template.portalsTemplates();
        for ( const portal of portalTemplates )
            this.addPortal( portal.type, portal.property.clone() );

        this.calculateSize();
    }

    move( x: number, y: number ) {
        this.left = x;
        this.top = y;
        for ( const portal of this.portals )
            for ( const link of portal.links )
                link.calculateDimensions();

        this.invalidate();
    }

    calculateSize() {
        const fontSize = 5;
        let tw = fontSize * this.alias.length + 20;
        let th = fontSize + 20;
        const portalSize = 10;
        const portalSpacing = 5;
        const padding = 10;

        const maxHorPortals = ( this.products.length > this.parameters.length ? this.products.length : this.parameters.length );
        const maxVertPortals = ( this.inputs.length > this.outputs.length ? this.inputs.length : this.outputs.length );
        const totalPortalSpacing = portalSize + portalSpacing;
        const maxHorSize = totalPortalSpacing * maxHorPortals;
        const maxVertSize = totalPortalSpacing * maxVertPortals;

        // If the portals increase the size - the update the dimensions
        tw = tw + padding > maxHorSize ? tw + padding : maxHorSize;
        th = th + padding > maxVertSize ? th + padding : maxVertSize;

        // Round off to the nearest 10 and minus border. This is so that they line up nicely to the graph
        tw = Math.ceil(( tw ) / 10 ) * 10;
        th = Math.ceil(( th ) / 10 ) * 10;

        this.width = tw;
        this.height = th;

        // Calculate portal positions
        for ( let i = 0, params = this.parameters, l = params.length; i < l; i++ )
            params[ i ].calculatePosition( i );
        for ( let i = 0, products = this.products, l = products.length; i < l; i++ )
            products[ i ].calculatePosition( i );
        for ( let i = 0, outputs = this.outputs, l = outputs.length; i < l; i++ )
            outputs[ i ].calculatePosition( i );
        for ( let i = 0, inputs = this.inputs, l = inputs.length; i < l; i++ )
            inputs[ i ].calculatePosition( i );
    }

    /**
     * Clones the canvas item
     */
    clone( clone?: Behaviour ): Behaviour {
        if ( !clone )
            clone = new Behaviour( this.template );

        clone.alias = this.alias;
        clone.behaviourType = this.behaviourType;
        clone.canGhost = this.canGhost;

        // TODO: This should be deep cloned
        clone.properties = this.properties;

        super.clone( clone );
        return clone;
    }

    /**
     * Gets a portal by its name
     * @param name The portal name
     */
    getPortal( name: string ): Portal | null {
        let portals = this.portals
        for ( let portal of portals )
            if ( portal.property.name === name )
                return portal;

        return null;
    }

    /**
     * Adds a portal to this behaviour.
     * @param type The type of portal we are adding. It can be either 'input', 'output', 'parameter' & 'product'
     * @param property
     */
    addPortal( type: HatcheryRuntime.PortalType, property: Prop<any> ): Portal {
        const portal = new Portal( this, type, property );

        // Add the arrays
        if ( type === 'parameter' )
            this.parameters.push( portal );
        else if ( type === 'product' )
            this.products.push( portal );
        else if ( type === 'output' )
            this.outputs.push( portal );
        else
            this.inputs.push( portal );

        this.portals.push( portal );
        portal.behaviour = this;
        this.invalidate();
        return portal;
    }



    /**
    * Removes a portal from this behaviour
    * @param toRemove The portal object we are removing
    */
    removePortal( toRemove: Portal ): Portal {

        // Remove from arrays
        let index = this.parameters.indexOf( toRemove )
        if ( index !== -1 ) {
            this.properties.removeVar( toRemove.property.name );
            this.parameters.splice( index, 1 );
        }

        index = this.products.indexOf( toRemove );
        if ( index !== -1 )
            this.products.splice( index, 1 );

        index = this.outputs.indexOf( toRemove );
        if ( index !== -1 )
            this.outputs.splice( index, 1 );

        index = this.inputs.indexOf( toRemove );
        if ( index !== -1 )
            this.inputs.splice( index, 1 );

        index = this.portals.indexOf( toRemove );
        if ( index !== -1 )
            this.portals.splice( index, 1 );

        toRemove.dispose();
        this.invalidate();
        return toRemove;
    }

    /**
     * Serializes the data into a JSON.
     */
    serialize( id: number ): IBehaviour {
        let toRet = <IBehaviour>super.serialize( id );
        let portals = this.portals;

        toRet.portals = <Array<IPortal>>[];

        for ( let portal of portals )
            toRet.portals.push( portal.serialize() );

        toRet.alias = this.alias;
        toRet.behaviourType = this.behaviourType;
        return toRet;
    }

    /**
     * De-Serializes data from a JSON.
     * @param data The data to import from
     */
    deSerialize( data: IBehaviour ) {
        super.deSerialize( data );

        // Remove all existing portals
        while ( this.portals.length > 0 )
            this.portals.pop() !.dispose();

        this.alias = data.alias!;
        this.behaviourType = data.behaviourType!;

        for ( let portal of data.portals! ) {
            let prop: Prop<any> | null = createProperty( portal.property.name, portal.property.type );
            if ( !prop )
                throw new Error( `Could not create property ${portal.property.name}` );

            prop.deTokenize( portal.property );

            let newPortal = this.addPortal( portal.type, prop );
            newPortal.custom = portal.custom;
        }

        this.calculateSize();
    }

    /**
     * Diposes and cleans up this component and its portals
     */
    dispose() {
        for ( let i = 0; i < this.portals.length; i++ )
            this.portals[ i ].dispose();

        this.parameters.splice( 0, this.parameters.length );
        this.products.splice( 0, this.products.length );
        this.outputs.splice( 0, this.outputs.length );
        this.inputs.splice( 0, this.inputs.length );
        this.portals.splice( 0, this.portals.length );

        // Call super
        super.dispose();
    }
}