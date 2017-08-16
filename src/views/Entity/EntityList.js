import React, {Component} from 'react';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
import createHistory from 'history/createBrowserHistory'
import queryString from 'query-string';
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils,
  filterApiResourcesByType
} from "../../ApiResource";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import './EntityList.css'
import {NavLink} from "react-router-dom";
import {formatCurrency} from "../../utils";
import {UncontrolledTooltip} from "reactstrap";
import messages from "../../messages";

const pageSize = 50;

const nullBooleanOptions = [
  {
    value: 'any',
    label: <FormattedMessage id="all" defaultMessage={`All`} />
  },
  {
    value: 'true',
    label: messages.yes
  },
  {
    value: 'false',
    label: messages.no
  }
];

class EntityList extends Component {
  constructor(props) {
    super(props);
    this.history = createHistory();

    this.state = {
      formData: {
        stores: [],
        productTypes: [],
        isAvailable: nullBooleanOptions[0],
        isActive: nullBooleanOptions[0],
        isVisible: nullBooleanOptions[0],
        isAssociated: nullBooleanOptions[0],
        keywords: '',
        page: 1
      },
      entities: undefined,
      size: 'xs'
    }

    this.history.listen(this.onHistoryChange);
    this.onHistoryChange(window.location);
  }

  onHistoryChange = (location, action) => {
    console.log(location)
    console.log(action)
    const parameters = queryString.parse(location.search);

    let stores = parameters['stores'];
    if (!Array.isArray(stores)) {
      stores = [stores]
    }
    const storeOptions = this.createOptions(this.props.stores).reduce((acum, option) => {
      return {...acum, [option.value]: option}
    }, {});
    stores = stores.map(store => storeOptions[store]).filter(option => Boolean(option));
    console.log(stores);

    if (this.props.productTypes && this.props.stores) {
      this.setState({
        formData: {
          ...this.state.formData,
          stores
        }
      }, () => this.updateSearchResults(false))
    }
  };

  componentDidMount() {
    document.body.classList.add('sidebar-hidden');

    if (!this.props.productTypes) {
      this.props.fetchApiResource('product_types', this.props.dispatch)
    }

    if (!this.props.stores) {
      this.props.fetchApiResource('stores', this.props.dispatch)
    }

    this.updateSearchResults(false);

    this.onResize();
    window.onresize = this.onResize
  }

  onResize = () => {
    const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    let size = undefined;
    if (viewportWidth < 576) {
      size = 'xs'
    } else {
      size = 'normal'
    }

    if (size !== this.state.size) {
      this.setState({
        size
      })
    }
  };

  handleValueChange = (name, value, callback=() => {}) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value
      }
    }, callback)
  };

  handleKeywordsChange = event => {
    this.handleValueChange('keywords', event.target.value);
  };

  onPageChange = (selectedObject) => {
    const page = selectedObject.selected + 1;
    this.handleValueChange('page', page, this.updateSearchResults);
  };

  handleFormSubmit = (event) => {
    event.preventDefault();
    this.setState({
      formData: {
        ...this.state.formData,
        page: 1
      }
    }, this.updateSearchResults);
  };

  updateSearchResults = (pushLocation=true) => {
    this.setState({
      entities: undefined
    });

    let search = '?';

    const formData = this.state.formData;

    for (let store of formData.stores) {
      search += `stores=${store.value}&`
    }

    for (let productType of formData.productTypes) {
      search += `product_types=${productType.value}&`
    }

    search += `is_visible=${formData.isVisible.value}&is_available=${formData.isAvailable.value}&is_associated=${formData.isAssociated.value}&is_active=${formData.isActive.value}&search=${formData.keywords}&page=${formData.page}&page_size=${pageSize}`;

    if (pushLocation) {
      const newRoute = this.history.location.pathname + search;
      this.history.push(newRoute)
    }

    let url = settings.resourceEndpoints.entities + search;

    this.props.fetchAuth(url).then(json => {
      this.setState({
        entities: json
      })
    })
  };

  createOptions = (options) => {
    return options.map(option => ({
      value: option.id,
      label: option.name
    }))
  };


  render() {
    if (!this.props.stores || !this.props.productTypes) {
      return <Loading />
    }

    const storeOptions = this.createOptions(this.props.stores);
    const productTypeOptions = this.createOptions(this.props.productTypes);

    const preferredCurrency = this.props.ApiResource(this.props.preferredCurrency);

    const labels = {
      normalPrice: <FormattedMessage id="normal_price_short" defaultMessage={`Normal`} />,
      offerPrice: <FormattedMessage id="offer_price_short" defaultMessage={`Offer`} />,
      original: <FormattedMessage id="original_label_short" defaultMessage={`orig.`} />
    };

    let pageRangeDisplayed = 3;
    let marginPagesDisplayed= 2;
    if (this.state.size === 'xs') {
      pageRangeDisplayed = 1;
      marginPagesDisplayed = 1;
    }

    let entityResults = undefined;
    let convertCurrencies = undefined;
    let displayCellPlanColumn = undefined;
    let pageCount = undefined;
    if (this.state.entities) {
      entityResults = this.state.entities.results.map(entity => this.props.ApiResource(entity));
      convertCurrencies = entityResults.some(entity => entity.currencyUrl !== preferredCurrency.url);
      displayCellPlanColumn = entityResults.some(entity => entity.cellPlanName !== null)
      pageCount = Math.ceil(this.state.entities.count / pageSize);
    }

    const localFormatCurrency = (value, valueCurrency, conversionCurrency) => {
      return formatCurrency(value, valueCurrency, conversionCurrency,
          this.props.preferredNumberFormat.thousands_separator,
          this.props.preferredNumberFormat.decimal_separator)
    };

    return (
        <div className="animated fadeIn">
          <UncontrolledTooltip placement="top" target="is_available_label">
            <dl>
              <dt className="left-aligned">{messages.yes}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_available_label_yes" defaultMessage='The entity is available for purchase' />
              </dd>
              <dt className="left-aligned">{messages.no}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_available_label_no" defaultMessage='The entity is not available for purchase, whether because it is unlisted ("inactive") or "out of stock"' />
              </dd>
            </dl>
          </UncontrolledTooltip>
          <UncontrolledTooltip placement="top" target="is_active_label">
            <dl>
              <dt className="left-aligned">{messages.yes}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_active_label_yes" defaultMessage='The entity is listed in the store website. It may be available for purchase or not' />
              </dd>
              <dt className="left-aligned">{messages.no}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_active_label_no" defaultMessage='The entity is no longer listed in the store website. It is unavailable for purchase' />
              </dd>
            </dl>
          </UncontrolledTooltip>
          <UncontrolledTooltip placement="top" target="is_visible_label">
            <dl>
              <dt className="left-aligned">{messages.yes}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_visible_label_yes" defaultMessage='Defaut state of an entity' />
              </dd>
              <dt className="left-aligned">{messages.no}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_visible_label_no" defaultMessage='The entity has been flagged by our staff as non-relevant' />
              </dd>
            </dl>
          </UncontrolledTooltip>
          <UncontrolledTooltip placement="top" target="is_associated_label">
            <dl>
              <dt className="left-aligned">{messages.yes}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_associated_label_yes" defaultMessage='The entity has been matched with a product' />
              </dd>
              <dt className="left-aligned">{messages.no}</dt>
              <dd className="left-aligned">
                <FormattedMessage id="entity_is_associated_label_no" defaultMessage="The entity hasn't been matched" />
              </dd>
            </dl>
          </UncontrolledTooltip>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <i className="glyphicons glyphicons-search">&nbsp;</i> <FormattedMessage id="filters" defaultMessage={`Filters`} />
                </div>
                <div className="card-block">
                  <div className="row entity-form-controls">
                    <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                      <label htmlFor="stores"><FormattedMessage id="stores" defaultMessage={`Stores`} /></label>
                      <Select
                          name="stores"
                          id="stores"
                          options={storeOptions}
                          value={this.state.formData.stores}
                          onChange={val => this.handleValueChange('stores', val)}
                          multi={true}
                          placeholder={<FormattedMessage id="all_feminine" defaultMessage={`All`} />}
                      />
                    </div>
                    <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                      <label htmlFor="product_types"><FormattedMessage id="product_types" defaultMessage={`Product types`} /></label>
                      <Select
                          name="product_types"
                          id="product_types"
                          options={productTypeOptions}
                          value={this.state.formData.productTypes}
                          onChange={val => this.handleValueChange('productTypes', val)}
                          multi={true}
                          placeholder={<FormattedMessage id="all_masculine" defaultMessage={`All`} />}
                      />
                    </div>
                    <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                      <label id="is_available_label" className="dashed" htmlFor="is_available"><FormattedMessage id="is_available_question" defaultMessage={`Available?`} /></label>
                      <Select
                          name="is_available"
                          id="is_available"
                          options={nullBooleanOptions}
                          value={this.state.formData.isAvailable}
                          onChange={val => this.handleValueChange('isAvailable', val)}
                          clearable={false}
                      />
                    </div>
                    <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                      <label id="is_active_label" className="dashed" htmlFor="is_active"><FormattedMessage id="is_active_question" defaultMessage={`Active?`} /></label>
                      <Select
                          name="is_active"
                          id="is_active"
                          options={nullBooleanOptions}
                          value={this.state.formData.isActive}
                          onChange={val => this.handleValueChange('isActive', val)}
                          clearable={false}
                      />
                    </div>
                    <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                      <label id="is_visible_label" className="dashed" htmlFor="is_visible"><FormattedMessage id="is_visible_question" defaultMessage={`Visible?`} /></label>
                      <Select
                          name="is_visible"
                          id="is_visible"
                          options={nullBooleanOptions}
                          value={this.state.formData.isVisible}
                          onChange={val => this.handleValueChange('isVisible', val)}
                          clearable={false}
                      />
                    </div>
                    <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                      <label id="is_associated_label" className="dashed" htmlFor="is_associated"><FormattedMessage id="is_associated_question" defaultMessage={`Associated?`} /></label>
                      <Select
                          name="is_associated"
                          id="is_associated"
                          options={nullBooleanOptions}
                          value={this.state.formData.isAssociated}
                          onChange={val => this.handleValueChange('isAssociated', val)}
                          clearable={false}
                      />
                    </div>
                    <div className="col-12 col-sm-9 col-md-10 col-lg-2 col-xl-2">
                      <label htmlFor="keywords"><FormattedMessage id="keywords" defaultMessage={'Keywords'} /></label>
                      <form onSubmit={this.handleFormSubmit}>
                        <input
                            type="text"
                            name="keywords"
                            id="keywords"
                            className="form-control"
                            placeholder="Keywords"
                            value={this.state.formData.keywords}
                            onChange={this.handleKeywordsChange}
                        />
                      </form>
                    </div>
                    <div className="col-12 col-sm-3 col-md-2 col-lg-2 col-xl-2">
                      <label htmlFor="submit" className="hidden-xs-down">&nbsp;</label>
                      <button name="submit" id="submit" type="submit" className="btn btn-primary" onClick={this.handleFormSubmit}>
                        <FormattedMessage id="search" defaultMessage={`Search`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <i className="glyphicons glyphicons-list">&nbsp;</i> <FormattedMessage id="entities" defaultMessage={`Entities`} />
                </div>
                <div className="card-block">
                  {entityResults ?
                      <div>
                        <div className="row">
                          <div className="col-12">
                            <div className="float-right">
                              <ReactPaginate
                                  pageCount={pageCount}
                                  pageRangeDisplayed={pageRangeDisplayed}
                                  marginPagesDisplayed={marginPagesDisplayed}
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
                                  forcePage={this.state.formData.page - 1}
                                  previousLabel={messages.previous}
                                  nextLabel={messages.next}
                              />
                            </div>
                          </div>
                        </div>
                        <table className="table table-striped">
                          <thead>
                          <tr>
                            <th><FormattedMessage id="name" defaultMessage={`Name`} /></th>
                            {displayCellPlanColumn && <th className="hidden-xs-down"><FormattedMessage id="cell_plan_name" defaultMessage={`Cell plan`} /></th>}
                            <th><FormattedMessage id="store" defaultMessage={`Store`} /></th>
                            <th className="hidden-xs-down"><FormattedMessage id="sku" defaultMessage={`SKU`} /></th>
                            <th className="hidden-xs-down"><FormattedMessage id="product_type" defaultMessage={`Product type`} /></th>
                            <th className="hidden-sm-down"><FormattedMessage id="product" defaultMessage={`Product`} /></th>
                            <th className="hidden-md-down center-aligned"><FormattedMessage id="is_available_short_question" defaultMessage={`Avail?`} /></th>
                            <th className="hidden-md-down center-aligned"><FormattedMessage id="is_active_short_question" defaultMessage={`Act?`} /></th>
                            <th className="hidden-md-down center-aligned"><FormattedMessage id="is_visible_short_question" defaultMessage={`Vis?`} /></th>

                            <th className="hidden-lg-down right-aligned">
                              {labels.normalPrice}
                              {convertCurrencies &&
                              <span>&nbsp;({labels.original})</span>
                              }
                            </th>
                            <th className="hidden-lg-down right-aligned">
                              {labels.offerPrice}
                              {convertCurrencies &&
                              <span>&nbsp;({labels.original})</span>
                              }
                            </th>
                            <th className="show-xxl-up center-aligned"><FormattedMessage id="currency_label" defaultMessage={`Currency`} /></th>
                            {convertCurrencies &&
                            <th className="show-xxl-up right-aligned">
                              {labels.normalPrice}
                              {convertCurrencies &&
                              <span>&nbsp;({preferredCurrency.isoCode})</span>
                              }
                            </th>}
                            {convertCurrencies &&
                            <th className="show-xxl-up right-aligned">
                              {labels.offerPrice}
                              {convertCurrencies &&
                              <span>&nbsp;({preferredCurrency.isoCode})</span>
                              }
                            </th>
                            }
                          </tr>
                          </thead>
                          <tbody>
                          {entityResults.map(entity =>
                              <tr key={entity.url}>
                                <td className="entity-name-cell">
                                  <NavLink to={'/entities/' + entity.id}>{entity.name}</NavLink>
                                </td>
                                {displayCellPlanColumn && <td className="hidden-xs-down">{entity.cellPlanName || <em>N/A</em>}</td>}
                                <td><a href={entity.externalUrl} target="_blank">{entity.store.name}</a></td>
                                <td className="hidden-xs-down">{entity.sku || <em>N/A</em>}</td>
                                <td className="hidden-xs-down">{entity.productType.name}</td>
                                <td className="hidden-sm-down">
                                  {entity.product ?
                                      <span>
                                      <NavLink to={'/products/' + entity.product.id}>{entity.product.name}</NavLink>
                                        {entity.cellPlan &&
                                        <span>
                                            &nbsp;/&nbsp;<NavLink to={'/products/' + entity.cellPlan.id}>{entity.cellPlan.name}</NavLink>
                                          </span>
                                        }
                                    </span>
                                      : <em>N/A</em>
                                  }
                                </td>
                                <td className="hidden-md-down center-aligned"><i className={entity.activeRegistry && entity.activeRegistry.stock !== 0 ?
                                    'glyphicons glyphicons-check' :
                                    'glyphicons glyphicons-unchecked' }/>
                                </td>
                                <td className="hidden-md-down center-aligned"><i className={entity.activeRegistry ?
                                    'glyphicons glyphicons-check' :
                                    'glyphicons glyphicons-unchecked'}/>
                                </td>
                                <td className="hidden-md-down center-aligned"><i className={entity.isVisible ?
                                    'glyphicons glyphicons-check' :
                                    'glyphicons glyphicons-unchecked'}/>
                                </td>
                                <td className="hidden-lg-down right-aligned nowrap">
                                  {entity.activeRegistry ?
                                      <span>{localFormatCurrency(entity.activeRegistry.normal_price, entity.currency)}</span> :
                                      <em>N/A</em>
                                  }
                                </td>
                                <td className="hidden-lg-down right-aligned nowrap">
                                  {entity.activeRegistry ?
                                      <span>{localFormatCurrency(entity.activeRegistry.offer_price, entity.currency)}</span> :
                                      <em>N/A</em>
                                  }
                                </td>
                                <td className="show-xxl-up center-aligned">
                                  {entity.currency.isoCode}
                                </td>
                                {convertCurrencies &&
                                <td className="show-xxl-up right-aligned nowrap">
                                  {entity.activeRegistry ?
                                      <span>{localFormatCurrency(entity.activeRegistry.normal_price, entity.currency, preferredCurrency)}</span> :
                                      <em>N/A</em>
                                  }
                                </td>}
                                {convertCurrencies &&
                                <td className="show-xxl-up right-aligned nowrap">
                                  {entity.activeRegistry ?
                                      <span>{localFormatCurrency(entity.activeRegistry.offer_price, entity.currency, preferredCurrency)}</span> :
                                      <em>N/A</em>
                                  }
                                </td>
                                }
                              </tr>
                          )}
                          </tbody>
                        </table>
                      </div>
                      : <Loading />
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

function mapStateToProps(state) {
  let productTypes = undefined;
  if (state.loadedResources.includes('product_types')) {
    productTypes = filterApiResourcesByType(state.apiResources, 'product_types')
        .filter(productType => productType.permissions.includes('view_product_type_entities'))
  }

  let stores = undefined;
  if (state.loadedResources.includes('stores')) {
    stores = filterApiResourcesByType(state.apiResources, 'stores')
        .filter(store => store.permissions.includes('view_store_entities'))
  }

  return {
    productTypes,
    stores,
    preferredCurrency: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_currency],
    preferredNumberFormat: state.apiResources[state.apiResources[settings.ownUserUrl].preferred_number_format]
  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(EntityList);
