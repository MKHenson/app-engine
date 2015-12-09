module Animate
{
	/**
	* This is the base class for all tree node classes
	*/
    export class TreeNode extends Component implements IRenamable
	{
		protected mText: string;
		private img: string;
		private _expanded: boolean;
		private hasExpandButton: boolean;
		public canDelete: boolean;
		public canFocus: boolean;
		public canUpdate: boolean;

        public treeview: TreeView;
        private _modified: boolean;
        private _modifiedStar: JQuery;
         
		/**
		* @param {string} text The text to use for this node
		* @param {string} img An optional image to use (image src text)
		* @param {boolean} hasExpandButton A bool to tell the node if it should use the expand button
		*/
		constructor( text, img : string = null, hasExpandButton : boolean = true )
		{
			if ( img != null && img != "" )
				img = "<img src='" + img + "' />";
			else
				img = "";

			this.mText = text;
			this.img = img;
			this._expanded = false;
            this.hasExpandButton = hasExpandButton;
            this._modified = false;
            this._modifiedStar = jQuery("<span>*</span>");

			// Call super-class constructor
			super( "<div class='tree-node'><div class='selectable'>" + ( this.hasExpandButton ? "<div class='tree-node-button'>+</div>" : "" ) + this.img + "<span class='text'>" + this.mText + "</span><div class='fix'></div></div></div>", null );
			(<any>this.element).disableSelection( true );

			jQuery( ".tree-node-button", this.element ).first().css( "visibility", "hidden" );

			this.treeview = null;
			this.canDelete = false;
			this.canFocus = true;
        }

        /**
		* Gets if this tree node is in a modified state
		* @returns {boolean}
		*/
        public get modified(): boolean
        {
            return this._modified;
        }

        /**
		* Sets if this tree node is in a modified state
		* @param {boolean} val
		*/
        public set modified(val: boolean)
        {
            this._modified = val;
            if (val)
                this._modifiedStar.insertBefore(jQuery(".text:first", this.element));
            else
                this._modifiedStar.detach();
        }

		/**
		* This will cleanup the component.
		*/
		dispose()
        {
            this._modifiedStar.remove();

			if ( this.treeview )
			{
				if ( this.treeview.selectedNodes.indexOf( this ) != -1 )
					this.treeview.selectedNodes.splice( this.treeview.selectedNodes.indexOf( this ), 1 );

				if ( this.treeview.selectedNode == this )
					this.treeview.selectedNode = null;
			}

            this._modifiedStar = null;
			this.mText = null;
			this.img = null;
			this._expanded = null;
			this.hasExpandButton = null;
			this.treeview = null;
			this.canDelete = null;

			//Call super
			super.dispose();
		}

		/**
		* Called when the node is selected
		*/
		onSelect() { }

		/**
		* This function will rturn an array of all its child nodes
		* @param {Function} type This is an optional type object. You can pass a function or class and it will only return nodes of that type.
		* @param Array<TreeNode> array This is the array where data will be stored in. This can be left as null and one will be created
		* @returns Array<TreeNode>
		*/
		getAllNodes( type : Function, array: Array<TreeNode> = null ): Array<TreeNode>
		{
			var toRet : Array<TreeNode> = null
			if ( array )
				toRet = array;
			else
				toRet = [];

			var children: Array<TreeNode> = <Array<TreeNode>>this.children;
			var len = children.length;
			for ( var i = 0; i < len; i++ )
			{
				children[i].getAllNodes( type, toRet )

				if ( type == null )
					toRet.push( children[i] );
				else if ( children[i] instanceof type )
					toRet.push( children[i] );
			}

			return toRet;
		}

		/**
		* This function will expand this node and show its children.
		*/
		expand()
		{
			if ( this.hasExpandButton == false )
				return;

			var children: Array<TreeNode> = <Array<TreeNode>>this.children;
			var len = children.length;
			for ( var i = 0; i < len; i++ )
				children[i].element.show();

			jQuery( ".tree-node-button", this.element ).first().text( "-" );

			this._expanded = true;
		}

		/**
		* This function will collapse this node and hide its children.
		*/
		collapse() : void
		{
			if ( this.hasExpandButton == false )
				return;

			var children: Array<TreeNode> = <Array<TreeNode>>this.children;
			var len = children.length;
			for ( var i = 0; i < len; i++ )
				children[i].element.hide();

			jQuery( ".tree-node-button", this.element ).first().text( "+" );

			this._expanded = false;
		}

		/**
		* This will recursively look through each of the nodes to find a node with
		* the specified name.
		* @param {string} property The Javascript property on the node that we are evaluating
		* @param {any} value The value of the property we are comparing.
		* @returns {TreeNode} 
		*/
		findNode( property : string, value : any ) : TreeNode
		{
			if ( this[property] == value )
				return this;

			var children: Array<TreeNode> = <Array<TreeNode>>this.children;
			var len : number = children.length;
			for ( var i = 0; i < len; i++ )
			{
				if ( children[i] instanceof TreeNode == false )
					continue;

				var n : TreeNode = children[i].findNode( property, value );
				if ( n != null )
					return n;
			}
		}

		/**
		* This will clear and dispose of all the nodes
		*/
		clear() : void
		{
			var children: Array<TreeNode> = <Array<TreeNode>>this.children;

			while ( children.length > 0 )
			{
				if ( children[0].treeview && children[0].treeview.selectedNodes.indexOf(children[0] ) != -1 )
					children[0].treeview.selectedNodes.splice( children[0].treeview.selectedNodes.indexOf( children[0] ), 1 );

				children[0].dispose();
			}
		}

		/**
		* Set if the component is selected
		* @param {boolean} val Pass a true or false value to select the component. 
		*/
		set selected( val : boolean )
		{
			//Check if setting the variable
			if ( val )
				jQuery( " > .selectable", this.element ).addClass( "selected" ).addClass("reg-gradient");
			else
                jQuery(" > .selectable", this.element).removeClass("selected").removeClass( "reg-gradient" );
		}

		/**
		* Get if the component is selected
		* @returns {boolean} If the component is selected or not.
		*/
		get selected() : boolean
		{
			if ( this.element.hasClass( "selected" ) )
				return true;
			else
				return false;
		}

		/**
		* Sets the text of the node
		* @param {string} val The text to set
		*/
		set text( val : string )
		{
			this.mText = val;
			jQuery( ".text:first", this.element ).text( this.mText );
		}

		/**
		* Gets the text of the node
		* @returns {string} The text of the node
		*/
		get text(): string
		{
			return this.mText;
		}

		/**
		* This will add a node to the treeview
		* @param {TreeNode} node The node to add
		* @param {boolean} collapse True if you want to make this node collapse while adding the new node. The default is true
		* @returns {TreeNode} 
		*/
		addNode( node: TreeNode, collapse : boolean = true ) : TreeNode
		{
			node.treeview = this.treeview;
			var toRet = Component.prototype.addChild.call( this, node );
			
			if ( collapse )
				this.collapse();
			else
				this.expand();

			jQuery( ".tree-node-button", this.element ).first().css( "visibility", "" );

			return toRet;
		}

		/**
		* The nodes of this treeview.
		* @returns {Array<TreeNode>}
		*/
		get nodes(): Array<TreeNode> { return <Array<TreeNode>>this.children; }

		/**
		* Gets if this treenode is expanded or not
		* @returns {boolean}
		*/
		get expanded(): boolean { return this._expanded; }
		

		/**
		* This removes a node from the treeview
		* @param {TreeNode} node The node to remove
		* @returns {TreeNode} 
		*/
		removeNode( node: TreeNode ) : TreeNode
		{
			if ( this.treeview.selectedNodes.indexOf( node ) != -1 )
				this.treeview.selectedNodes.splice( this.treeview.selectedNodes.indexOf( node ), 1 );

			if ( this.treeview.selectedNode == node )
				this.treeview.selectedNode = null;

			node.treeview = null;

			var toRet : TreeNode = Component.prototype.removeChild.call( this, node );

			if ( this.nodes.length == 0 )
				jQuery( ".tree-node-button", this.element ).first().css( "visibility", "hidden" );

			return toRet;
		}
        
        get name(): string { return this.mText; }
	}
}