import * as React from 'react';
import * as style from './style.css';
import { ItemModel } from 'app/models';
import ItemButton from '../ItemButton';
import { STORE_INVENTORY, STORE_QUEUE } from 'app/constants';
import { inject, observer } from 'mobx-react';
import { InventoryStore, QueueStore } from 'app/stores';



export interface InventoryProps {
  credits: number;
  inventory?: InventoryStore;
  queue?: QueueStore;
}
export interface InventoryState {}
@inject(STORE_INVENTORY, STORE_QUEUE)
@observer
export class Inventory extends React.Component<InventoryProps, InventoryState> {
  items: ItemModel[] = [
    new ItemModel('item_apple', 0, 1),
    new ItemModel('item_bomb', 1, -1)
  ];

  constructor(props?: InventoryProps, context?: any) {
    super(props, context);
    this.state = {};
    this.child = React.createRef();
  }
  child;
  slideIndex = 0;
  handleSlideInc(e: React.MouseEvent, inc: number) {
    e.stopPropagation();
    if (
      this.props.inventory.slideIndex.get() + inc >= 0 &&
      this.props.inventory.slideIndex.get() + inc < 3
    )
      this.props.inventory.slideIndex.set(
        this.props.inventory.slideIndex.get() + inc
      );
  }

  render() {
    let disabled = this.props.queue.usersPlace !== 1;
    let inventoryStyles= [style.inventory];
    if(disabled){
      inventoryStyles.push(style.disabled);
    }
    const myStyle = {
      backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDMuMTMiIGhlaWdodD0iODMuMzciIHZpZXdCb3g9IjAgMCAyMDMuMTMgODMuMzciPjx0aXRsZT5Bc3NldCAyMjwvdGl0bGU+PHBhdGggZD0iTTE1NC4zOSw4My4wOGE0NTcuNDksNDU3LjQ5LDAsMCwwLTEwNS42NSwwQzI3LjA4LDg1LjU1LDUuNjMsNzEuODQuODEsNTAuMzR2MEMtNCwyOC44OSwxMy4yNSw2LjY0LDM5LjQ4LDMuNmE1MzcuMTUsNTM3LjE1LDAsMCwxLDEyNC4xNywwYzI2LjIzLDMsNDMuNSwyNS4yOSwzOC42Nyw0Ni43MnYwQzE5Ny41LDcxLjg0LDE3Ni4wNSw4NS41NSwxNTQuMzksODMuMDhaIiBmaWxsPSIjODdjMzU5Ii8+PC9zdmc+")'
    }
    return (
      <div className={style.wrap}>
        <div style={myStyle} className={inventoryStyles.join(' ')}>
          <div className={style.inventoryWrap}>
            {this.items.map((item) => (
              <ItemButton
                disabled= {disabled}
                key={item.icon}
                isPressed={item.itemId === this.props.inventory.selectedItemId}
                selectItem={this.props.inventory.selectItem}
                item={item}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Inventory;
