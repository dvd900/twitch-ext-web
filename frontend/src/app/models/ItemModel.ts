export class ItemModel {
  readonly icon: string;
  readonly itemId: number;
  readonly cost: number;

  constructor(icon, itemId, cost) {
    this.icon = icon;
    this.itemId = itemId;
    this.cost = cost;
  }
}

export default ItemModel;
