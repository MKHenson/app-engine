module Animate
{
	/**
	* This class is used to create tree view items.
	*/
	export class TreeView extends Component
	{
		private _selectedNode: TreeNode;
		private fixDiv: JQuery;
		private _selectedNodes: Array<TreeNode>;

		constructor( parent : Component )
		{
			// Call super-class constructor
			super( "<div class='tree'></div>", parent );

			this._selectedNode = null;
			this._selectedNodes = [];
			this.element.on( "click", jQuery.proxy( this.onClick, this ) );
			this.element.disableSelection( true );
			this.fixDiv = jQuery( "<div class='fix'></div>" );
			this.element.append( this.fixDiv );
		}

		/**
		* When we click the view
		* @param {any} e 
		*/
		onClick( e : any )
		{
			if ( jQuery( e.target ).hasClass( "first-selectable" ) )
			{
				jQuery( ".tree-node-button", e.target ).trigger( "click" );
				return;
			}

			if ( jQuery( e.target ).hasClass( "tree-node-button" ) )
			{
				var node : TreeNode = jQuery( e.target ).parent().parent().data( "component" );

				if ( node.expanded )
					node.collapse();
				else
					node.expand();

				return;
			}

			var comp = jQuery( e.target ).parent().data( "component" );
			if ( comp != null && comp instanceof TreeNode )
			{
				//CTRL KEY OPERATIONS
				if ( e.ctrlKey )
					this.selectNode( comp, false, e.ctrlKey );

				//SHIFT KEY OPERATIONS
				else if ( e.shiftKey )
				{
					if ( this._selectedNodes.length == 1 )
					{
						if ( comp.element.parent().data( "component" ) == this._selectedNodes[0].element.parent().data( "component" ) )
						{
							var parent = comp.element.parent();
							//var selectedNodeIndex = parent.index( comp.element );
							//var prevNodeIndex = parent.index( this._selectedNodes[0].element );
							//if ( selectedNodeIndex > prevNodeIndex )
							//{
							var startSelecting = false;
							var pNode = parent.data( "component" );

							for ( var i = 0; pNode.mChildren.length; i++ )
							{
								if ( !startSelecting && pNode.mChildren[i] == comp )
								{
									this.selectNode( null );
									return;
								}

								if ( startSelecting || pNode.mChildren[i] == this._selectedNodes[0] )
								{
									startSelecting = true;
									this.selectNode( pNode.mChildren[i], false, true );

									if ( pNode.mChildren[i] == comp )
										return;
								}
							}
							//}
							//else 
							//	this.selectNode( null );

							if ( !startSelecting )
								this.selectNode( null );
						}
					}
					else
						this.selectNode( null );
				}
				else
					this.selectNode( comp, false );
			}
			else
				this.selectNode( null );
		}

		/**
		* Selects a node.
		* @param {TreeNode} node The node to select
		* @param {boolean} expandToNode A bool to say if we need to traverse the tree down until we get to the node
		* and expand all parent nodes
		* @param {boolean} multiSelect If true then multiple nodes are selected
		*/
		selectNode( node: TreeNode, expandToNode : boolean = false, multiSelect : boolean = false )
		{
			if ( !this.enabled )
				return;
			
			if ( this._selectedNode && multiSelect == false )
			{
				var i = this._selectedNodes.length;
				while ( i-- )
					this._selectedNodes[i].selected = false;
				//this.selectedNode.selected( false );

				this._selectedNodes.splice( 0, this._selectedNodes.length );
			}

			this._selectedNode = node;

			if ( node )
			{
				if ( this._selectedNodes.indexOf( node ) == -1 )
				{
					if ( expandToNode )
					{
						//Make sure the tree node is expanded
						var p: TreeNode = <TreeNode>node.parent;
						var scroll = 0;
						while ( p && p instanceof TreeNode )
						{
							if ( !p.expanded )
								p.expand();

							p = <TreeNode>p.parent;
						}
					}

					this._selectedNodes.push( node );
					node.selected = true;
					node.onSelect();

					if ( expandToNode )
						this.parent.element.scrollTo( '#' + node.id, 500 );
				}
			}
		}

		/**
		* This will add a node to the treeview
		* @param {TreeNode} node The node to add
		* @returns {TreeNode} 
		*/
		addNode( node: TreeNode ) : TreeNode
		{
			node.treeview = this;
			node.element.addClass( "tree-node-top" );
			jQuery( ".selectable", node.element ).addClass( "first-selectable" );
			var toRet = Component.prototype.addChild.call( this, node );


			this.fixDiv.remove();
			this.element.append( this.fixDiv );

			return toRet;
		}

		/** @returns {Array<TreeNode>} The nodes of this treeview.*/
		nodes(): Array<TreeNode> { return <Array<TreeNode>>this.children; }

		/**
		* This will clear and dispose of all the nodes
		* @returns Array<TreeNode> The nodes of this tree
		*/
		clear()
		{
			var children: Array<TreeNode> = <Array<TreeNode>>this.children;
			while ( children.length > 0 )
			{
				if ( this._selectedNodes.indexOf( children[0] ) != -1 )
					this._selectedNodes.splice( this._selectedNodes.indexOf( children[0] ), 1 );
				children[0].dispose();
			}
		}

		/**
		* This removes a node from the treeview
		* @param {TreeNode} node The node to remove
		* @returns {TreeNode} 
		*/
		removeNode( node ) : TreeNode
		{
			node.treeview = null;
			var toRet = Component.prototype.removeChild.call( this, node );

			this.fixDiv.remove();
			this.element.append( this.fixDiv );

			if ( this._selectedNodes.indexOf( node ) != -1 )
				this._selectedNodes.splice( this._selectedNodes.indexOf( node ), 1 );

			return toRet;
		}

		/**
		* This will recursively look through each of the nodes to find a node with
		* the specified name.
		* @param {string} property The name property we are evaluating
		* @param {any} value The object we should be comparing against
		* @returns {TreeNode} 
		*/
		findNode( property : string, value : any ) : TreeNode
		{
			var children: Array<TreeNode> = <Array<TreeNode>>this.children;
			var len = children.length;
			for ( var i = 0; i < len; i++ )
			{
				if ( children[i] instanceof TreeNode == false )
					continue;

				var n = children[i].findNode( property, value );
				if ( n != null )
					return n;
			}
		}

		get selectedNode(): TreeNode { return this._selectedNode; }
		get selectedNodes(): Array<TreeNode> { return this._selectedNodes; }
	}
}