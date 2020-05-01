import React from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './config/ReactotronConfig';

import Routes from './routes/index';
import history from './services/history';

import { store, persistor } from './store';

import './App.css';

function App() {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <Router history={history}>
                    <Routes />
                    <ToastContainer autoClose={5000} />
                </Router>
            </PersistGate>
        </Provider>
    );
}

export default App;
