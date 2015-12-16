module Animate
{
    export function createProperty(data: any, set: EditableSet)
    {
        if (!data.hasOwnProperty("type"))
            return null;

        var type: PropertyType = data.type;
        var prop: Prop<any>;

        switch (type)
        {
            case PropertyType.ASSET:
                prop = new PropResource(null, null, null);
                break;
            case PropertyType.ASSET_LIST:
                prop = new PropResourceList(null, null, null);
                break;
            case PropertyType.BOOL:
                prop = new PropBool(null, null);
                break;
            case PropertyType.ENUM:
                prop = new PropEnum(null, null, null);
                break;
            case PropertyType.FILE:
                prop = new PropFileResource(null, null, null);
                break;
            case PropertyType.GROUP:
                prop = new PropResource(null, null, null);
                break;
            //TODO: We dont have hidden props yet
            case PropertyType.HIDDEN:
                break;
            //TODO: We dont have hidden props yet
            case PropertyType.HIDDEN_FILE:
                break;
            case PropertyType.NUMBER:
                prop = new PropNum(null, null);
                break;
             //TODO: We dont have objecy props yet
            case PropertyType.OBJECT:
                break;
            //TODO: We dont have objecy props yet
            case PropertyType.OPTIONS:
                break;
            case PropertyType.STRING:
                prop = new PropText(null, null);
                break;
        }

        if (prop)
            prop.set = set;
    }
}