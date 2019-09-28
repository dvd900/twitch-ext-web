import * as React from 'react';
import { ItemModel } from 'app/models';
import * as style from './style.css';
import cx from 'classnames';
import { observer } from 'mobx-react';
export interface ItemButtonProps {
  item: ItemModel;
  isPressed: boolean;
  selectItem: (item: ItemModel) => any;
}
export interface ItemButtonState {}
@observer
export class ItemButton extends React.Component<
  ItemButtonProps,
  ItemButtonState
> {
  constructor(props?: ItemButtonProps, context?: any) {
    super(props, context);
    this.state = {};
  }

  itemClicked = (e) => {
    e.stopPropagation();
    this.props.selectItem(this.props.item);
  };

  getCursorStyle = () => {
    if (this.props.isPressed) {
      return {
        cursor:
          'url(' + 'assets/icons/' + this.props.item.icon + '.svg) 2 2, pointer'
      };
    } else {
      return { cursor: 'pointer' };
    }
  };

  render() {
    return (
      <div onClick={(e) => this.itemClicked(e)} className={'item'}>
        <input
          style={this.getCursorStyle()}
          className={cx(style.Button, {
            [style.pressed]: this.props.isPressed
          })}
          type="image"
          src={
            'assets/icons/' +
            this.props.item.icon +
            (this.props.isPressed ? '_outline' : '') +
            '.svg'
          }
        />
        <span className={style.price}>{this.props.item.cost}</span>
      </div>
    );
  }
}

export default ItemButton;
