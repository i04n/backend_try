import React from 'react'
import {Route, Switch} from "react-router-dom";
import RequiredResources from "../../RequiredResources";
import EntityList from "./EntityList";
import EntityDetail from "./EntityDetail";
import ResourceObjectPermission from "../../auth/ResourceObjectPermission";
import EntityDetailPricingHistory from "./EntityDetailPricingHistory";
import EntityDetailEvents from "./EntityDetailEvents";
import EntityConflicts from "./EntityConflicts";
import EntityEstimatedSales from "./EntityEstimatedSales";

export default ({match}) => {
  return (
      <Switch>
        <Route path={match.url} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <EntityList />
            </RequiredResources>
        )} />
        <Route path={match.url + '/conflicts'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <EntityConflicts />
            </RequiredResources>
        )} />
        <Route path={match.url + '/estimated_sales'} exact render={props => (
            <RequiredResources resources={['categories', 'stores']}>
              <EntityEstimatedSales />
            </RequiredResources>
        )} />
        <Route path={match.url + '/:id'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="entities">
              <RequiredResources resources={['stores', 'categories', 'users_with_staff_actions']}>
                <EntityDetail />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/:id/pricing_history'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="entities">
              <RequiredResources resources={['stores']}>
                <EntityDetailPricingHistory />
              </RequiredResources>
            </ResourceObjectPermission>
        )} />
        <Route path={match.url + '/:id/events'} exact render={props => (
            <ResourceObjectPermission match={props.match} resource="entities">
              <EntityDetailEvents />
            </ResourceObjectPermission>
        )} />
      </Switch>
  )
}