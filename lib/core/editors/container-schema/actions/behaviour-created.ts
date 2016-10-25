import { EditorAction } from '../../editor-action';
import { Behaviour } from '../items/behaviour';
import { BehaviourAsset } from '../items/behaviour-asset';
import { ContainerSchema } from '../container-schema';
import { BehaviourDefinition } from '../../../behaviour-definition';
import { ProjectResource } from '../../../project-resources/project-resource';
import { IBehaviour } from '../../../../setup/models';

/**
 * An action for the creation of behaviours within a container
 */
export class BehaviourCreated extends EditorAction {

    definition: BehaviourDefinition;
    instance: Behaviour | null;
    options: IBehaviour;
    resource: ProjectResource<HatcheryServer.IResource> | null;

    constructor( definition: BehaviourDefinition, options: IBehaviour, resource?: ProjectResource<HatcheryServer.IResource> ) {
        super();
        this.definition = definition;
        this.resource = resource || null;
        this.options = options;
    }

    /**
     * Undo the last history action
     */
    undo( editor: ContainerSchema ) {
        editor.removeItem( this.instance! );
        this.instance = null;
    }

    /**
     * Redo the next action
     */
    redo( editor: ContainerSchema ) {

        switch ( this.definition.behaviourName ) {
            case 'Asset':
                this.instance = new BehaviourAsset( this.resource! );
                break;
            default:
                this.instance = new Behaviour( this.definition );
                break;
        }
        const instance = this.instance!;
        instance.left = this.options.left!;
        instance.top = this.options.top!;
        instance.alias = this.options.alias ? this.options.alias : instance.alias;
        editor.addItem( instance );
    }
}