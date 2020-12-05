import * as React from 'react';
import { observer, inject } from 'mobx-react';
import * as style from './style.css';
import { STORE_QUEUE } from 'app/constants';
import { QueueStore } from 'app/stores';

interface StatusProps{
    queue?: QueueStore;
}

@inject(STORE_QUEUE)
@observer
export class Status extends React.Component<StatusProps,any> {
    constructor(props, context){
        super(props,context)
    }
    
    render(){
        if (this.props.queue.isLoaded && this.props.queue.usersPlace===1) {
            let text = this.props.queue.itemSpawned ? 'nice!!!': 'chose an item'
            return(
                <div className={style.status}>{text}</div>
            )
        }
        return null;
    }
}