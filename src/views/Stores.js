import React, { Component } from 'react';
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from '../ApiResource';
import {connect} from "react-redux";
import {
  filterApiResourcesByType
} from "../ApiResource";
import {FormattedMessage} from "react-intl";


class Stores extends Component {
  componentDidMount() {
    if (!this.props.stores.length) {
      this.props.fetchApiResource('stores', this.props.dispatch)
    }
  }

  render() {
    const apiResourceStores = this.props.stores.map(x => this.props.ApiResource(x));

    return <div className="animated fadeIn">
      <div className="row">
        <div className="col-xs-12 col-md-8 col-lg-8 col-xl-6">
          <div className="card">
            <div className="card-header">
              <i className="glyphicons glyphicons-list">&nbsp;</i> <FormattedMessage id="stores" defaultMessage={`Stores`} />
            </div>
            <div className="card-block">
              <table className="table table-striped">
                <thead>
                <tr>
                  <th><FormattedMessage id="name" defaultMessage={`Name`} /></th>
                  <th><FormattedMessage id="type" defaultMessage={`type`} /></th>
                  <th><FormattedMessage id="country" defaultMessage={`Country`} /></th>
                  <th className="hidden-sm-down"><FormattedMessage id="scraper" defaultMessage={`Scraper`} /></th>
                  <th className="text-center hidden-sm-down"><FormattedMessage id="active_question" defaultMessage={`Active?`} /></th>
                </tr>
                </thead>
                <tbody>
                {apiResourceStores.map(store => (
                    <tr key={store.url}>
                      <td>{store.name}</td>
                      <td>{store.type.name}</td>
                      <td>{store.country.name}</td>
                      <td className="hidden-sm-down">{store.storescraperClass}</td>
                      <td className="text-center hidden-sm-down"><i className={store.isActive ? 'glyphicons glyphicons-check' : 'glyphicons glyphicons-unchecked'}>&nbsp;</i></td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

let mapStateToProps = (state) => {
  return {
    apiResources: state.apiResources,
    stores: filterApiResourcesByType(state, 'stores')
  }
};

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(Stores);