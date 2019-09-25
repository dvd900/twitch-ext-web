import { observable, computed, action } from 'mobx';
import {ItemModel } from 'app/models';

export class InventoryStore {

  constructor() {
  }

  @observable
  selectedItem:ItemModel;
  
  slideIndex = observable.box(0);

  @computed
  get selectedItemId(): number|'no item'{
    if(this.selectedItem){
      return this.selectedItem.itemId;
    }else{
      return 'no item'
    }
  }

  @computed
  get itemSelected():boolean{
    return ! (this.selectedItem== null);
  }

  @action
  selectItem = (selectedItem: ItemModel): void => {
    this.selectedItem = selectedItem;
  };

  @action
  incrementSlideIndex(inc:number){
    this.slideIndex.set(inc);
  }
}

export default InventoryStore;
