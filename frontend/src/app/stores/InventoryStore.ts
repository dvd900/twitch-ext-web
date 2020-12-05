import { observable, computed, action } from 'mobx';
import { ItemModel } from 'app/models';
import { Spawn } from 'app/containers/TwitchApp';

export class InventoryStore {
  constructor() {}

  @observable
  selectedItem: ItemModel;

  @observable
  spawnedItems : Spawn[]= [];
  slideIndex = observable.box(1);

  @computed
  get selectedItemId(): number | 'no item' {
    if (this.selectedItem) {
      return this.selectedItem.itemId;
    } else {
      return 'no item';
    }
  }

  @computed
  get itemSelected(): boolean {
    return !(this.selectedItem == null);
  }

  @action
  selectItem = (selectedItem: ItemModel): void => {
    this.selectedItem = selectedItem;
  };

  @action
  incrementSlideIndex(inc: number) {
    this.slideIndex.set(inc);
  }

  @action
  addSpawn(spawn:Spawn){
    this.spawnedItems.push(spawn);
    setTimeout(()=>{
      console.log('removie')
      this.shiftSpawn();
    }, 5000)
  }

  @action
  shiftSpawn(){
    this.spawnedItems.shift()
  }
}

export default InventoryStore;
