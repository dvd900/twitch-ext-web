export class ItemModel {
  readonly icon: string;
  readonly itemId: number;
  readonly cost: number;

  constructor(icon: string, itemId: number, cost: number) {
    this.icon = icon;
    this.itemId = itemId;
    this.cost = cost;
  }
}

export default ItemModel;
