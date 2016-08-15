module Animate {

	export interface IOptionsProject extends IReactWindowProps {
    }

    export interface IOptionsProjectState {
        errorMsg: string;
        errorMsgProjImg: string;
        loadingPercent: number;
    }

	/**
	 * A component for editing the project properties
	 */
	export class OptionsProject extends React.Component<IOptionsUser, IOptionsProjectState> {
		static defaultProps: IOptionsProject = {
		}

        /**
         * Creates a new instance
         */
        constructor( props : IOptionsProject) {
            super(props);
            this.state = {
                errorMsg: null,
                loadingPercent: 0,
                errorMsgProjImg: null
            };
        }

        /**
         * Draws the options JSX
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            return <div id='options-project'>
                <div className="group">
                    <div className="label group-header background">
                        Details
                    </div>
                    <form en-auto-clear en-change="ctrl.reportError(elm)" en-submit="!ctrl.reportError(elm) && ctrl.updateDetails(ctrl.$projectToken)">
                        <div className="group-content">
                            <div className="field-option">
                                <input name="name" className="background-view-light" type="text" en-className="{ 'bad-input' : elm.$error }" placeholder="Project Name" en-model="ctrl.$projectToken.name" en-validate="non-empty|no-html" />
                            </div>
                            <div className="field-option">
                                <input name="tags" className="background-view-light" type="text" placeholder="Keywords" en-model="ctrl.$projectToken.tags" en-transform="ctrl.$projectToken.tags.replace(/(\s*,\s*)+/g, ',').trim().split(',')" />
                            </div>
                            <div className="field-option">
                                <textarea name="description" className="background-view-light" style={{height: "180px"}} en-className="{error : elm.$error}" placeholder="Project Description" en-model="ctrl.$projectToken.description"></textarea>
                            </div>
                        </div>
                        <div className="field-option">
                            <div className="label">Visibility</div>
                            <div className="dropdown">
                                <select name="visibility" en-model="ctrl.$projectToken.public" en-transform="(elm.value == '0' ? false : true )">
                                    <option value="0" en-selected="!ctrl.$projectToken.public">Private</option>
                                    <option value="1" en-selected="ctrl.$projectToken.public">Public</option>
                                </select>
                            </div>
                            <div className="info soft-text">If public, your project will be searchable on the Webinate gallery.</div>
                        </div>

                        <div className="field-option">
                            <div className="label">Category</div>
                            <div className="dropdown">
                                <select name="category" en-model="ctrl.$projectToken.category" en-transform="parseInt(elm.value)">
                                    <option value="1" en-selected="ctrl.$projectToken.category == 1">Other</option>
                                    <option value="2" en-selected="ctrl.$projectToken.category == 2">Artistic</option>
                                    <option value="3" en-selected="ctrl.$projectToken.category == 3">Gaming</option>
                                    <option value="4" en-selected="ctrl.$projectToken.category == 4">Informative</option>
                                    <option value="5" en-selected="ctrl.$projectToken.category == 5">Musical</option>
                                    <option value="6" en-selected="ctrl.$projectToken.category == 6">Technical</option>
                                    <option value="7" en-selected="ctrl.$projectToken.category == 7">Promotional</option>
                                </select>
                            </div>
                            <div className="info soft-text">Optionally provide a project category. The default is 'Other'</div>
                        </div>
                        <div className="error" en-show="ctrl.$errorMsg != ''">{this.state.errorMsg}</div>
                        <input type="submit" className="button reg-gradient curve-small" en-className="{ disabled : ctrl.$loading }" value="Update Project Details" /><img en-show="ctrl.$loading" src="./media/loading-blue.gif" />
                    </form>
                </div>
                <div className="group" >
                    <div className="label group-header background">
                        Image
                    </div>
                    <div className="group-content">
                        <div className="img-preview unselectable">
                            <div className="preview-child">
                                <div className="background-tiles inner ng-scope">
                                    <img className="vert-align" en-src="ctrl.$project && (ctrl.$project.entry.image || './media/appling.png')" />
                                    <div className="div-center"></div>
                                </div>
                            </div>
                            <div className="item-name reg-gradient" id="upload-projet-img" en-click="ctrl.pickProjectPick()"><div className="cross"></div>Upload Image {this.state.loadingPercent}</div>
                        </div>
                        <div className="img-data">
                            <div className="info">
                                Upload an image for the project; this image will show up in the Animate gallery for others to see.
                                <br/><br/><span className="nb">Your application must have an image in order to be shown in the gallery.</span><br/><br/>
                                Your project image should be either a .png or .jpg image that is 200 by 200 pixels.
                                <div className="error" en-show="ctrl.$errorMsgProjImg && ctrl.$errorMsgProjImg != ''">{this.state.errorMsgProjImg}</div>
                            </div>
                        </div>
                        <div className="fix"></div>
                    </div>
                </div>
            </div>
        }
    }
}