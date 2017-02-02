import './setup/emitters';
import { JML } from './jml/jml';
import { ButtonPrimary, ButtonError, ButtonLink, ButtonSuccess } from './components/buttons/buttons';
import { Attention } from './components/attention/attention';
import { ValidatedText } from './components/validated-text/validated-text';
import { ValidatedSelect } from './components/validated-select/validated-select';
import { Checkbox } from './components/checkbox/checkbox';
import { JsonForm } from './components/json-form/json-form';
import { Group } from './components/group/group';
import { Popup } from './components/popup/popup';
import { Menu } from './components/menu/menu';
import { IconMenu } from './components/icon-menu/icon-menu';
import { Window } from './components/window/window';
import { MessageBox } from './components/forms/message-box/message-box';

import { SplitPanel } from './components/split-panel/split-panel';
import { LoginForm } from './components/login-form/login-form';
import { RegisterForm } from './components/register-form/register-form';

import { LoginWidget } from './containers/login-widget/login-widget';
import { Application } from './containers/application/application';
import { Splash } from './containers/splash/splash';



// Once the document is ready we begin
// initialize();
customElements.define( 'x-attention', Attention );
customElements.define( 'x-checkbox', Checkbox );
customElements.define( 'x-validated-text', ValidatedText );
customElements.define( 'x-validated-select', ValidatedSelect );
customElements.define( 'x-primary', ButtonPrimary, { extends: 'button' });
customElements.define( 'x-error', ButtonError, { extends: 'button' });
customElements.define( 'x-link', ButtonLink, { extends: 'button' });
customElements.define( 'x-success', ButtonSuccess, { extends: 'button' });
customElements.define( 'x-json-form', JsonForm, { extends: 'form' });
customElements.define( 'x-login-form', LoginForm );
customElements.define( 'x-register-form', RegisterForm );
customElements.define( 'x-split-panel', SplitPanel );
customElements.define( 'x-popup', Popup );
customElements.define( 'x-menu', Menu );
customElements.define( 'x-icon-menu', IconMenu );
customElements.define( 'x-splash', Splash );
customElements.define( 'x-login-widget', LoginWidget );
customElements.define( 'x-application', Application );
customElements.define( 'x-group', Group );
customElements.define( 'x-window', Window );
customElements.define( 'x-message-box', MessageBox );

document.body.appendChild( JML.elm( new Application() ) );

MessageBox.error( 'Hooray this is a message box!', [ 'Ok..?', 'Cancel this now!' ] )
    .then(( button ) => {
        alert( 'error! ' + button );
        return MessageBox.success( 'Hooray this is a success!', [ 'Ok..?', 'Cancel this now!' ] );
    }).then(( button ) => {
        alert( 'success! ' + button );
        return MessageBox.show( 'Hooray this is a success!', [ 'Ok..?', 'Cancel this now!' ] );
    }).then(( button ) => {
        alert( 'Yay?! ' + button );
    })