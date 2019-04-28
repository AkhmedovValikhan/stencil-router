import { Component, Prop } from '@stencil/core';
import { RouteRenderProps, RouterHistory, MatchResults } from '../..';

@Component({
    tag: 'stencil-router-outlet',
    // styleUrl: 'outlet.css'
})
export class Outlet {
    @Prop() private history?: RouterHistory;
    @Prop({ mutable: true }) private match: MatchResults | null = null;
    @Prop() private component?: string;
    @Prop() private componentProps?: { [key: string]: any } = {};
    @Prop() private routeRender?: (props: RouteRenderProps) => any;

    render() {
        if (!this.history || !this.match) {
            return null;
        }
        // component props defined in route
        // the history api
        // current match data including params
        const childProps: RouteRenderProps = {
            ...this.componentProps,
            history: this.history,
            match: this.match
        };

        // If there is a routerRender defined then use
        // that and pass the component and component props with it.
        if (this.routeRender) {
            return this.routeRender({
                ...childProps,
                component: this.component
            });
        }

        if (this.component) {
            const ChildComponent = this.component;

            return (
                <ChildComponent {...childProps} />
            );
        }
    }
}