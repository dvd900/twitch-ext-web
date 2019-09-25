import * as React from 'react';
import * as style from './style.css';
import { ItemModel } from 'app/models';
import ItemButton from '../ItemButton';
import { STORE_INVENTORY, STORE_USER } from 'app/constants';
import { inject, observer } from 'mobx-react';
import { InventoryStore} from 'app/stores';
import Carousel from 'nuka-carousel';
import cx from 'classnames'

export interface InventoryProps {
  credits: number;
  inventory?: InventoryStore
}
export interface InventoryState {

}
@inject(STORE_INVENTORY, STORE_USER)
@observer
export class Inventory extends React.Component<InventoryProps, InventoryState> {
  items: ItemModel[] = [new ItemModel('item_apple',0,10),
                        new ItemModel('item_mushroom',1,10),
                        new ItemModel('item_soda',2,10)]

  constructor(props?: InventoryProps, context?: any) {
    super(props, context);
    this.state = {};
    this.child = React.createRef();
  }
  child;
  slideIndex = 0;
  handleSlideInc(e:React.MouseEvent,inc:number){
    e.stopPropagation();
    if(this.props.inventory.slideIndex.get()+inc>=0 && this.props.inventory.slideIndex.get()+inc<3)
    this.props.inventory.slideIndex.set(this.props.inventory.slideIndex.get()+inc);
  }

  render() {

    return (
    <div className={style.inventoryWrap}> 
      <div className={style.inventory}>
      <input className={cx(style.button,style.left)} type="image" src={"assets/icons/btn_arrow_left.svg"} onClick={(e)=>{this.handleSlideInc(e,-1)}}></input>
        <Carousel ref={this.child} afterSlide={slideIndex => this.props.inventory.slideIndex.set(this.props.inventory.slideIndex.get())} dragging={false} withoutControls={true} slideIndex={this.props.inventory.slideIndex.get()} className={style.slider} width={'70%'} slidesToShow={3}>
          {this.items.map((item) => (
            <ItemButton isPressed={item.itemId === this.props.inventory.selectedItemId} selectItem={this.props.inventory.selectItem} item={item} />
          ))}
        </Carousel>
        <input className={cx(style.button)} type="image" src={"assets/icons/btn_arrow.svg"} onClick={(e)=>{this.handleSlideInc(e,1)}}></input>
      </div>
    </div>);
  }
}

export default Inventory;