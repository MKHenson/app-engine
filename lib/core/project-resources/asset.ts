module Animate {

	export module Resources {

		/**
		* Assets are resources with a list of editable properties. Typically assets are made from templates defined in plugins.
		* They define the objects you can interact with in an application. For example, a cat plugin might define an asset template
		* called Cat which allows you to create a cat asset in the application. The properties of the cat asset would be defined by
		* the plugin.
		*/
		export class Asset extends ProjectResource<Engine.IAsset> {
			public class: AssetClass;

			/**
			* @param {AssetClass} assetClass The name of the "class" or "template" that this asset belongs to
			* @param {IAsset} entry [Optional] The asset database entry
			*/
			constructor(assetClass: AssetClass, entry?: Engine.IAsset) {
				super(entry);

				this.class = assetClass;

				// Build the properties from the asset class
				this.properties = assetClass.buildVariables();

				//this._options = {};
				//this.id = id;
				//this.shallowId = shallowId;
				//this.name = name;
				//this.saved = true;
				//this._properties = new EditableSet();

				//if ( entry.json )
				//   this.setProperties(<Array<EditableSetToken>>entry.json);

				//this._className = entry.className;
			}

			//static getNewLocalId(): number
			//{
			//	Asset.shallowIds++;
			//	return Asset.shallowIds;
			//}

			/**
			* Writes this assset to a readable string
			* @returns {string}
			*/
			toString() {
				return this.entry.name + "(" + this.entry.shallowId + ")";
			}

			/**
			* Use this function to reset the asset properties
			* @param {string} name The name of the asset
			* @param {string} className The "class" or "template" name of the asset
			* @param {any} json The JSON data of the asset.
			*/
			update( name: string, className : string, json: any = {} ) {
				this.entry.name = name;
				this.saved = true;
				this.properties = json;
				this.entry.className = className;
			}

			/**
			* Disposes and cleans up the data of this asset
			*/
			dispose() {
				//Call super
				super.dispose();

				this.class = null;
				//this.id = null;
				//this.name = null;
				//this._properties = null;
				//this._className = null;
				//this._options = null;
			}

			//get className(): string { return this._className; }

		}
	}
}