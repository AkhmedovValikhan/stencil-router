import { Component, Prop, Element, Watch, ComponentInterface } from '@stencil/core';
import { matchPath, matchesAreEqual } from '../../utils/match-path';
import { RouterHistory, LocationSegments, MatchResults, RouteViewOptions, HistoryType, RouteRenderProps } from '../../global/interfaces';
import ActiveRouter from '../../global/active-router';

/**
  * @name Route
  * @module ionic
  * @description
 */
@Component({
  tag: 'stencil-route',
  styleUrl: 'route.css'
})
export class Route implements ComponentInterface {
  @Prop({ reflectToAttr: true }) group: string | null = null;
  @Prop() componentUpdated?: (options: RouteViewOptions) => void;
  @Prop({ mutable: true }) match: MatchResults | null = null;

  @Prop() url?: string | string[];
  @Prop() component?: string;
  @Prop() componentProps?: { [key: string]: any } = {};
  @Prop() exact: boolean = false;
  @Prop() routeRender?: (props: RouteRenderProps) => any;
  @Prop() scrollTopOffset?: number;
  @Prop() routeViewsUpdated?: (options: RouteViewOptions) => void;

  @Prop() location?: LocationSegments;
  @Prop() history?: RouterHistory;
  @Prop() historyType?: HistoryType;


  @Element() el!: HTMLStencilRouteElement;

  componentDidRerender: Function | undefined;
  scrollOnNextRender: boolean = false;
  previousMatch: MatchResults | null = null;

  // Identify if the current route is a match.
  @Watch('location')
  computeMatch(newLocation: LocationSegments) {
    const isGrouped = this.group != null || (this.el.parentElement != null && this.el.parentElement.tagName.toLowerCase() === 'stencil-route-switch');

    if (!newLocation || isGrouped) {
      return;
    }

    this.previousMatch = this.match;
    return this.match = matchPath(newLocation.pathname, {
      path: this.url,
      exact: this.exact,
      strict: true
    });
  }


  async loadCompleted() {
    let routeViewOptions: RouteViewOptions = {};

    if (this.history && this.history.location.hash) {
      routeViewOptions = {
        scrollToId: this.history.location.hash.substr(1)
      }
    } else if (this.scrollTopOffset) {
      routeViewOptions = {
        scrollTopOffset: this.scrollTopOffset
      }
    }
    if (this.match) {
      const outlet = document.getElementsByTagName('stencil-router-outlet')[0];
      outlet.history = this.history;
      outlet.match = this.match;
      outlet.component = this.component;
      outlet.componentProps = this.componentProps;
      outlet.routeRender = this.routeRender;
    }
    // After all children have completed then tell switch
    // the provided callback will get executed after this route is in view
    if (typeof this.componentUpdated === 'function') {
      this.componentUpdated(routeViewOptions);

      // If this is an independent route and it matches then routes have updated.
      // If the only change to location is a hash change then do not scroll.
    } else if (this.match && !matchesAreEqual(this.match, this.previousMatch) && this.routeViewsUpdated) {
      this.routeViewsUpdated(routeViewOptions);
    }
  }

  async componentDidUpdate() {
    await this.loadCompleted();
  }
  async componentDidLoad() {
    await this.loadCompleted();
  }

  render() {
    return null;
  }
}

ActiveRouter.injectProps(Route, [
  'location',
  'history',
  'historyType',
  'routeViewsUpdated'
]);
