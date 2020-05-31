import * as React from 'react';
import { observer, inject } from 'mobx-react';
import * as style from './style.css';
import { STORE_QUEUE } from 'app/constants';
import { QueueStore } from 'app/stores';
import * as moment from 'moment';
export interface CreditsProps {
  credits: number;
  queue?: QueueStore;
}
export interface CreditsState {
  timeLeft: number;
  hoverHeart: boolean;
  hoverSad: boolean;
}
@inject(STORE_QUEUE)
@observer
export class Credits extends React.Component<CreditsProps, CreditsState> {
  constructor(props?: CreditsProps, context?: any) {
    super(props, context);
    this.state = { timeLeft: 30, hoverHeart: false, hoverSad: false };
    setInterval(this.calculateTimeLeft.bind(this), 10);
  }

  get queue() {
    return this.props.queue;
  }

  calculateTimeLeft() {
    if (this.props) {
      let now = moment.default().unix();
      this.setState({ timeLeft: this.queue.nextTurn - now });
    }
  }

  hoverHeart(hoverHeart: boolean) {
    this.setState({ hoverHeart });
  }

  hoverSad(hoverSad: boolean) {
    console.log('hpversad');
    this.setState({ hoverSad });
  }

  render() {
    if (this.queue.isLoaded) {
      return (
        <div className={style.credits}>
          <div className={style.counter}>
            <div className={style.score}>
              <span className={style.scoreText}>200k</span>
            </div>
            <div className={style.score}>
              <span className={style.scoreText}>10k</span>
            </div>
          </div>
          <div className={style.counter}>
            <div className={style.score}>
              <img src="assets/icons/heart.svg"></img>
            </div>
            <div className={style.score}>
            <img src="assets/icons/sad_face.svg"></img>
            </div>
          </div>
          <div className={style.buttonBox}>
            <div className={style.buttonWrap}>
              <input
                onMouseEnter={(e) => this.hoverHeart(true)}
                onMouseLeave={(e) => this.hoverHeart(false)}
                type="image"
                src={"assets/icons/heart"+(this.state.hoverHeart ? '_filled' : '') + ".svg"}
                className={style.symbolButton}
              />
            </div>
            <div className={style.buttonWrap}>
              <input
                onMouseEnter={(e) => this.hoverSad(true)}
                onMouseLeave={(e) => this.hoverSad(false)}
                type="image"
                src={"assets/icons/sad_face"+(this.state.hoverSad ? '_filled' : '') + ".svg"}
                className={style.symbolButton}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
}

export default Credits;
