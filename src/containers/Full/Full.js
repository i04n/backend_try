import React, { Component } from 'react';
import {connect} from "react-redux";
import { Switch, Route, Redirect } from 'react-router-dom'

import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import Breadcrumbs from '../../components/Breadcrumbs/';
import Aside from '../../components/Aside/';
import Alerts from '../../components/Alerts';
import Dashboard from '../../views/Dashboard/';
import PermissionRoute from '../../auth/PermissionRoute';
import { routes } from '../../TopLevelRoutes';
import StoreDetail from "../../views/Store/StoreDetail";
import StoreDetailUpdate from "../../views/Store/StoreDetailUpdate";
import DetailPermissionRoute from "../../auth/DetailPermissionRoute";
import StoreDetailUpdateLogs from "../../views/Store/StoreDetailUpdateLogs";


class Full extends Component {
  render() {
    return (
        <div className="app">
          <Header />
          <div className="app-body">
            <Sidebar {...this.props}/>
            <main className="main">
              <Alerts location={this.props.location} />
              <Breadcrumbs location={this.props.location} />
              <div className="container-fluid main-content">
                <Switch>
                  <Route exact path="/dashboard" name="Dashboard" component={Dashboard}/>
                  {routes.map(route =>
                      <PermissionRoute exact key={route.path} path={route.path} name={route.name} requiredPermission={route.requiredPermission} component={route.component}/>
                  )}
                  <DetailPermissionRoute exact path="/stores/:id/update_logs" resource="stores" permission="view_store_update_logs" name="StoreDetailUpdateLogs" component={StoreDetailUpdateLogs}/>
                  <DetailPermissionRoute exact path="/stores/:id/update" resource="stores" permission="update_store_prices" name="StoreDetailUpdate" component={StoreDetailUpdate}/>
                  <DetailPermissionRoute exact path="/stores/:id" resource="stores" permission="backend_view_store" name="StoresDetail" component={StoreDetail}/>

                  <Redirect from="/" to="/dashboard"/>
                </Switch>
              </div>
            </main>
            <Aside />
          </div>
        </div>
    );
  }
}


export default connect()(Full);
