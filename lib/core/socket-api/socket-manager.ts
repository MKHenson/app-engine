namespace Animate {



    /**
     * A singleton class that deals with comminication between the client frontend
     * and the socket backends.
     */
    export class SocketManager extends EventDispatcher {

        private static _singleton: SocketManager;
        private _usersSocket: WebSocket;

        /**
         * Creates the singleton
         */
        constructor() {
            super();

            SocketManager._singleton = this;
        }

        /**
         * Attempts to reconnect when the socket loses its connection
         */
        private _reConnect( e: CloseEvent ) {
            setTimeout(() => {
                this.connect();
            }, 5000 );
        }

        /**
         * Called whenever we get a message from the users socket API
         * @param {MessageEvent} e
         */
        onMessage( e: MessageEvent ) {
            try {
                let json: UsersInterface.SocketTokens.IToken = JSON.parse( e.data );
                if ( json.error ) {
                    let type: SocketEvents = 'Error';
                    this.emit<SocketEvents, ISocketEvent>( type, { error: new Error( json.error ) } );
                }
                else {
                    let type = json.type as SocketEvents;
                    this.emit<SocketEvents, ISocketEvent>( type, { json : json } );
                }
            }
            catch ( e ) {
                let type: SocketEvents = 'Error';
                this.emit<SocketEvents, ISocketEvent>( type, { error : e } );
            }
        }

        /**
         * Called whenever an error occurs
         * @param {Error} e
         */
        onError( e: Error ) {
            this._reConnect( null );
            let type: SocketEvents = 'Error';
            this.emit<SocketEvents, ISocketEvent>( type, { error: new Error( 'An error occurred while connecting to the Users socket API' ) } );
        }

        /**
         * Attempts to connect to the user's socket api
         */
        connect() {
            if ( this._usersSocket ) {
                this._usersSocket.onerror = null;
                this._usersSocket.onclose = null;
                this._usersSocket.onmessage = null;
            }

            this._usersSocket = new WebSocket( DB.USERS_SOCKET );
            this._usersSocket.onerror = this.onError.bind( this );
            this._usersSocket.onclose = this._reConnect.bind( this );
            this._usersSocket.onmessage = this.onMessage.bind( this );
        }

        /**
         * Gets the singleton
         * @returns {SocketManager}
         */
        static get get(): SocketManager {
            return SocketManager._singleton;
        }
    }
}