
interface AceCommands
{
	addCommand( val: any );
	removeCommand( val : any );
}

interface AceSelection
{
	moveCursorFileStart();
}

interface AceSession
{
	setMode(mode: string);
}

interface AceEditor
{
	setTheme( theme: string );
	getValue(): string;
	setValue( text: string );
	getSession(): AceSession;
	selection: AceSelection;
	commands: AceCommands;
	on( event: string, func: any );
	off( event: string, func: any );
	removeAllListeners( val: any );
	destroy();
	resize();
	insert( val: any );
	focus();
}

interface AceStatic
{
	edit(id: any): AceEditor;
}

declare var ace : AceStatic;