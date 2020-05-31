import * as React from 'react';
import * as style from './style.css';
export interface TurnProps {
  timeLeft: number;
  userName: string;
}

export class QueueTurn extends React.Component<TurnProps, any> {
  constructor(props?: TurnProps, context?: any) {
    super(props, context);
  }

  render() {
    return (
      <div>
        <span className={style.container}>
          <div>
            <div>{this.props.userName}</div>
            <div className={style.loadingBarWrap}>
              <div
                style={{ width: (this.props.timeLeft / 30) * 100 + '%' }}
                className={style.loadingBar}
              />
            </div>
          </div>
          <div className={style.time}>{Math.round(this.props.timeLeft)}s</div>
        </span>
      </div>
    );
  }
}

export default QueueTurn;
