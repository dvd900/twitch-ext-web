import * as React from 'react';
import * as style from './style.css';

export interface LikesProps {
  likes?: number;
  dislikes?: number;
}
export interface LikesState {}
export class Likes extends React.Component<LikesProps, LikesState> {
  constructor(props?: LikesProps, context?: any) {
    super(props, context);
    this.state = {};
  }

  render() {
    return <div className={style.wrap}>helloooo</div>;
  }
}

export default Likes;
