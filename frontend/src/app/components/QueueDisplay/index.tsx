import * as React from 'react';
import { observer, inject } from 'mobx-react';
import * as style from './style.css';
import { STORE_QUEUE } from 'app/constants';
import { QueueStore } from 'app/stores';
import * as moment from 'moment';
import QueueRatio from '../QueueRatio';
import QueueTurn from '../QueueTurn';
export interface CreditsProps {
  credits: number;
  queue?: QueueStore;
}
export interface CreditsState {
  timeLeft: number;
}
@inject(STORE_QUEUE)
@observer
export class QueueDisplay extends React.Component<CreditsProps, CreditsState> {
  constructor(props?: CreditsProps, context?: any) {
    super(props, context);
    this.state = { timeLeft: 30 };
    setInterval(this.calculateTimeLeft.bind(this), 100);
  }

  get queue() {
    return this.props.queue;
  }

  calculateTimeLeft() {
    if (this.props) {
      let now = moment.default().valueOf();
      let timeLeft = (this.queue.nextTurn - now) / 1000;
      if (timeLeft <= 0) {
        this.queue.next();
        this.calculateTimeLeft();
        return;
      }
      this.setState({ timeLeft });
    }
  }

  render() {
    if (this.queue.isLoaded) {
      let userPlace = this.queue.usersPlace;
      let totalUsers = this.queue.queueList.length;
      return (
        <div className={style.queueContainer}>
          <div className={style.wrap}>
            <QueueRatio userPlace={userPlace} totalUsers={totalUsers} />
            <QueueTurn
              timeLeft={this.state.timeLeft}
              userName={this.props.queue.queueList[0].userName}
            />
          </div>
        </div>
      );
    }
    return null;
  }
}

export default QueueDisplay;
