import * as React from 'react';
import { observer } from 'mobx-react';
import * as style from './style.css';
export interface CreditsProps {
    credits:number;
}


@observer
export class Inventory extends React.Component<CreditsProps> {
  
  constructor(props?: CreditsProps, context?: any) {
    super(props, context);
    this.state = {};
    this.child = React.createRef();
  }
  child;
  slideIndex = 0;
  handleSlideInc(e:React.MouseEvent,inc:number){
    e.stopPropagation();
  }

  render() {

    return (
      <div className={style.credits}>{this.props.credits}</div>  
    );
  }
}

export default Inventory;