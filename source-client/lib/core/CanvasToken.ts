module Animate
{
	export class CanvasTokenPortal
	{
		public name: string = "";
		public value: string = "";
		public type: PortalType = PortalType.INPUT;
		public dataType: ParameterType = null;
		public customPortal: boolean = false;

		constructor( token?: any )
		{
			if ( token )
			{
				this.name = token.name;
				this.value = token.value;
				this.type = PortalType.fromString( token.type.value );
				this.dataType = ParameterType.fromString( token.dataType.value );
				this.customPortal = token.customPortal;
			}
		}
	}

	export class CanvasTokenItem
	{
		public id: string = "";
		public type: string = "";
		public left: string = "";
		public top: string = "";
		public zIndex: string = "";
		public position: string = "";
		public text: string = "";
		public name: string = "";
		public alias: string = "";

		// Asset items
		public assetID: number = 0;

		// Script items
		public shallowId: number = 0;

		public containerId: number = 0;

		public behaviourID: string;

		// Portal Items
		public portalType: PortalType = PortalType.PARAMETER;
		public dataType: ParameterType = ParameterType.OBJECT;
		public value: string;

		public portals: Array<CanvasTokenPortal> = new Array();

		// Links
		public frameDelay: number;
		public startPortal: string;
		public endPortal: string;
		public startBehaviour: string;
		public endBehaviour: string;

		// Additional data for shortcuts
		public targetStartBehaviour: string;
		public targetEndBehaviour: string;

		constructor( token?: any )
		{
			if ( token )
			{
				this.id = token.id;
				this.type = token.type;
				this.left = token.left;
				this.top = token.top;
				this.zIndex = token.zIndex;
				this.position = token.position;
				this.text = token.text;
				this.name = token.name;
				this.alias = token.alias;

				// Asset items
				this.assetID = token.assetID;

				// Script items
				this.shallowId = token.shallowId;

				this.containerId = token.containerId;

				this.behaviourID = token.behaviourID;

				// Portal Items
				this.portalType = PortalType.fromString( token.portalType.value );
				this.dataType = ParameterType.fromString( token.dataType.value );
				this.value = token.value;

				for ( var i = 0, len = token.portals.length; i < len; i++ )
					this.portals.push( new CanvasTokenPortal( token.portals[i] ) );

				// Links
				this.frameDelay = token.frameDelay;
				this.startPortal = token.startPortal;
				this.endPortal = token.endPortal;
				this.startBehaviour = token.startBehaviour;
				this.endBehaviour = token.endBehaviour;

				// Additional data for shortcuts
				this.targetStartBehaviour = token.targetStartBehaviour;
				this.targetEndBehaviour = token.targetEndBehaviour;
			}
		}
	}

	export class CanvasToken
	{
		public id: number;
		public name: string;
		public items: Array<CanvasTokenItem> = new Array<CanvasTokenItem>();
		public properties: Array<EditableSetToken> = new Array< EditableSetToken>();
		public plugins: any = {};

		constructor( id: number )
		{
			this.id = id;
		}

		public toString() : string
		{
			return JSON.stringify( this );
		}

		public fromDatabase( json: any ): CanvasToken
		{
			var obj: any = json;

			this.name = obj.name;

			if ( obj.items )
			{
				for ( var i = 0, len = obj.items.length; i < len; i++ )
					this.items.push( new CanvasTokenItem( obj.items[i] ) );
			}

			if ( obj.plugins )
				this.plugins = obj.plugins;

			if ( obj.properties )
				this.plugins = obj.properties;

			return this;
		}

		public static fromDatabase( json: any, id : number ): CanvasToken
		{
			var toRet: CanvasToken = new CanvasToken( id );
			return toRet.fromDatabase( json );
		}
	}
}