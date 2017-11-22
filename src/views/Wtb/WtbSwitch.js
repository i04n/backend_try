import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import WtbBrandList from "./WtbBrandList";
import ResourceObjectPermission from "../../auth/ResourceObjectPermission";
import WtbBrandDetail from "./WtbBrandDetail";
import WtbBrandDetailUpdateLogs from "./WtbBrandDetailUpdateLogs";
import WtbEntityList from "./WtbEntityList";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url + '/brands'} exact render={props => (
            <RequiredResources resources={['wtb_brands']}>
              <WtbBrandList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/brands/:id'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="wtb_brands" permission="view_wtb_brand">
              <RequiredResources resources={['stores']}>
                <WtbBrandDetail />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/brands/:id/update_logs'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="wtb_brands" permission="view_wtb_brand">
              <RequiredResources resources={['stores']}>
                <WtbBrandDetailUpdateLogs />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/entities'} exact render={props => (
            <RequiredResources resources={['wtb_brands', 'categories']}>
              <WtbEntityList />
            </RequiredResources>
        )} />
      </Switch>
  )
}