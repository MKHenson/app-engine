import { AttentionType } from '../../setup/enums';
/**
 * A simple component for displaying a styled message to the user.
 *
 * eg:
 * const box = new Attention();
 * box.canClose = true; // Show the close button
 * box.showIcon = true; // Shows the message icon
 * box.text = "Hello world";
 * box.mode = AttentionType.WARNING;
 */
export declare class Attention extends HTMLElement {
    private _mode;
    static readonly observedAttributes: string[];
    /**
     * Creates an instance of the Attention box
     */
    constructor();
    /**
     * When added to the dom, create a fade in effect
     */
    connectedCallback(): void;
    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /**
     * Gets if the attention box enables the close button that removes the element when clicked
     */
    /**
     * Sets if the attention box enables the close button that removes the element when clicked
     */
    canClose: boolean;
    /**
     * Gets if the attention box icon is shown
     */
    /**
     * Sets if the attention box icon is shown
     */
    showIcon: boolean;
    /**
     * Gets the attention box message text
     */
    /**
     * Sets the attention box message text
     */
    text: string;
    /**
     * Gets the attention box mode, which describes the style of message
     */
    /**
     * Sets the attention box mode, which describes the style of message
     */
    mode: AttentionType;
}

/**
 * Primary styled HTML button element
 */
export declare class ButtonPrimary extends HTMLButtonElement {
    constructor();
}
/**
 * Success styled HTML button element
 */
export declare class ButtonSuccess extends HTMLButtonElement {
    constructor();
}
/**
 * Error styled HTML button element
 */
export declare class ButtonError extends HTMLButtonElement {
    constructor();
}
/**
 * A button styled as an anchor
 */
export declare class ButtonLink extends HTMLButtonElement {
    constructor();
    /**
     * Gets the text of the button
     */
    /**
     * Sets the text of the button
     */
    text: string;
}

/**
 * A checkbox component that simplifies the creation and use of inputs as checkboxes
 * eg:
 * const check = new Checkbox();
 * check.checked = true; // You can also use .value
 * check.label = "hello world";
 */
export declare class Checkbox extends HTMLElement {
    onChange?: (sender: Checkbox) => void;
    static readonly observedAttributes: string[];
    /**
     * Creates an instance
     */
    constructor();
    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /**
     * Called whenever the checkbox input changes
     */
    onInputChange(e: Event): void;
    /**
     * Gets the checkbox name
     */
    /**
     * Sets the checkbox name
     */
    name: string;
    /**
     * Gets the checkbox id
     */
    /**
     * Sets the checkbox id
     */
    id: string;
    /**
     * Gets the checkbox label
     */
    /**
     * Sets the checkbox label
     */
    label: string;
    /**
     * Gets if the checkbox is read only
     */
    /**
     * Sets if the checkbox is read only
     */
    readOnly: boolean;
    /**
     * Gets if the checkbox is checked
     */
    /**
     * Sets if the checkbox is checked
     */
    checked: boolean;
    /**
     * Gets if the checkbox is checked
     */
    /**
     * Sets if the checkbox is checked
     */
    value: boolean;
}

import { ValidationError } from '../../core/utils';
import { ValidatedText } from '../validated-text/validated-text';
import { ValidatedSelect } from '../validated-select/validated-select';
import { Checkbox } from '../checkbox/checkbox';
export declare type JsonFormInput = HTMLInputElement | ValidatedText | ValidatedSelect | HTMLTextAreaElement | HTMLSelectElement | Checkbox;
/**
 * A smart Form that formats a JSON representation of its inputs as well as checks
 * for any validation errors. The validation checks are only performed on the custom
 * elements ValidatedText and ValidatedSelect. The JSON format is created as a map
 * whose keys are the names of the inputs, and the values are their corresponding value.
 *
 * eg:
 * const form = new JsonForm();
 * ...
 * (add input elements)
 * ...
 * form.onSubmit = (sender, json) => alert('The form was submitted with the JSON: ' + JSON.stringify(json) )
 * form.onChange = (sender, json) => alert('The form json was changed: ' + JSON.stringify(json) )
 * form.onError = (sender, errors) => alert('The form has some validation errors')
 * form.onResolved = (sender) => alert('The form validation errors have been resolved')
 * const json = form.json; // Gets the JSON without the use of events
 */
export declare class JsonForm extends HTMLFormElement {
    /**
     * Called whenever the form is submitted
     */
    onSubmit?: (sender: JsonForm, json: {
        [name: string]: string | boolean;
    }) => void;
    /**
     * Called whenever a validated input flags a problem
     */
    onError?: (sender: JsonForm, errors: {
        [name: string]: ValidationError;
    }) => void;
    /**
     * Called whenever a validated input's problem is resolved
     */
    onResolved?: (sender: JsonForm) => void;
    /**
     * Called whenever the JSON represenation has changed
     */
    onChange?: (sender: JsonForm, json: {
        [name: string]: string | boolean;
    }) => void;
    private _inputs;
    private _errors;
    private _pristine;
    constructor();
    /**
     * Called if any of the validated inputs reported or resolved an error
     */
    private onValidationChanged(sender, error);
    /**
     * Called whenever any of the inputs fire a change event
     */
    private onInputChange();
    /**
     * Traverse all child elements and find the input elements.
     * The inputs are then mapped to an object and used for checking
     * validation errors and later, getting the values of the input for submission
     */
    traverseChildren(childNodes: NodeList): void;
    /**
     * Gets if the form is in a pristine state
     */
    /**
     * Sets if the form is in a pristine state
     */
    pristine: boolean;
    /**
     * Called whenever the form is added to the dom
     */
    connectedCallback(): void;
    /**
     * Checks if the form inputs have errors or not
     */
    readonly hasErrors: boolean;
    /**
     * Gets the generated json for this form
     */
    readonly json: {
        [name: string]: string | boolean;
    };
    /**
     * When you click submit on the form it should flag any errors
     * and/or prevent submit if they exist
     */
    initiateSubmit(): void;
}

import { AttentionType } from '../../setup/enums';
/**
 * A simple login form with event hooks for the different login actions
 */
export declare class LoginForm extends HTMLElement {
    onLoginRequested: (token: UsersInterface.ILoginToken) => void;
    onResetPasswordRequest: (username: string) => void;
    onResendActivationRequest: (username: string) => void;
    onRegisterRequested: () => void;
    private _loading;
    /**
     * Creates an instance of the Login Form
     */
    constructor();
    /**
     * Shows an message to the user
     */
    message(message: string | null, mode?: AttentionType): void;
    /**
     * Gets if the login form is loading
     */
    /**
     * Sets if the login form is loading
     */
    loading: boolean;
}

import { AttentionType } from '../../setup/enums';
/**
 * A simple register form with event hooks for the different register actions
 */
export declare class RegisterForm extends HTMLElement {
    onRegisterRequested: (token: UsersInterface.IRegisterToken) => void;
    onLoginRequested: () => void;
    private _loading;
    private _captchaId;
    /**
     * Creates an instance of the Login Form
     */
    constructor();
    /**
     * When the component is mounted we initiate the captcha
     */
    connectedCallback(): void;
    /**
     * Called when the component is removed we remove the captcha
     */
    disconnectedCallback(): void;
    /**
     * Shows a message to the user
     */
    message(message: string | null, mode?: AttentionType): void;
    /**
     * Gets if the login form is loading
     */
    /**
     * Sets if the login form is loading
     */
    loading: boolean;
}

export declare type SplitOrientation = 'vertical' | 'horizontal';
/**
 * An element that holds 2 child elements and a splitter to split the space between them.
 * The user can grab the splitter to resize the shared space of the two child elements.
 */
export declare class SplitPanel extends HTMLElement {
    static readonly observedAttributes: string[];
    private _orientation;
    private _ratio;
    private _dividerSize;
    private _mouseUpProxy;
    private _mouseMoveProxy;
    onRatioChanged: undefined | ((ratio: number) => void);
    /**
     * Creates a new instance
     */
    constructor();
    connectedCallback(): void;
    readonly left: Element;
    readonly top: Element;
    readonly bottom: Element;
    readonly right: Element;
    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /**
     * Gets the orientation of the split panel
     */
    /**
     * Sets the orientation of the split panel
     */
    orientation: SplitOrientation;
    /**
     * Call this function to get the ratio of the panel. Values are from 0 to 1
     */
    /**
     * Call this function to set the ratio of the panel. Values are from 0 to 1.
     * @param val The ratio from 0 to 1 of where the divider should be
     */
    ratio: number;
    /**
     * Updates the propertions of the two panels
     */
    updateStyles(): void;
    /**
      * This function is called when the mouse is down on the divider
      */
    onDividerMouseDown(e: MouseEvent): void;
    /**
     * Recalculate the ratios on mouse up
     */
    onStageMouseUp(): void;
    /**
     * This function is called when the mouse is up from the body of stage.
     */
    onStageMouseMove(e: MouseEvent): void;
}

import { ValidationError } from '../../core/utils';
/**
 * A wrapper for a select box that adds some simple validation logic
 * e.g.
 *
 * const select = new ValidatedSelect();
 * select.allowEmpty = false;
 * select.options = ['', 'Option 1', 'Option 2']
 * select.value = 'Option 2';
 */
export declare class ValidatedSelect extends HTMLElement {
    private _value?;
    private _options;
    allowEmpty: boolean;
    onChange?: (sender: ValidatedSelect) => void;
    onValidationError?: (sender: ValidatedSelect, error: ValidationError) => void;
    onValidationResolved?: (sender: ValidatedSelect) => void;
    static readonly observedAttributes: string[];
    /**
     * Creates an instance
     */
    constructor();
    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /**
     * Once the component is added to the DOM we re-evaluate the value value
     * to see if there are options added now that match it. We also check its
     * validation rules.
     */
    connectedCallback(): void;
    /**
     * Called whenever the value changes
     */
    private onSelectChange(e);
    /**
     * Checks the selected option to see if its valid
     */
    private validate(val);
    /**
     * Gets the select name
     */
    /**
     * Sets the select name
     */
    name: string;
    /**
     * Gets if the select is highlighted or not
     */
    /**
     * Sets if the select is highlighted or not
     */
    highlight: boolean;
    /**
     * Gets if the select is in a pristine state
     */
    /**
     * Sets if the select is in a pristine state
     */
    pristine: boolean;
    /**
     * Gets if the select is invalid in its current form
     */
    /**
     * Sets if the select is invalid in its current form
     */
    invalid: boolean;
    /**
     * Gets the select value
     */
    /**
     * Sets the select value
     */
    value: string;
    /**
     * Gets the options array
     */
    /**
     * Sets the options array
     */
    options: string[];
}

import { ValidationType } from '../../setup/enums';
import { ValidationError } from '../../core/utils';
/**
 * A wrapper for an input or text area that adds functionality for validating the user input.
 * Validations are set as min and max character limits and validator enums. You can hook into events
 * such as onValidationError, onValidationResolved and onChange to extract data. You can
 * aslo call value.
 *
 * e.g:
 * const input = new ValidatedText();
 * input.value = 'hello world';
 * input.min = 5;
 * input.validator = ValidationType.EMAIL | ValidationType.NOT_EMPTY;
 */
export declare class ValidatedText extends HTMLElement {
    private _selectOnClick;
    private _inputType;
    validator: ValidationType;
    min: number;
    max: number;
    hint: string;
    onChange?: (sender: ValidatedText) => void;
    onValidationError?: (sender: ValidatedText, error: ValidationError) => void;
    onValidationResolved?: (sender: ValidatedText) => void;
    private _name;
    private _placeholder;
    private _readOnly;
    private _value;
    static readonly observedAttributes: string[];
    /**
     * Creates an instance
     */
    constructor();
    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /**
     * Only applicable if hints are active. Sets the input value to that of the hint
     * if it matches it.
     */
    private onKeyUp(e);
    /**
     * When added to the DOM, check the validation
     */
    connectedCallback(): void;
    /**
     * Called whenever the value changes by user input. The input checks
     * the validation rules and triggers any events accordingly
     */
    private onInputChange(e);
    /**
     * Checks the value against all validators.
     * @returns A ValidationError if validators don't pass
     */
    private getValidationErrorMsg(val);
    /**
     * Gets the input type
     */
    /**
     * Sets the input type. Can be either 'text', 'password' or 'textarea'
     */
    type: 'text' | 'password' | 'textarea';
    /**
     * Gets the input name
     */
    /**
     * Sets the input name
     */
    name: string;
    /**
     * Gets the input placeholder text
     */
    /**
     * Sets the input placeholder text
     */
    placeholder: string;
    /**
     * Gets if the input selects all the text when its focussed
     */
    /**
     * Sets if the input selects all the text when its focussed
     */
    selectOnClick: boolean;
    /**
     * Gets if the input is read only
     */
    /**
     * Sets if the input is read only
     */
    readOnly: boolean;
    /**
     * Gets the input value
     */
    /**
     * Sets the input value
     */
    value: string;
    /**
     * Gets if the input is in a pristine state
     */
    /**
     * Sets if the input is in a pristine state
     */
    pristine: boolean;
    /**
     * Gets if the input is highlighted or not
     */
    /**
     * Sets if the input is highlighted or not
     */
    highlight: boolean;
    /**
     * Gets if the input is invalid in its current form
     */
    /**
     * Sets if the input is invalid in its current form
     */
    invalid: boolean;
}

/**
 * The main GUI component of the application.
 */
export declare class Application extends HTMLElement {
    static readonly observedAttributes: string[];
    private _loadingElm;
    /**
     * Creates a new instance an application element
     */
    constructor();
    /**
     * Gets if the loading element is visible
     */
    /**
     * Sets if the loading element is visible
     */
    loading: boolean;
    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /**
     * When the component is added to the DOM
     */
    connectedCallback(): Promise<void>;
}

import { RegisterForm } from '../../components/register-form/register-form';
import { LoginForm } from '../../components/login-form/login-form';
/**
 * Login mode
 */
export declare enum LoginWidgetMode {
    LOGIN = 0,
    REGISTER = 1,
}
/**
 * A widget for logging the user in
 */
export declare class LoginWidget extends HTMLElement {
    onLogin: () => void;
    private _mode;
    static readonly observedAttributes: string[];
    /**
     * Creates an instance of the widget
     */
    constructor();
    /**
     * Handles a request to the server and how the widget should React
     */
    private request<T>(promise);
    /**
     * Gets the mode of the login widet
     */
    /**
     * Sets the mode of the login widet
     */
    mode: LoginWidgetMode;
    /**
     * Gets the currently active form
     */
    readonly form: LoginForm | RegisterForm;
    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /**
    * Gets if the loading element is visible
    */
    /**
     * Sets if the loading element is visible
     */
    loading: boolean;
}

export declare type SplashMode = 'new' | 'open' | 'overview';
/**
 * The splash screen when starting the app
 */
export declare class Splash extends HTMLElement {
    private _mode;
    /**
     * Creates an instance of the Splash
     */
    constructor();
    connectedCallback(): void;
    mode: SplashMode;
}

/**
 * Base class for all custom enums
 */
export declare class ENUM {
    value: string;
    constructor(v: string);
    toString(): string;
}
export declare type TypedCallback<T extends string, Y> = (type: T, event: Y, sender?: EventDispatcher) => void;
/**
 * Internal class only used internally by the {EventDispatcher}
 */
export declare class EventListener<T extends string, Y> {
    type: T;
    func: TypedCallback<T, Y>;
    context: any;
    constructor(type: T, func: TypedCallback<T, Y>, context?: any);
}
/**
 * A simple class that allows for the adding, removing and dispatching of events.
 */
export declare class EventDispatcher {
    private _listeners;
    disposed: boolean;
    constructor();
    /**
     * Returns the list of event listeners that are currently attached to this dispatcher.
     */
    readonly listeners: Array<EventListener<string, any>>;
    /**
     * Adds a new listener to the dispatcher class.
     * @param type The event type we are sending
     * @param func The callback function
     * @param context [Optional] The context to call with
     */
    on<T extends string, Y>(type: T, func: TypedCallback<T, Y>, context?: any): void;
    /**
     * Adds a new listener to the dispatcher class.
     * @param type The event type we are sending
     * @param func The callback function
     * @param context [Optional] The context to call with
     */
    off<T extends string, Y>(type: T, func: TypedCallback<T, Y>, context?: any): void;
    /**
     * Sends a message to all listeners based on the eventType provided.
     * @param type The event type we are sending
     * @param data [Optional] The data to send with the emission
     */
    emit<T extends string, Y>(type: T, data?: Y | null): any;
    /**
     * This will cleanup the component by nullifying all its variables and clearing up all memory.
     */
    dispose(): void;
}

import { EventDispatcher } from './event-dispatcher';
import { Editor } from './editors/editor';
import { Build } from './build';
import { ResourceType } from '../setup/enums';
import { ProjectResource } from './project-resources/project-resource';
import { Asset } from './project-resources/asset';
import { Container } from './project-resources/container';
import { Script } from './project-resources/script';
import { File } from './project-resources/file';
import { GroupArray } from './project-resources/group-array';
/**
 * A project is the logical container of all resources and functions related
 * to a user's hatchery editor project.
 */
export declare class Project extends EventDispatcher {
    openEditors: Editor[];
    activeEditor: Editor | null;
    curBuild: Build;
    private _restPaths;
    private _entry;
    /**
     * @param id The database id of this project
     */
    constructor();
    activateEditor(editor: Editor): void;
    /**
     * Gets the DB entry associated with this project
     */
    /**
     * Sets the DB entry associated with this project
     */
    entry: HatcheryServer.IProject;
    /**
     * Gets a resource by its ID
     * @param id The ID of the resource
     * @returns The resource whose id matches the id parameter or null
     */
    getResourceByID<T extends ProjectResource<HatcheryServer.IResource>>(id: string, type?: ResourceType): {
        resource: T;
        type: ResourceType;
    } | null;
    /**
     * Gets a resource by its shallow ID
     * @param id The shallow ID of the resource
     * @returns The resource whose shallow id matches the id parameter or null
     */
    getResourceByShallowID<T extends ProjectResource<HatcheryServer.IResource>>(id: number, type?: ResourceType): T | null;
    /**
     * Attempts to update the project details base on the token provided
     * @returns The project token
     */
    updateDetails(token: HatcheryServer.IProject): Promise<UsersInterface.IResponse>;
    /**
     * Loads a previously selected build, or creates one if none are selected
     */
    loadBuild(): Promise<Build>;
    /**
     * Internal function to create a resource wrapper
     * @param entry The database entry
     * @param type The type of resource to create
     */
    private createResourceInstance<T>(entry, type?);
    /**
     * This function is used to fetch the project resources associated with a project.
     * @param type [Optional] You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
       */
    loadResources(type?: ResourceType): Promise<Array<ProjectResource<HatcheryServer.IResource>>>;
    /**
     * This function is used to fetch a project resource by Id
     * @param id the Id of the resource to update
     * @param type You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
     */
    refreshResource<T extends ProjectResource<HatcheryServer.IResource>>(id: string, type?: ResourceType): Promise<T | Error>;
    /**
     * Use this to edit the properties of a resource
     * @param id The id of the object we are editing.
     * @param data The new data for the resource
     */
    editResource<T>(id: string, data: T): Promise<Modepress.IResponse | Error>;
    /**
     * Use this to save the properties of a resource
     * @param id The id of the object we are saving.
     * @param type [Optional] The type of resource we are saving
     */
    saveResource(id: string, type?: ResourceType): Promise<boolean>;
    /**
     * Use this to edit the properties of a resource
     * @param type The type of resource we are saving
     */
    saveResources(type: ResourceType): Promise<boolean>;
    /**
     * Use this to delete a resource by its Id
     * @param id The id of the object we are deleting
     * @param type The type of resource we are renaming
     */
    deleteResource(id: string, type: ResourceType): Promise<boolean | Error>;
    /**
     * Copies an existing resource and assigns a new ID to the cloned item
     * @param id The id of the resource we are cloning from
     * @param type [Optional] The type of resource to clone
     */
    copyResource<T extends HatcheryServer.IResource>(id: string, type: ResourceType): Promise<ProjectResource<T>>;
    /**
     * Deletes several resources in 1 function call
     * @param ids The ids An array of resource Ids
     */
    deleteResources(ids: Array<string>): Promise<boolean>;
    /**
     * This function is used to all project resources
     */
    saveAll(): Promise<boolean>;
    /**
     * Creates a new project resource.
     * @param type The type of resource we are renaming
     */
    createResource<T extends HatcheryServer.IResource>(type: ResourceType, data: T): Promise<ProjectResource<T>>;
    /**
     * This function is used to assign a new editor to a project resource. Editors are used by
     * GUI components to interact with the resource the editor wraps.
     * @param resource The resource we are creating an editor for
     */
    assignEditor(resource: ProjectResource<HatcheryServer.IResource>): Editor | null;
    /**
     * Gets an editor by its resource
     */
    getEditorByResource(resource: ProjectResource<HatcheryServer.IResource>): Editor | null;
    /**
     * Removes an editor from the active editor array
     */
    removeEditor(editor: Editor): void;
    /**
     * Triggers a change event
     */
    invalidate(): void;
    readonly containers: Container[];
    readonly files: File[];
    readonly scripts: Script[];
    readonly assets: Asset[];
    readonly groups: GroupArray[];
    /**
     * This will cleanup the project and remove all data associated with it.
     */
    reset(): void;
}

import { EventDispatcher } from '../event-dispatcher';
import { Prop } from './prop';
/**
* Defines a set of variables. The set is typically owned by an object that can be edited by users. The set can be passed to editors like the
* PropertyGrid to expose the variables to the user.
*/
export declare class EditableSet {
    private _variables;
    parent: EventDispatcher | null;
    /**
    * Creates an instance
    * @param {EventDispatcher} parent The owner of this set. Can be null. If not null, the parent will receive events when the properties are edited.
    */
    constructor(parent: EventDispatcher | null);
    /**
    * Adds a variable to the set
    * @param {Prop<any>} prop
    */
    addVar(prop: Prop<any>): void;
    /**
    * Gets a variable by name
    * @param {string} name
    * @returns {Prop<T>}
    */
    getVar<T>(name: string): Prop<T> | null;
    /**
    * Removes a variable
    * @param {string} prop
    */
    removeVar(name: string): void;
    /**
     * Broadcasts an 'edited' event to the owner of the set
     */
    notifyEdit(): void;
    /**
    * Updates a variable with a new value
    * @returns {T}
    */
    updateValue<T>(name: string, value: T): T | null;
    /**
    * Tokenizes the data into a JSON.
    * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
    */
    tokenize(slim?: boolean): any;
    /**
    * De-Tokenizes data from a JSON.
    * @param {any} data The data to import from
    */
    deTokenize(data: any): void;
    /**
     * Tokenizes the data into a JSON.
     * @returns {Array<Prop<any>>}
     */
    readonly variables: Array<Prop<any>>;
}

import { Prop } from './prop';
import { PropAsset } from './prop-asset';
import { ProjectResource } from '../project-resources/project-resource';
/**
* Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
*/
export declare class PropAssetList extends Prop<Array<ProjectResource<HatcheryServer.IResource>> | null> {
    classNames: Array<string>;
    /**
    * Creates a new instance
    * @param {string} name The name of the property
    * @param {Array<ProjectResource<Engine.IResource>>} value An array of project resources
    * @param {Array<string>} classNames An array of class names we can pick this resource from
    * @param {string} category [Optional] An optional category to describe this property's function
    * @param {any} options Any optional data to be associated with the property
    */
    constructor(name: string, value: Array<ProjectResource<HatcheryServer.IResource>> | null, classNames: Array<string>, category?: string, options?: any);
    /**
    * Tokenizes the data into a JSON.
    * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
    * @returns {any}
    */
    tokenize(slim?: boolean): any;
    /**
    * De-Tokenizes data from a JSON.
    * @param {any} data The data to import from
    */
    deTokenize(data: PropAsset): void;
    /**
    * Attempts to clone the property
    * @returns {PropResourceList}
    */
    clone(): PropAssetList;
}

import { Prop } from './prop';
import { ProjectResource } from '../project-resources/project-resource';
/**
* Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
*/
export declare class PropAsset extends Prop<ProjectResource<HatcheryServer.IResource> | null> {
    classNames: Array<string>;
    /**
    * Creates a new instance
    * @param {string} name The name of the property
    * @param {number} value The value of the property
    * @param {Array<string>} classNames An array of class names we can pick this resource from
    * @param {string} category [Optional] An optional category to describe this property's function
    * @param {any} options Any optional data to be associated with the property
    */
    constructor(name: string, value: ProjectResource<HatcheryServer.IResource> | null, classNames?: Array<string>, category?: string, options?: any);
    /**
    * Tokenizes the data into a JSON.
    * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
    * @returns {any}
    */
    tokenize(slim?: boolean): any;
    /**
    * De-Tokenizes data from a JSON.
    * @param {any} data The data to import from
    */
    deTokenize(data: any): void;
    /**
    * Attempts to clone the property
    * @returns {PropResource}
    */
    clone(): PropAsset;
}

import { Prop } from './prop';
/**
* A small wrapper for colors
*/
export declare class Color {
    color: number;
    alpha: number;
    constructor(color?: number, alpha?: number);
    toString(): string;
}
/**
* Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
*/
export declare class PropColor extends Prop<Color> {
    /**
    * Creates a new instance
    * @param {string} name The name of the property
    * @param {number} color The colour hex
    * @param {number} alpha The alpha value (0 to 1)
    * @param {string} category [Optional] An optional category to describe this property's function
    * @param {any} options [Optional] Any optional data to be associated with the property
    */
    constructor(name: string, color: number, alpha?: number, category?: string, options?: any);
    /**
    * Tokenizes the data into a JSON.
    * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
    * @returns {any}
    */
    tokenize(slim?: boolean): any;
    /**
    * Attempts to clone the property
    * @returns {PropColor}
    */
    clone(): PropColor;
    /**
    * De-Tokenizes data from a JSON.
    * @param {any} data The data to import from
    */
    deTokenize(data: Color): void;
}

import { Prop } from './prop';
/**
* Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
*/
export declare class PropEnum extends Prop<string> {
    choices: Array<string>;
    /**
    * Creates a new instance
    * @param {string} name The name of the property
    * @param {string} value The value of the property
    * @param {number} choices The choices to select from
    * @param {string} category [Optional] An optional category to describe this property's function
    * @param {any} options [Optional] Any optional data to be associated with the property
    */
    constructor(name: string, value: string, choices: Array<string>, category?: string, options?: any);
    /**
   * Tokenizes the data into a JSON.
   * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
   * @returns {any}
   */
    tokenize(slim?: boolean): any;
    /**
    * Attempts to clone the property
    * @returns {PropEnum}
    */
    clone(): PropEnum;
    /**
   * De-Tokenizes data from a JSON.
   * @param {any} data The data to import from
   */
    deTokenize(data: PropEnum): void;
}

import { Prop } from './prop';
import { File } from '../project-resources/file';
/**
* Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
*/
export declare class PropFileResource extends Prop<File | null> {
    extensions: Array<string> | null;
    /**
    * Creates a new instance
    * @param {string} name The name of the property
    * @param {string} value The value of the property
    * @param {number} extensions The valid extends to use eg: ['bmp', 'jpeg']
    * @param {string} category [Optional] An optional category to describe this property's function
    * @param {any} options [Optional] Any optional data to be associated with the property
    */
    constructor(name: string, value: File | null, extensions: Array<string> | null, category?: string, options?: any);
    /**
    * Attempts to clone the property
    * @returns {PropFileResource}
    */
    clone(): PropFileResource;
    /**
   * Tokenizes the data into a JSON.
   * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
   * @returns {any}
   */
    tokenize(slim?: boolean): any;
    /**
   * De-Tokenizes data from a JSON.
   * @param {any} data The data to import from
   */
    deTokenize(data: PropFileResource): void;
}

import { Prop } from './prop';
import { GroupArray } from '../project-resources/group-array';
/**
* Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
*/
export declare class PropGroup extends Prop<GroupArray | null> {
    /**
    * Creates a new instance
    * @param {string} name The name of the property
    * @param {GroupArray} value The value of the property
    * @param {string} category [Optional] An optional category to describe this property's function
    * @param {any} options Any optional data to be associated with the property
    */
    constructor(name: string, value: GroupArray | null, category?: string, options?: any);
    /**
    * Tokenizes the data into a JSON.
    * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
    * @returns {any}
    */
    tokenize(slim?: boolean): any;
    /**
    * De-Tokenizes data from a JSON.
    * @param {any} data The data to import from
    */
    deTokenize(data: any): void;
    /**
    * Attempts to clone the property
    * @returns {PropGroup}
    */
    clone(): PropGroup;
}

import { Prop } from './prop';
/**
* Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
*/
export declare class PropNum extends Prop<number> {
    min: number;
    max: number;
    decimals: number;
    interval: number;
    /**
    * Creates a new instance
    * @param {string} name The name of the property
    * @param {number} value The value of the property
    * @param {number} min The minimum value this property can be
    * @param {number} max The maximum value this property can be
    * @param {number} decimals The number of decimals allowed
    * @param {number} interval The increment/decrement values of this number
    * @param {string} category [Optional] An optional category to describe this property's function
    * @param {any} options [Optional] Any optional data to be associated with the property
    */
    constructor(name: string, value: number, min?: number, max?: number, decimals?: number, interval?: number, category?: string, options?: any);
    /**
    * Attempts to fetch the value of this property
    * @returns {number}
    */
    getVal(): number;
    /**
    * Tokenizes the data into a JSON.
    * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
    * @returns {any}
    */
    tokenize(slim?: boolean): any;
    /**
    * De-Tokenizes data from a JSON.
    * @param {any} data The data to import from
    */
    deTokenize(data: PropNum): void;
    /**
    * Attempts to clone the property
    * @returns {PropNum}
    */
    clone(): PropNum;
}

import { Prop } from './prop';
/**
* Defines an any property variable.
*/
export declare class PropObject extends Prop<any> {
    /**
    * Creates a new instance
    * @param {string} name The name of the property
    * @param {any} value The value of the property
    * @param {string} category [Optional] An optional category to describe this property's function
    * @param {any} options [Optional] Any optional data to be associated with the property
    */
    constructor(name: string, value: any, category?: string, options?: any);
    /**
    * Attempts to clone the property
    * @returns {PropObject}
    */
    clone(): PropObject;
}

import { EditableSet } from './editable-set';
import { PropertyType } from '../../setup/enums';
/**
* Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data.
* Each property is typically owner by an EditableSet.
*/
export declare class Prop<T> {
    name: string;
    protected _value: T;
    category: string;
    options: any;
    set: EditableSet;
    type: PropertyType;
    /**
    * Creates a new instance
    * @param {string} name The name of the property
    * @param {T} value The value of the property
    * @param {string} category [Optional] An optional category to describe this property's function
    * @param {any} options [Optional] Any optional data to be associated with the property
    * @param {PropertyType} type [Optional] Define the type of property
    */
    constructor(name: string, value: T, category?: string, options?: any, type?: PropertyType);
    /**
    * Attempts to clone the property
    * @returns {Prop<T>}
    */
    clone(): Prop<T>;
    /**
    * Attempts to fetch the value of this property
    * @returns {T}
    */
    getVal(): T | null;
    /**
    * Tokenizes the data into a JSON.
    * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
    * @returns {any}
    */
    tokenize(slim?: boolean): any;
    /**
    * De-Tokenizes data from a JSON.
    * @param {any} data The data to import from
    */
    deTokenize(data: any): void;
    /**
    * Attempts to set the value of this property
    * @param {T} val
    */
    setVal(val: T): void;
    /**
    * Cleans up the class
    */
    dispose(): void;
    /**
    * Writes this portal out to a string
    */
    toString(): string;
}
export declare class PropBool extends Prop<boolean> {
    /**
    * Creates a new instance
    * @param {string} name The name of the property
    * @param {boolean} value The value of the property
    * @param {string} category [Optional] An optional category to describe this property's function
    * @param {any} options [Optional] Any optional data to be associated with the property
    */
    constructor(name: string, value: boolean, category?: string, options?: any);
    /**
    * Attempts to clone the property
    * @returns PropBool}
    */
    clone(): PropBool;
}
export declare class PropText extends Prop<string> {
    /**
    * Creates a new instance
    * @param {string} name The name of the property
    * @param {string} value The value of the property
    * @param {string} category [Optional] An optional category to describe this property's function
    * @param {any} options [Optional] Any optional data to be associated with the property
    */
    constructor(name: string, value: string, category?: string, options?: any);
    /**
    * Attempts to clone the property
    * @returns PropText}
    */
    clone(): PropText;
}

import { EventDispatcher } from './event-dispatcher';
export interface IState {
    name: string;
    path: string;
    queries: any;
    params: any;
}
export interface IRoute {
    name: string;
    path: string;
    title?: string;
    isIndex?: boolean;
    onStateEnter: (route: IState) => void;
}
/**
 * A manager for handling the push states of the window
 */
export declare class Router extends EventDispatcher {
    private static _singleton;
    private mode;
    private root;
    private _routes;
    onStateEnter?: (state: IState) => void;
    /**
     * Creates a state manager
     */
    constructor();
    /**
     * Initializes the router and its routes
     */
    init(routes: IRoute[]): void;
    /**
     * Triggers the events when a route path has been matched
     */
    triggerStateChange(route: IRoute, path: string): void;
    /**
     * Checks the path and triggers any state changes if they match the path
     */
    check(pathToCheck?: string): IRoute | undefined;
    /**
     * Removes begining and trailing slashes
     */
    clearSlashes(path: string): string;
    /**
     * A function that gets the path section of a url.
     * The returned result is stripped of any trailing slashes.
     */
    getPath(): string;
    /**
     * Returns the queries of a url as an object
     */
    getQueryParams(): {};
    /**
     * Called whenever the state changes either by the user
     * or from a manual call to push
     */
    protected onPopState(ev: PopStateEvent): void;
    /**
     * Gets the history to go back a state
     */
    back(): void;
    /**
     * Triggers a history route update
     * @param path The path to change the url to
     */
    push(path: string): void;
    /**
     * Gets the instance of the state manager
     */
    static readonly get: Router;
}

import { EventDispatcher } from './event-dispatcher';
import { Project } from './project';
/**
* This class is used to represent the user who is logged into Animate.
*/
export declare class User extends EventDispatcher {
    private static _singleton;
    entry: UsersInterface.IUserEntry | null;
    meta: HatcheryServer.IUserMeta | null;
    project: Project | null;
    constructor();
    /**
     * Attempts to log the user out
     */
    logout(): Promise<boolean>;
    /**
     * Sends a server request to check if a user is logged in
     */
    authenticated(): Promise<boolean>;
    /**
     * Attempts to log the user in using the token provided
     */
    login(token: UsersInterface.ILoginToken): Promise<this>;
    /**
     * Attempts to register the user with the provided token
     * @returns A promise with the return message from the server.
     */
    register(token: UsersInterface.IRegisterToken): Promise<string>;
    /**
     * Sends an instruction to the server to start the user password reset procedure.
     * @returns A promise with the return message from the server.
     */
    resetPassword(user: string): Promise<string>;
    /**
     * Sends an instruction to the server to resend the user account activation link.
     * @returns A promise with the return message from the server.
     */
    resendActivation(user: string): Promise<string>;
    /**
    * Creates a new user projects
    * @param name The name of the project
    * @param plugins An array of plugin IDs to identify which plugins to use
    * @param description [Optional] A short description
    */
    newProject(name: string, plugins: Array<{
        id: string;
        version: string;
    }>, description?: string): Promise<ModepressAddons.ICreateProject>;
    /**
    * Attempts to update the user's details base on the token provided
    * @returns The user details token
    */
    updateDetails(token: HatcheryServer.IUserMeta): Promise<UsersInterface.IResponse>;
    /**
    * Use this function to duplicate a project
    * @param id The project ID we are copying
    */
    copyProject(id: string): void;
    /**
    * This function is used to open an existing project.
    */
    openProject(id: string): void;
    /**
    * This will delete a project from the database as well as remove it from the user.
    * @param id The id of the project we are removing.
    */
    deleteProject(id: string): void;
    /**
     * Gets the singleton instance.
     */
    static readonly get: User;
}

import { ValidationType, ValidationErrorType, PropertyType } from '../setup/enums';
import { Prop } from './properties/prop';
export interface IAjaxError {
    message: string;
    status: number;
}
/**
 * Initializes the utils static variables
 */
export declare type Validator = {
    regex: RegExp;
    name: string;
    negate: boolean;
    message: string;
    type: ValidationType;
};
export declare let validators: {
    [type: number]: Validator;
};
/**
 * An error for use when there is a validation problem
 */
export declare class ValidationError extends Error {
    code: ValidationErrorType;
    constructor(message: string, code: ValidationErrorType);
}
/**
 * Checks a string to see if there is a validation error
 * @param val The string to check
 * @param validator The type of validations to check
 */
export declare function checkValidation(val: string, validator: ValidationType): Validator | null;
/**
 * Returns a formatted byte string
 */
export declare function byteFilter(bytes: number | string, precision?: number): string;
/**
* Generates a new shallow Id - an id that is unique only to this local session
* @param reference Pass a reference id to make sure the one generated is still valid. Any ID that's imported can potentially offset this counter.
*/
export declare function generateLocalId(reference?: number): number;
/**
 * Capitalizes the first character of a string
 */
export declare function capitalize(str: string): string;
/**
* A predefined shorthand method for calling put methods that use JSON communication
*/
export declare function post<T>(url: string, data: any): Promise<T>;
/**
* A predefined shorthand method for calling put methods that use JSON communication
*/
export declare function get<T>(url: string): Promise<T>;
/**
* A predefined shorthand method for calling put methods that use JSON communication
*/
export declare function put<T>(url: string, data: any): Promise<T>;
/**
* A predefined shorthand method for calling deleta methods that use JSON communication
*/
export declare function del<T>(url: string, data?: any): Promise<T>;
/**
* Creates a new property based on the dataset provided
* @param type The type of property to create
*/
export declare function createProperty(name: string, type: PropertyType): Prop<any> | null;
/**
 * Gets the relative position of the mouse to the given element
 * @param e
 * @param elm The target element
 */
export declare function getRelativePos(e: React.MouseEvent | MouseEvent, elm: HTMLElement): HatcheryEditor.Point;
/**
 * Gets a quadratically eased in/out value
 * @param startValue The initial value
 * @param delta The difference between the start value and its target
 * @param curTime Between 0 and duration
 * @param duration The total time
 */
export declare function quadInOut(startValue: any, delta: any, curTime: any, duration: any): number;
/**
 * Scrolls an element to the destination x and y for a given duration
 * @param dest The target X & Y coordinates
 * @param elm The element to scroll
 * @param duration The total amount of time to take to scroll
 * @return Returns setInterval
 */
export declare function scrollTo(dest: HatcheryEditor.Point, elm: HTMLElement, duration: number): number;
/**
* Use this function to check if a value contains characters that break things.
* @param text The text to check
* @param allowSpace If this is true, empty space will be allowed
* @returns Returns null or string. If it returns null then everything is fine. Otherwise a message is returned with what's wrong.
*/
export declare function checkForSpecialChars(text: string, allowSpace?: boolean): string | null;
/**
 * Tells us if a string is a valid email address
 */
export declare function validateEmail(email: string): boolean;
/**
 * Returns the class name of the argument or undefined if
 * it's not a valid JavaScript object.
 */
export declare function getObjectClass(obj: any): any;
/**
 * A helper function that processes all promises with an optional callback for when each returns a result
 */
export declare function all<Y>(promises: Promise<Y>[], progress: (item: Y, progress: number) => void): Promise<Y[]>;

/**
 * Make all properties in T optional as well as their base type
 */
export declare type PartialHTMLElement<T> = {
    [P in keyof T]?: Partial<T[P]>;
};
/**
 * Describes the types that can be added to calls to jml
 */
export declare type Children = (HTMLElement | NodeList | string)[] | HTMLElement | string;
/**
 * Empties out an element of all its child nodes
 */
export declare function empty(element: Element): void;
/**
 * Empties out an element, and replaces it with a child element
 */
export declare function innerHtml(parent: Element, child: Element): void;
export declare namespace JML {
    /**
     * Creates an element based on the type and attributes defined. If children are supplied they are added
     * to the newly created element.
     *
     * eg:
     *  elm('div', { className: 'important', style: { marginLeft: '5px' } } )
     *  elm('div', { className: 'important', style: { marginLeft: '5px' } }, 'Strings are converted to a text node' )
     *  elm('div', { className: 'important', style: { marginLeft: '5px' } }, new HTMLCanvasElement() )
     * @param type Can be a string or Element. If it's a string, it must be a registered element name
     * @param attrs [Optional] A list of attributes that are applied to the created element
     * @param children [Optional] Child elements that will be added to the created element, or the created elements target
     * @param target [Optional] The target selector, if specified, will be the child element within the created element to which the children are added
     */
    function elm<T extends HTMLElement>(type: string | HTMLElement, attrs?: null | PartialHTMLElement<T>, children?: Children, target?: string): T;
    function a(attrs?: null | PartialHTMLElement<HTMLAnchorElement>, children?: Children): HTMLAnchorElement;
    function applet(attrs?: null | PartialHTMLElement<HTMLAppletElement>, children?: Children): HTMLAppletElement;
    function area(attrs?: null | PartialHTMLElement<HTMLAreaElement>, children?: Children): HTMLAreaElement;
    function audio(attrs?: null | PartialHTMLElement<HTMLAudioElement>, children?: Children): HTMLAudioElement;
    function base(attrs?: null | PartialHTMLElement<HTMLBaseElement>, children?: Children): HTMLBaseElement;
    function basefont(attrs?: null | PartialHTMLElement<HTMLBaseFontElement>, children?: Children): HTMLBaseFontElement;
    function blockquote(attrs?: null | PartialHTMLElement<HTMLQuoteElement>, children?: Children): HTMLQuoteElement;
    function body(attrs?: null | PartialHTMLElement<HTMLBodyElement>, children?: Children): HTMLBodyElement;
    function br(attrs?: null | PartialHTMLElement<HTMLBRElement>, children?: Children): HTMLBRElement;
    function button(attrs?: null | PartialHTMLElement<HTMLButtonElement>, children?: Children): HTMLButtonElement;
    function canvas(attrs?: null | PartialHTMLElement<HTMLCanvasElement>, children?: Children): HTMLCanvasElement;
    function caption(attrs?: null | PartialHTMLElement<HTMLTableCaptionElement>, children?: Children): HTMLTableCaptionElement;
    function col(attrs?: null | PartialHTMLElement<HTMLTableColElement>, children?: Children): HTMLTableColElement;
    function colgroup(attrs?: null | PartialHTMLElement<HTMLTableColElement>, children?: Children): HTMLTableColElement;
    function datalist(attrs?: null | PartialHTMLElement<HTMLDataListElement>, children?: Children): HTMLDataListElement;
    function del(attrs?: null | PartialHTMLElement<HTMLModElement>, children?: Children): HTMLModElement;
    function dir(attrs?: null | PartialHTMLElement<HTMLDirectoryElement>, children?: Children): HTMLDirectoryElement;
    function div(attrs?: null | PartialHTMLElement<HTMLDivElement>, children?: Children): HTMLDivElement;
    function dl(attrs?: null | PartialHTMLElement<HTMLDListElement>, children?: Children): HTMLDListElement;
    function embed(attrs?: null | PartialHTMLElement<HTMLEmbedElement>, children?: Children): HTMLEmbedElement;
    function fieldset(attrs?: null | PartialHTMLElement<HTMLFieldSetElement>, children?: Children): HTMLFieldSetElement;
    function font(attrs?: null | PartialHTMLElement<HTMLFontElement>, children?: Children): HTMLFontElement;
    function form(attrs?: null | PartialHTMLElement<HTMLFormElement>, children?: Children): HTMLFormElement;
    function frame(attrs?: null | PartialHTMLElement<HTMLFrameElement>, children?: Children): HTMLFrameElement;
    function frameset(attrs?: null | PartialHTMLElement<HTMLFrameSetElement>, children?: Children): HTMLFrameSetElement;
    function h1(attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children): HTMLHeadingElement;
    function h2(attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children): HTMLHeadingElement;
    function h3(attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children): HTMLHeadingElement;
    function h4(attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children): HTMLHeadingElement;
    function h5(attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children): HTMLHeadingElement;
    function h6(attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children): HTMLHeadingElement;
    function head(attrs?: null | PartialHTMLElement<HTMLHeadElement>, children?: Children): HTMLHeadElement;
    function hr(attrs?: null | PartialHTMLElement<HTMLHRElement>, children?: Children): HTMLHRElement;
    function html(attrs?: null | PartialHTMLElement<HTMLHtmlElement>, children?: Children): HTMLHtmlElement;
    function iframe(attrs?: null | PartialHTMLElement<HTMLIFrameElement>, children?: Children): HTMLIFrameElement;
    function img(attrs?: null | PartialHTMLElement<HTMLImageElement>, children?: Children): HTMLImageElement;
    function input(attrs?: null | PartialHTMLElement<HTMLInputElement>, children?: Children): HTMLInputElement;
    function ins(attrs?: null | PartialHTMLElement<HTMLModElement>, children?: Children): HTMLModElement;
    function isindex(attrs?: null | PartialHTMLElement<HTMLUnknownElement>, children?: Children): HTMLUnknownElement;
    function label(attrs?: null | PartialHTMLElement<HTMLLabelElement>, children?: Children): HTMLLabelElement;
    function legend(attrs?: null | PartialHTMLElement<HTMLLegendElement>, children?: Children): HTMLLegendElement;
    function li(attrs?: null | PartialHTMLElement<HTMLLIElement>, children?: Children): HTMLLIElement;
    function link(attrs?: null | PartialHTMLElement<HTMLLinkElement>, children?: Children): HTMLLinkElement;
    function listing(attrs?: null | PartialHTMLElement<HTMLPreElement>, children?: Children): HTMLPreElement;
    function map(attrs?: null | PartialHTMLElement<HTMLMapElement>, children?: Children): HTMLMapElement;
    function marquee(attrs?: null | PartialHTMLElement<HTMLMarqueeElement>, children?: Children): HTMLMarqueeElement;
    function menu(attrs?: null | PartialHTMLElement<HTMLMenuElement>, children?: Children): HTMLMenuElement;
    function meta(attrs?: null | PartialHTMLElement<HTMLMetaElement>, children?: Children): HTMLMetaElement;
    function meter(attrs?: null | PartialHTMLElement<HTMLMeterElement>, children?: Children): HTMLMeterElement;
    function nextid(attrs?: null | PartialHTMLElement<HTMLUnknownElement>, children?: Children): HTMLUnknownElement;
    function object(attrs?: null | PartialHTMLElement<HTMLObjectElement>, children?: Children): HTMLObjectElement;
    function ol(attrs?: null | PartialHTMLElement<HTMLOListElement>, children?: Children): HTMLOListElement;
    function optgroup(attrs?: null | PartialHTMLElement<HTMLOptGroupElement>, children?: Children): HTMLOptGroupElement;
    function option(attrs?: null | PartialHTMLElement<HTMLOptionElement>, children?: Children): HTMLOptionElement;
    function p(attrs?: null | PartialHTMLElement<HTMLParagraphElement>, children?: Children): HTMLParagraphElement;
    function param(attrs?: null | PartialHTMLElement<HTMLParamElement>, children?: Children): HTMLParamElement;
    function picture(attrs?: null | PartialHTMLElement<HTMLPictureElement>, children?: Children): HTMLPictureElement;
    function pre(attrs?: null | PartialHTMLElement<HTMLPreElement>, children?: Children): HTMLPreElement;
    function progress(attrs?: null | PartialHTMLElement<HTMLProgressElement>, children?: Children): HTMLProgressElement;
    function q(attrs?: null | PartialHTMLElement<HTMLQuoteElement>, children?: Children): HTMLQuoteElement;
    function script(attrs?: null | PartialHTMLElement<HTMLScriptElement>, children?: Children): HTMLScriptElement;
    function select(attrs?: null | PartialHTMLElement<HTMLSelectElement>, children?: Children): HTMLSelectElement;
    function source(attrs?: null | PartialHTMLElement<HTMLSourceElement>, children?: Children): HTMLSourceElement;
    function span(attrs?: null | PartialHTMLElement<HTMLSpanElement>, children?: Children): HTMLSpanElement;
    function style(attrs?: null | PartialHTMLElement<HTMLStyleElement>, children?: Children): HTMLStyleElement;
    function table(attrs?: null | PartialHTMLElement<HTMLTableElement>, children?: Children): HTMLTableElement;
    function tbody(attrs?: null | PartialHTMLElement<HTMLTableSectionElement>, children?: Children): HTMLTableSectionElement;
    function td(attrs?: null | PartialHTMLElement<HTMLTableDataCellElement>, children?: Children): HTMLTableDataCellElement;
    function template(attrs?: null | PartialHTMLElement<HTMLTemplateElement>, children?: Children): HTMLTemplateElement;
    function textarea(attrs?: null | PartialHTMLElement<HTMLTextAreaElement>, children?: Children): HTMLTextAreaElement;
    function tfoot(attrs?: null | PartialHTMLElement<HTMLTableSectionElement>, children?: Children): HTMLTableSectionElement;
    function th(attrs?: null | PartialHTMLElement<HTMLTableHeaderCellElement>, children?: Children): HTMLTableHeaderCellElement;
    function thead(attrs?: null | PartialHTMLElement<HTMLTableSectionElement>, children?: Children): HTMLTableSectionElement;
    function title(attrs?: null | PartialHTMLElement<HTMLTitleElement>, children?: Children): HTMLTitleElement;
    function tr(attrs?: null | PartialHTMLElement<HTMLTableRowElement>, children?: Children): HTMLTableRowElement;
    function track(attrs?: null | PartialHTMLElement<HTMLTrackElement>, children?: Children): HTMLTrackElement;
    function ul(attrs?: null | PartialHTMLElement<HTMLUListElement>, children?: Children): HTMLUListElement;
    function video(attrs?: null | PartialHTMLElement<HTMLVideoElement>, children?: Children): HTMLVideoElement;
    function xmp(attrs?: null | PartialHTMLElement<HTMLPreElement>, children?: Children): HTMLPreElement;
    function i(attrs?: null | PartialHTMLElement<HTMLElement>, children?: Children): HTMLElement;
}

/**
 * A map of parser objects. These parsers are used within the JML.elm calls
 * as a way to map a custom property to a regular HTML attribute. The key of
 * of this object is the html attribute name and its value is a function which
 * is called to parse the custom attribute.
 */
export declare const parsers: {
    [name: string]: (val: any) => any;
};

import './setup/emitters';

export declare class DataToken {
    category: string;
    command: string;
    projectID: string;
}

export declare class DB {
    static USERS: string;
    static USERS_SOCKET: string;
    static HOST: string;
    static API: string;
    static PLAN_FREE: string;
    static PLAN_BRONZE: string;
    static PLAN_SILVER: string;
    static PLAN_GOLD: string;
    static PLAN_PLATINUM: string;
}

declare const WorkerGlobalScope: any;
declare function __awaiterFn(thisArg: any, _arguments: any, P: any, generator: any): any;

export declare namespace EventTypes {
    const PORTAL_ADDED: string;
    const PORTAL_REMOVED: string;
    const PORTAL_EDITED: string;
    const CONTAINER_DELETED: string;
    const CONTAINER_SELECTED: string;
    const CONTAINER_CREATED: string;
}
/**
 * The type of attention message to display
 */
export declare enum AttentionType {
    WARNING = 0,
    SUCCESS = 1,
    ERROR = 2,
}
/**
 * An enum to describe the different types of validation
 */
export declare enum ValidationErrorType {
    /** The input had too few characters */
    MIN_CHARACTERS = 0,
    /** The input had too many characters */
    MAX_CHARACTERS = 1,
    /** The value must be a valid email format */
    EMAIL = 2,
    /** The value must be a number */
    NUMBER = 3,
    /** The value must only have alphanumeric characters */
    ALPHANUMERIC = 4,
    /** The value must not be empty */
    NOT_EMPTY = 5,
    /** The value cannot contain html */
    NO_HTML = 6,
    /** The value must only alphanumeric characters as well as '_', '-' and '!' */
    ALPHANUMERIC_PLUS = 7,
    /** The value must be alphanumeric characters as well as '_', '-' and '@' */
    ALPHA_EMAIL = 8,
}
/**
 * An enum to describe the different types of validation
 */
export declare enum ValidationType {
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
    ALPHA_EMAIL = 64,
}
/**
 * Defines which types of files to search through
 */
export declare enum FileSearchType {
    Global = 0,
    User = 1,
    Project = 2,
}
export declare enum UserPlan {
    Free = 1,
    Bronze = 2,
    Silver = 3,
    Gold = 4,
    Platinum = 5,
    Custom = 6,
}
export declare enum ResourceType {
    GROUP = 1,
    ASSET = 2,
    CONTAINER = 3,
    FILE = 4,
    SCRIPT = 5,
}
/**
 * Describes the type of access users have to a project
 */
export declare enum PrivilegeType {
    NONE = 0,
    READ = 1,
    WRITE = 2,
    ADMIN = 3,
}
/**
 * Describes the category of a project
 */
export declare enum Category {
    Other = 1,
    Artistic = 2,
    Gaming = 3,
    Informative = 4,
    Musical = 5,
    Technical = 6,
    Promotional = 7,
}
/**
 * Describes a property type
 */
export declare enum PropertyType {
    ASSET = 0,
    ASSET_LIST = 1,
    NUMBER = 2,
    COLOR = 3,
    GROUP = 4,
    FILE = 5,
    STRING = 6,
    OBJECT = 7,
    BOOL = 8,
    ENUM = 9,
    HIDDEN = 10,
    HIDDEN_FILE = 11,
    OPTIONS = 12,
}

import { BehaviourDefinition } from '../core/behaviour-definition';
import { Editor } from '../core/editors/editor';
import { ProjectResource } from '../core/project-resources/project-resource';
import { Container } from '../core/project-resources/container';
import { TreeNodeModel } from '../components/treeview/treenode-model';
/**
 * Events related to the web socket communication API
 */
export declare type SocketEvents = 'Error' | UsersInterface.SocketTokens.ClientInstructionType;
export declare type ProjectEvents = 'change' | 'editor-created' | 'editor-removed' | 'resource-created' | 'resource-removed' | 'saved' | 'saved_all' | 'failed' | 'build_selected' | 'build_saved';
/**
 * Events related to project resources
 */
export declare type ResourceEvents = 'edited' | 'refreshed' | 'modified';
/**
 * Events related to the resource editors
 */
export declare type EditorEvents = 'change';
/**
 * Events related to the plugin manager
 */
export declare type PluginManagerEvents = 'template-created' | 'template-removed' | 'editor-ready';
/**
 * Events dispatched by a treeview
 */
export declare type TreeviewEvents = 'change' | 'focus-node';
/**
 * An event object dispatched by the PluginManager for template related events
 */
export interface ITemplateEvent {
    template: BehaviourDefinition;
}
/**
 * An event token for events dispatched by changes to or from resources
 */
export interface IResourceEvent {
    resource: ProjectResource<HatcheryServer.IResource>;
}
/**
 * An event token for events dispatched by changes to or from project containers
 */
export interface IContainerEvent {
    container: Container;
}
/**
 * An event token for events dispatched by changes to or from project editors
 */
export interface IEditorEvent {
    editor: Editor;
}
/**
 * TODO: Can probably be removed
 * Valid response codes for requests made to the Animate server
 */
export declare type AnimateLoaderResponses = 'success' | 'error';
/**
 * TODO: Can probably be removed
 * Valid response codes for xhr binary requests
 */
export declare type BinaryLoaderResponses = 'binary_success' | 'binary_error';
/**
 * Event types for logger based events
 */
export declare type LoggerEvents = 'change';
/**
 * Basic set of loader events shared by all loaders
 * TODO: Can probably be removed
 */
export declare type LoaderEvents = 'complete' | 'failed';
/**
 * An event token for TreeNodeModel related events
 */
export interface INodeEvent {
    node: TreeNodeModel;
}
/**
 * An event token for socket API related events
 */
export interface ISocketEvent {
    error?: Error;
    json?: UsersInterface.SocketTokens.IToken;
}
/**
 * TODO: Can probably be removed
 * Events associated with xhr binary requests
 */
export interface BinaryLoaderEvent {
    buffer: ArrayBuffer | null;
    message: string;
}
/**
 * TODO: Can probably be removed
 * Events associated with requests made to the animate servers
 */
export interface AnimateLoaderEvent {
    message: string;
    return_type: AnimateLoaderResponses;
    data: any;
    tag: any;
}
