module Animate
{
	export class ComponentEvents extends ENUM
	{
		constructor(v: string) { super(v); }
		static UPDATED: ComponentEvents = new ComponentEvents("component_updated");
	}

	/**
	* The base class for all visual elements in the application. The {Component} class
	* contains a reference of a jQuery object that points to the {Component}'s DOM representation.
	*/
	export class Component extends EventDispatcher implements IComponent
	{
		public static idCounter: number = 0;

		private _element : JQuery;
		private _children: Array<IComponent>;
		private _layouts: Array<ILayout>;
		private _id: string;
		private _parent: Component;
		

		//This is used in the saving process. Leave alone.
		//private _savedID : string = null;
		private _tooltip : string = null;
		private _enabled : boolean = true;

		public tag: any;

		public savedID: string;

        constructor(html: string | JQuery, parent: Component = null)
		{
			super();

			if ( !html )
                this._element = jQuery("<div class='Component'><div>");
            else if (typeof html == "string")
                this._element = jQuery(html);
            else
                this._element = <JQuery>html;

			// Increment the ID's
			Component.idCounter++;

			// Create the jQuery wrapper
			this._children = [];
			this._layouts = [];
			
			this.savedID = null;
			this._tooltip = null;
			this._enabled = true;
			this.tag = null;
			this._parent = parent;

			// Associate the id and component
            if (!this._element.attr("id"))
            {
                this._id = "i" + Component.idCounter;
                this._element.attr("id", this._id);
            }

			this._element.data("component", this);

			if ( parent )
				parent.addChild(this);
		}

		/**
		* Diposes and cleans up this component and all its child {Component}s
		*/
		dispose() : void
		{
			if ( this.disposed )
				return;
            
			this._tooltip = null;
			var children: Array<IComponent> = this._children;
			
			// Dispose method will remove child from parent and also the array
			while ( children.length != 0 )	
				children[0].dispose();

			this._layouts = null;
			this.tag = null;
			this._children = null;
			this.savedID = null;
			if (this._parent != null)
				this._parent.removeChild(this);

			this.element
				.data("id", null)
				.data("component", null)
				.remove();

			this.element = null;
			
			// Call super
			EventDispatcher.prototype.dispose.call(this);
		}

		/**
		* This function is called to update this component and its children. 
		* Typically used in sizing operations.
		* @param {boolean} updateChildren Set this to true if you want the update to proliferate to all the children components.
		*/
		update(updateChildren : boolean = true) 
		{
			var layouts: Array<ILayout> = this._layouts;
			var i = layouts.length;
			while (i--)
				layouts[i].update(this);

			if (updateChildren)
			{
				var children: Array<IComponent> = this._children;
				i = children.length;
				while (i--)
					children[i].update();
			}

			super.dispatchEvent(new Event( ComponentEvents.UPDATED ) );
		}
		
		/**
		* Add layout algorithms to the {Component}.
		* @param {ILayout} layout The layout object we want to add
		* @returns {ILayout} The layout that was added
		*/
		addLayout(layout: ILayout): ILayout
		{
			this._layouts.push(layout);
			return layout;
		}

		/**
		* Removes a layout from this {Component}
		* @param {ILayout} layout The layout to remove
		* @returns {ILayout} The layout that was removed
		*/
		removeLayout(layout: ILayout): ILayout
		{
			if (jQuery.inArray(layout, this._layouts) == -1)
				return null;

			this._layouts.splice(jQuery.inArray(layout, this._layouts), 1);
			return layout;
		}

		/**
		* Gets the ILayouts for this component
		* {returns} Array<ILayout>
		*/
		get layouts(): Array<ILayout> { return this._layouts; }

		/**
		* Use this function to add a child to this component. 
		* This has the same effect of adding some HTML as a child of another piece of HTML.
		* It uses the jQuery append function to achieve this functionality.
		* @param {string | IComponent | JQuery} child The child component we want to add
		* @returns {IComponent} The added component
		*/
        addChild(child: string | IComponent | JQuery): IComponent
		{
			// Remove from previous parent
            var parent: Component;
            var toAdd: Component = null;

            if (child instanceof Component)
            {
                toAdd = child;
                parent = child.parent;
            }
            else
            {
                if (typeof child === "string")
                    toAdd = new Component(child);
                else if ((<JQuery>child).length != 0)
                {
                    var jq = <JQuery>child;
                    if (jq.parent() && jq.parent().data("component"))
                        parent = jq.parent().data("component");

                    toAdd = new Component(<JQuery>child);
                }
                else
                    throw new Error("You can only add HTML strings or Component classes");
            }

            // If already in this component then do nothing
            if (jQuery.inArray(child, this._children) != -1)
                return (<IComponent>child);

            // If it had an existing parent - then remove it
            if (parent)
                parent.removeChild((<IComponent>toAdd));
            
			
			toAdd._parent = this;
			this._children.push(toAdd);
			this._element.append(toAdd._element);
			return toAdd;
		}

		/**
		* Use this function to remove a child from this component. 
		* It uses the {JQuery} detach function to achieve this functionality.
		* @param {IComponent} child The {IComponent} to remove from this {IComponent}'s children
		* @returns {IComponent} The {IComponent} we have removed
		*/
		removeChild(child: IComponent): IComponent
		{
			//Determine if the child is pure html or a component
			if (jQuery.inArray(child, this._children) == -1)
				return child;

			(<Component>child)._parent = null;
			child.element.detach();
			this._children.splice(jQuery.inArray(child, this._children), 1 );
			return child;
		}


		/**
		* Removes all child nodes
		*/
		clear() : void
		{
			var children: Array<IComponent> = this._children;
			var i = children.length;
			while (i--)
				children[i].dispose();
		}

		onDelete(): void { }

		/**
		* Returns the array of Child {Component}s
		* @returns {Array{IComponent}} An array of child {IComponent} objects
		*/
		get children(): Array<IComponent> { return this._children; }

		/**
		* Gets the jQuery wrapper
		*/
		get element(): JQuery { return this._element; }

		/**
		* Gets the jQuery parent
		*/
		get parent(): Component { return this._parent; }

		/**
		* Gets the tooltip for this {Component}
		*/
		get tooltip(): string { return this._tooltip; }

		/**
		* Sets the tooltip for this {Component}
		*/
		set tooltip(val: string) { this._tooltip = val; }

		/**
		* Get or Set if the component is enabled and recieves mouse events
		*/
		get enabled(): boolean { return this._enabled; }

		/**
		* Get or Set if the component is enabled and recieves mouse events
		*/
		set enabled(val : boolean)
		{
			if (this._enabled == val)
				return;

			if (!val)
				this.element.addClass("disabled");
			else
				this.element.removeClass("disabled");

			this._enabled = val;
		
		}

		/**
		* Gets the ID of thi component
		*/
		get id(): string { return this._id; }

		/**
		* Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
		*/
		get selected(): boolean
		{
			if (this._element.hasClass("selected"))
				return true;
			else
				return false;
		}

		/**
		* Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
		*/
		set selected(val : boolean)
		{
			if (val)
				this._element.addClass("selected");
			else
				this._element.removeClass("selected");
		}
	}
}