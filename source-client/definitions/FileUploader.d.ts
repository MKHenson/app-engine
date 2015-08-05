interface FileUploaderAPI
{
	FileUploaderBasic( val: any ): void;
}

interface FileUploaderBasic
{
	setParams( params: any ): void;
	_uploadFileList( val: any ): void;
	_options: any;
}

declare var qq: FileUploaderAPI;