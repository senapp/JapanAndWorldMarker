import * as React from 'react';
import { useState } from 'react';
import css from './Button.module.css';

type Props = {
    label: string;
    onClick: () => void;
    className?: string;
    disable?: boolean;
}

export const Button: React.FC<Props> = ({ onClick, label, className = '', disable = false }) => {
    const [clicked, setClicked] = useState(false);

    const onButtonClicked = (): void => {
        setClicked(!clicked);
        onClick();
    };

    return (
        <div className={`${css.button} ${className} ${disable && css.disable}`.trimEnd()} onClick={onButtonClicked}>
            {label}
        </div>
    );
};
