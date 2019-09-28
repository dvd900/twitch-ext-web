import * as React from 'react';
import * as style from './style.css';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';
import { STORE_USER, STORE_INVENTORY } from 'app/constants';
import Inventory from 'app/components/Inventory';
import Credits from 'app/components/Credits';
import { UserStore, InventoryStore } from 'app/stores';

export interface TwitchAppProps extends RouteComponentProps<any> {
  /** MobX Stores will be injected via @inject() **/
  user?: UserStore;
  inventory?: InventoryStore;
}

export interface TwitchAppState {}

@inject(STORE_INVENTORY, STORE_USER)
@observer
export class TwitchApp extends React.Component<TwitchAppProps, TwitchAppState> {
  element: HTMLAnchorElement;
  constructor(props: TwitchAppProps, context: any) {
    super(props, context);
    this.state = {};
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

  clickEvent(e) {
    //window.Twitch.ext.rig.log('hello')
    let x = e.pageX / this.element.offsetWidth;
    let y = e.pageY / this.element.offsetHeight;
    this.props.user.spawnItem({
      x,
      y,
      item: this.props.inventory.selectedItem
    });
    this.props.inventory.selectItem(null);
  }

  componentWillReceiveProps(nextProps: TwitchAppProps, nextContext: any) {}

  render() {
    const userStore = this.props[STORE_USER] as UserStore;
    if (userStore.isLoaded) {
      return (
        <a
          style={this.getCursorStyle()}
          ref={(element) => {
            this.element = element;
          }}
          onClick={(e) => this.clickEvent(e)}
          className={style.container}
        >
          <Inventory credits={100}> </Inventory>
          <Credits credits={this.props.user.credits} />
        </a>
      );
    } else {
      return null;
    }
  }
}
