import React from "react";
import { Spawn } from "app/containers/TwitchApp";
import { PositionProperty } from "csstype";
import * as style from './style.css';

interface SpawnProps{
    spawn: Spawn;
    element: HTMLAnchorElement;
}
export class SpawnAnimation extends React.Component<SpawnProps> {
    constructor(props, context){
        super(props,context)
    }

    render(){
        const {x, y} = this.props.spawn;
        const element = this.props.element;
        let coordX = x * element.offsetWidth;
        let coordY = y * element.offsetHeight;
        let size = 48
        let styles = {
            position: `absolute` as PositionProperty,
            width: `${size}px`,
            height: `${size}px`,
            top: coordY-size/2,
            left: coordX-size/2
        }
        return(
            <img className={style.fadeOut} style={styles} src='assets/icons/spawn_circle.gif'/>
        )

    }
}