import React, { Component } from 'react';
import ReactPaginate from 'react-paginate';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils,
  filterApiResourcesByType
} from "../../ApiResource";
import {FormattedMessage} from "react-intl";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import messages from "../../messages";
import {formatDateStr} from "../../utils";

const pageSize = 5;

class StoreDetailUpdateLogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      updateLogs: {},
      resultCount: undefined,
      page: 1
    }
  }

  componentDidMount() {
    if (!this.props.categories) {
      this.props.fetchApiResource('categories', this.props.dispatch)
    }

    this.updatePage(1)
        .then(json => {
          this.setState({
            resultCount: json.count
          })
        });
  }

  updatePage(page) {
    const store = this.props.resourceObject;
    const url = `${settings.resourceEndpoints.store_update_logs}?store=${store.id}&page=${page}&page_size=${pageSize}`;
    return this.props.fetchAuth(url)
        .then(json => {
          const newUpdateLogs = {
            ...this.state.updateLogs,
            [page]: json.results
          };
          this.setState({
            updateLogs: newUpdateLogs,
            page
          });

          return json
        })
  }

  onPageChange = (selectedObject) => {
    const page = selectedObject.selected + 1;
    this.updatePage(page)
  };

  render() {
    if (typeof this.state.resultCount === 'undefined' || !this.props.categories) {
      return <Loading />
    }

    const rawPageLogs = this.state.updateLogs[this.state.page];

    const pageLogs = rawPageLogs.map(rawPageLog => {
      const pageLog = this.props.ApiResource(rawPageLog);
      pageLog.apiResourcecategories = pageLog.categories.map(pt => this.props.ApiResource(this.props.apiResources[pt]));
      return pageLog
    });

    const statusDict = {
      1: <FormattedMessage id="pending" defaultMessage={`Pending`} />,
      2: <FormattedMessage id="in_process" defaultMessage={`In process`} />,
      3: <FormattedMessage id="success" defaultMessage={`Success`} />,
      4: <FormattedMessage id="error" defaultMessage={`Error`} />
    };

    const pageCount = Math.ceil(this.state.resultCount / pageSize);

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <strong>
                    <FormattedMessage id="update_logs" defaultMessage={`Update logs`} />
                  </strong>
                </div>
                <div className="card-block">
                  <div className="row">
                    <div className="col-12">
                      <div className="float-right">
                        <ReactPaginate
                            pageCount={pageCount}
                            pageRangeDisplayed={3}
                            marginPagesDisplayed={2}
                            containerClassName="pagination"
                            pageClassName="page-item"
                            pageLinkClassName="page-link"
                            activeClassName="active"
                            previousClassName="page-item"
                            nextClassName="page-item"
                            previousLinkClassName="page-link"
                            nextLinkClassName="page-link"
                            disabledClassName="disabled"
                            hrefBuilder={page => `?page=${page}`}
                            onPageChange={this.onPageChange}
                            previousLabel={messages.previous}
                            nextLabel={messages.next}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <table className="table table-striped">
                        <thead>
                        <tr>
                          <th><FormattedMessage id="status" defaultMessage={`Status`} /></th>
                          <th><FormattedMessage id="result" defaultMessage={`Result`} /></th>
                          <th><FormattedMessage id="last_update" defaultMessage={`Last update`} /></th>
                          <th className="hidden-xs-down"><FormattedMessage id="categories" defaultMessage={`Categories`} /></th>
                          <th className="hidden-sm-down"><FormattedMessage id="start" defaultMessage={`Start`} /></th>
                          <th className="hidden-sm-down"><FormattedMessage id="concurrency" defaultMessage={`Concurrency`} /></th>
                          <th className="hidden-md-down"><FormattedMessage id="async_question" defaultMessage={`Async?`} /></th>
                          <th className="hidden-md-down"><FormattedMessage id="log" defaultMessage={`Log`} /></th>
                        </tr>
                        </thead>
                        <tbody>
                        {pageLogs.map(log => (
                            <tr key={log.url}>
                              <td>{statusDict[log.status]}</td>
                              <td>
                                {log.availableProductsCount
                                    ? `${log.availableProductsCount} / ${log.unavailableProductsCount} / ${log.discoveryUrlsWithoutProductsCount}`
                                    : 'N/A'
                                }
                              </td>
                              <td>{formatDateStr(log.lastUpdated)}</td>
                              <td className="hidden-xs-down">
                                <ul>
                                  {log.apiResourcecategories.map(pt => (
                                      <li key={pt.url}>{pt.name}</li>
                                  ))}
                                </ul>
                              </td>

                              <td className="hidden-sm-down">{formatDateStr(log.creationDate)}</td>
                              <td className="hidden-sm-down">
                                {log.discoveryUrlConcurrency
                                    ? `${log.discoveryUrlConcurrency} / ${log.productsForUrlConcurrency}`
                                    : 'N/A'
                                }
                              </td>


                              <td className="hidden-md-down"><i className={log.useAsync ? 'glyphicons glyphicons-check' : 'glyphicons glyphicons-unchecked'}>&nbsp;</i></td>

                              <td className="hidden-md-down">
                                {log.registryFile ?
                                    <a href={log.registryFile} target="_blank"><FormattedMessage id="download" defaultMessage={`Download`} /></a> :
                                    <FormattedMessage id="unavailable" defaultMessage={`Unavailable`} />
                                }
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

function mapStateToProps(state) {
  let categories = undefined;
  if (state.loadedResources.includes('categories')) {
    categories = filterApiResourcesByType(state.apiResources, 'categories')
  }
  return {
    categories: categories
  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(StoreDetailUpdateLogs);