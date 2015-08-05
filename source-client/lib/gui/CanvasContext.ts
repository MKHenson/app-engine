module Animate
{
	/**
	* This is the implementation of the context menu on the canvas.
	*/
	export class CanvasContext extends ContextMenu
	{
		private mCreateInput: ContextMenuItem;
		private mCreateOutput: ContextMenuItem;
		private mCreateParam: ContextMenuItem;
		private mCreateProduct: ContextMenuItem;
		private mEditPortal: ContextMenuItem;
		private mDel: ContextMenuItem;
		private mCreate: ContextMenuItem;
		private mCreateComment: ContextMenuItem;
		private mDelEmpty: ContextMenuItem;

		constructor( width )
		{
			// Call super-class constructor
			super( width );

			//Add the items
			this.mDel = this.addItem( new ContextMenuItem( "Delete", "media/cross.png" ) );
			this.mCreate = this.addItem( new ContextMenuItem( "Create Behaviour", "media/behavior_20.png" )  );
			this.mCreateComment = this.addItem( new ContextMenuItem( "Create Comment", "media/comment.png" ) );
			this.mCreateInput = this.addItem( new ContextMenuItem( "Create Input", "media/portal.png" ) );
			this.mCreateOutput = this.addItem( new ContextMenuItem( "Create Output", "media/portal.png" ) );
			this.mCreateParam = this.addItem( new ContextMenuItem( "Create Parameter", "media/portal.png" ) );
			this.mCreateProduct = this.addItem( new ContextMenuItem( "Create Product", "media/portal.png" ) );
			this.mEditPortal = this.addItem( new ContextMenuItem( "Edit Portal", "media/portal.png" ) );
			this.mDelEmpty = this.addItem( new ContextMenuItem( "Remove Empty Assets", "media/cross.png" ) );
		}

		/**
		* Shows the window by adding it to a parent.
		*/
		showContext( x : number, y : number, item : Component )
		{
			this.mCreateInput.element.show();
			this.mCreateOutput.element.show();
			this.mCreateParam.element.show();
			this.mCreateProduct.element.show();
			this.mEditPortal.element.hide();
			this.mDelEmpty.element.hide();

			//If there is nothing selected
			if ( item == null )
			{
				this.mDel.element.hide();
				this.mCreate.element.show();
				this.mCreateComment.element.show();
				this.mDelEmpty.element.show();
			}
			//If we're editing a Portal
			else if ( item instanceof Portal )
			{
				this.mCreateInput.element.hide();
				this.mCreateOutput.element.hide();
				this.mCreateParam.element.hide();
				this.mCreateProduct.element.hide();
				this.mDel.element.hide();

				if ( (<Portal> item).customPortal )
				{
					this.mEditPortal.element.show();
					this.mDel.element.show();
					this.mCreate.element.hide();
					this.mCreateComment.element.hide();
				}
				else
					return;
			}
			//If something is selected
			else if ( item instanceof Behaviour || item instanceof BehaviourPortal )
			{
				this.mDel.element.show();
				this.mCreate.element.hide();
				this.mCreateComment.element.hide();

				this.mCreateInput.element.hide();
				this.mCreateOutput.element.hide();
				this.mCreateParam.element.hide();
				this.mCreateProduct.element.hide();

				if ( item instanceof BehaviourPortal == false )
				{
					var template = PluginManager.getSingleton().getTemplate((<BehaviourPortal>item).originalName );
					if ( template )
					{
						if ( template.canBuildOutput( <Behaviour>item ) )
							this.mCreateOutput.element.show();
						if ( template.canBuildInput( <Behaviour>item ) )
							this.mCreateInput.element.show();
						if ( template.canBuildParameter( <Behaviour>item ) )
							this.mCreateParam.element.show();
						if ( template.canBuildProduct( <Behaviour>item ) )
							this.mCreateProduct.element.show();
					}
				}
			}

			super.show( null, x, y, false, true );
		}
	}
}