import * as React from 'react';
import css from './App.module.css';
import { Map } from './components/Map';

export const App: React.FC = () => (
    <div className={css.container}>
        <Map />
    </div>
);
