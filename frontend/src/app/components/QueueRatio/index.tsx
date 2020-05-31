import * as React from 'react';
import * as style from './style.css';
export interface CreditsProps {
  userPlace: number;
  totalUsers: number;
}
export interface CreditsState {}
export class QueueRatio extends React.Component<any, CreditsState> {
  constructor(props?: CreditsProps, context?: any) {
    super(props, context);
  }

  render() {
    return (
      <span className={style.container}>
        <div className={style.userPlace}>
          <div className={style.you}>You</div>
          <div className={style.number}>{this.props.userPlace}</div>
        </div>
        <span className={style.outOf}> / {this.props.totalUsers}</span>
      </span>
    );
  }
}

export default QueueRatio;
