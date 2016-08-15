module Animate {

	export interface IOptionsUserProps {
    }

    export interface IOptionsUserStats {
        loadingPercent: number;
        errorMsgUserImg: string;
    }



	/**
	 * A component for editing the user properties
	 */
	export class OptionsUser extends React.Component<IOptionsUserProps, any> {
		static defaultProps: IOptionsUserProps = {
		}

        /**
         * Creates a new instance
         */
        constructor( props : IOptionsUserProps) {
            super(props);
            this.state = {
                loadingPercent: 0,
                errorMsgUserImg: null
            };
        }

        /**
         * Draws the options JSX
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            let user = User.get;

            return <div id='options-user'>
                <div className="group">
                    <div className="label group-header background">
                        Details
                    </div>
                    <div className="group-content">
                        <div className="field-option">
                            <div className="label">Username: <span className="soft-text">{user.entry.username}</span></div>
                            <div className="fix"></div>
                        </div>
                        <div className="field-option">
                            <div className="label">Email: <span className="soft-text">{user.entry.email}</span></div>
                            <div className="fix"></div>
                        </div>
                        <div className="field-option">
                            <div className="label">Joined On: <span className="soft-text">{new Date(user.entry.createdOn).toLocaleDateString()} {new Date(user.entry.createdOn).toLocaleTimeString()}</span></div>
                            <div className="fix"></div>
                        </div>
                        <div className="field-option">
                            <div className="label">Joined On: <span className="soft-text">{new Date(user.entry.lastLoggedIn).toLocaleDateString()} {new Date(user.entry.lastLoggedIn).toLocaleTimeString()}</span></div>
                            <div className="fix"></div>
                        </div>
                    </div>
                </div>
                <div className="group">
                    <div className="label group-header background">Avatar</div>
                    <div className="group-content">
                        <div className="img-preview unselectable">
                            <div className="preview-child">
                                <div className="background-tiles inner ng-scope">
                                    <img className="vert-align" en-src="( Animate.User.get.meta.image && Animate.User.get.meta.image.trim() != '' ? Animate.User.get.meta.image : './media/appling.png')" />
                                    <div className="div-center"></div>
                                </div>
                            </div>
                            <div className="item-name reg-gradient" id="upload-projet-img" en-click="ctrl.pickAvatar()"><div className="cross"></div>Upload Image {this.state.loadingPercent}</div>
                        </div>
                        <div className="img-data">
                            <div className="info">Your avatar is the image others see you as. Use the upload button to change your profile picture.</div>
                        </div>
                        <div className="error" en-show="ctrl.$errorMsgUserImg && ctrl.$errorMsgUserImg != ''">{this.state.errorMsgUserImg}</div>
                        <div className="fix"></div>
                    </div>
                </div>
                <div className="group">
                    <div className="label group-header background">
                        User information
                    </div>
                    <div className="group-content">
                        <div className="field-option">
                            <div className="label">Bio</div>
                            <textarea id="meta-bio" className="background-view-light">{user.meta.bio}</textarea>
                            <div className="soft-text info">Use the above pad to write about yourself. This will show up on Webinate next to your projects.</div>
                            <div className="fix"></div>
                        </div>
                        <div className="error" en-show="ctrl.$errorMsgImg != ''">{this.state.errorMsgUserImg}</div>
                        <div className="button reg-gradient curve-small"  en-click="ctrl.updateBio(jQuery('#meta-bio').val());" en-className="{ disabled : ctrl.$loading }">Update Information</div>
                    </div>
                </div>
            </div>
        }
    }
}