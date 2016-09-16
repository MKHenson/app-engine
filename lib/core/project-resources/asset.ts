namespace Animate {

    export namespace Resources {

		/**
		* Assets are resources with a list of editable properties. Typically assets are made from templates defined in plugins.
		* They define the objects you can interact with in an application. For example, a cat plugin might define an asset template
		* called Cat which allows you to create a cat asset in the application. The properties of the cat asset would be defined by
		* the plugin.
		*/
        export class Asset extends ProjectResource<Engine.IAsset> {
            public class: AssetClass;

			/**
			* @param assetClass The name of the 'class' or 'template' that this asset belongs to
			* @param entry [Optional] The asset database entry
			*/
            constructor( assetClass: AssetClass, entry?: Engine.IAsset ) {
                super( entry );

                this.class = assetClass;

                // Build the properties from the asset class
                this.properties = assetClass.buildVariables();
            }

			/**
			* Writes this assset to a readable string
			*/
            toString() {
                return this.entry.name + '(' + this.entry.shallowId + ')';
            }

			/**
			* Use this function to reset the asset properties
			* @param name The name of the asset
			* @param className The 'class' or 'template' name of the asset
			* @param json The JSON data of the asset.
			*/
            update( name: string, className: string, json: any = {}) {
                this.entry.name = name;
                this.saved = true;
                this.properties = json;
                this.entry.className = className;
            }

			/**
			* Disposes and cleans up the data of this asset
			*/
            dispose() {
                super.dispose();
                this.class = null;
            }
        }
    }
}