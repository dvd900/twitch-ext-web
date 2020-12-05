import * as React from 'react';
import * as style from './style.css';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';
import { STORE_USER, STORE_INVENTORY } from 'app/constants';
import Inventory from 'app/components/Inventory2';
//import Credits from 'app/components/Credits';
import { UserStore, InventoryStore } from 'app/stores';
//import { QueueDisplay } from 'app/components/QueueDisplay';
import { SpawnAnimation } from 'app/components/SpawnAnimation';

export interface TwitchAppProps extends RouteComponentProps<any> {
  /** MobX Stores will be injected via @inject() **/
  user?: UserStore;
  inventory?: InventoryStore;
}
export interface Spawn{
  userName: string;
  x: number;
  y: number;
}
export interface TwitchAppState {
  spawns:Spawn[]
  canSpawn:boolean
  timeRemaining: number
}
@inject(STORE_INVENTORY, STORE_USER)
@observer
export class TwitchApp extends React.Component<TwitchAppProps, TwitchAppState> {
  element: HTMLAnchorElement;
  constructor(props: TwitchAppProps, context: any) {
    super(props, context);
    this.state = {spawns:[], canSpawn:true, timeRemaining: 0};
  }

  componentDidMount() {}

  componentWillMount() {}

  getCursorStyle() {
    if (this.props.inventory.itemSelected) {
      return {
        cursor:
          'url(' +
          'assets/icons/' +
          this.props.inventory.selectedItem.icon +
          '.svg) 2 2, pointer'
      };
    } else {
      null;
    }
  }

  clickEvent(e:React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.stopPropagation();
    if(this.props.inventory.selectedItem == null){
      return;
    }

    let x = e.pageX / this.element.offsetWidth;
    let y = e.pageY / this.element.offsetHeight;
    let spawn:Spawn = {x, y, userName:''}
    this.props.user.spawnItem({
      x,
      y,
      item: this.props.inventory.selectedItem
    });
    this.setState({canSpawn: false, timeRemaining:5000});
    this.props.inventory.addSpawn(spawn);
    var countdown = ()=>{
      let timeRemaining = this.state.timeRemaining-1000;
      this.setState({canSpawn:timeRemaining<0, timeRemaining:timeRemaining});
      if(!(timeRemaining<0)){
        setTimeout(countdown, 1000)
      }

    }
    setTimeout(countdown, 1000)
    this.props.inventory.selectItem(null);
  }

  componentWillReceiveProps(nextProps: TwitchAppProps, nextContext: any) {}

  render() {
    const userStore = this.props[STORE_USER] as UserStore;
    if (userStore.isLoaded) {
      return (
        <a
          onDoubleClick= { (e) => { e.preventDefault(); e.stopPropagation()}}
          style={this.getCursorStyle()}
          ref={(element) => {
            this.element = element;
          }}
          onClick={(e) => this.clickEvent(e)}
          className={style.container}
        >
          {this.props.inventory.spawnedItems.map((spawn,id)=>(
            <SpawnAnimation key={id} spawn={spawn} element={this.element}></SpawnAnimation>
          ))}
          <div className={style.inventoryWrap}>
            <Inventory timeRemaining={this.state.timeRemaining} canSpawn={this.state.canSpawn} credits={100}> </Inventory>
          </div>
          {
           //         <div className={style.wrap}>
           //         <QueueDisplay credits={this.props.user.credits} />
           //         <Inventory timeRemaining={this.state.timeRemaining} canSpawn={this.state.canSpawn} credits={100}> </Inventory>
           //         <Credits credits={this.props.user.credits} />
           //       </div>
          }

        </a>
      );
    } else {
      return null;
    }
  }
}
