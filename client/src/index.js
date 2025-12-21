import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {Provider} from "react-redux";
import store from 'state/store';
import {Toaster} from "react-hot-toast"
import { LocalizationProvider } from '@mui/x-date-pickers';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>

        <Provider store={store}>
            <App/>
            <Toaster
                position="bottom-right"
            />
        </Provider>

    </React.StrictMode>
);

