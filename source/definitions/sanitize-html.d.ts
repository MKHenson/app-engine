declare module "sanitize-html"
{
	function sanitizeHtml( html: string, options?: { allowedTags?: Array<string>; allowedAttributes?: any; selfClosing?: Array<string>; allowedSchemes?: Array<string>; }): string;    
	
	export = sanitizeHtml;
}