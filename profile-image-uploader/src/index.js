import React from 'react';
import ReactDOM from 'react-dom';
import ProfileImageUploader from './ProfileImageUploader';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<ProfileImageUploader />, document.getElementById('root'));
registerServiceWorker();
