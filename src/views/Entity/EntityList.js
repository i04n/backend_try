import React, {Component} from 'react';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils, filterApiResourceObjectsByType
} from "../../ApiResource";
import {settings} from "../../settings";
import './EntityList.css'
import {NavLink} from "react-router-dom";
import {booleanChoices, formatCurrency} from "../../utils";
import {UncontrolledTooltip} from "reactstrap";
import messages from "../../messages";
import ApiForm from "../../api_forms/ApiForm";
import ApiFormChoiceField from "../../api_forms/ApiFormChoiceField";
import ApiFormTextField from "../../api_forms/ApiFormTextField";
import ApiFormSubmitButton from "../../api_forms/ApiFormSubmitButton";
import ApiFormPaginationField from "../../api_forms/ApiFormPaginationField";
import {
  createOrderingOptionChoices, createPageSizeChoices
} from "../../api_forms/utils";
import ApiFormResultsTable from "../../api_forms/ApiFormResultsTable";
import ApiFormResultPageCount from "../../api_forms/ApiFormResultPageCount";

class EntityList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      entities: undefined
    }
  }

  setApiFormFieldChangeHandler = apiFormFieldChangeHandler => {
    this.setState({
      apiFormFieldChangeHandler
    })
  };

  handleFormValueChange = formValues => {
    this.setState({formValues})
  };

  setEntities = json => {
    this.setState({
      entities: json ? json.payload : null
    })
  };

  render() {
    const preferredCurrency = this.props.ApiResourceObject(this.props.preferredCurrency);

    const labels = {
      normalPrice: <FormattedMessage id="normal_price_short" defaultMessage={`Normal`} />,
      offerPrice: <FormattedMessage id="offer_price_short" defaultMessage={`Offer`} />,
      original: <FormattedMessage id="original_label_short" defaultMessage={`orig.`} />
    };

    const localFormatCurrency = (value, valueCurrency, conversionCurrency) => {
      return formatCurrency(value, valueCurrency, conversionCurrency,
          this.props.preferredNumberFormat.thousands_separator,
          this.props.preferredNumberFormat.decimal_separator)
    };

    const convertCurrencies = this.state.entities && this.state.entities.results.some(entity => entity.currency !== preferredCurrency.url);

    const columns = [
      {
        label: <FormattedMessage id="name" defaultMessage={`Name`} />,
        ordering: 'name',
        renderer: entity => <NavLink to={'/entities/' + entity.id}>{entity.name}</NavLink>
      },
      {
        label: <FormattedMessage id="cell_plan_name" defaultMessage={`Cell plan`} />,
        ordering: 'cell_plan',
        renderer: entity => entity.cellPlanName || <em>N/A</em>,
        cssClasses: 'hidden-xs-down',
        displayFilter: entities => entities.some(entity => entity.cellPlanName !== null)
      },
      {
        label: <FormattedMessage id="store" defaultMessage={`Store`} />,
        ordering: 'store',
        renderer: entity => <a href={entity.externalUrl} target="_blank">{entity.store.name}</a>,
      },
      {
        label: <FormattedMessage id="sku" defaultMessage={`SKU`} />,
        ordering: 'sku',
        renderer: entity => entity.sku || <em>N/A</em>,
        cssClasses: 'hidden-xs-down',
      },
      {
        label: <FormattedMessage id="category" defaultMessage={`Category`} />,
        ordering: 'category',
        renderer: entity => entity.category.name,
        cssClasses: 'hidden-xs-down',
      },
      {
        label: <FormattedMessage id="product" defaultMessage={`Product`} />,
        ordering: 'product',
        renderer: entity => entity.product ?
            <span>
              <NavLink to={'/products/' + entity.product.id}>{entity.product.name}</NavLink>
              {entity.cellPlan &&
              <span>&nbsp;/&nbsp;
                <NavLink to={'/products/' + entity.cellPlan.id}>{entity.cellPlan.name}</NavLink>
              </span>
              }
              </span>
            : <em>N/A</em>,
        cssClasses: 'hidden-sm-down',
      },
      {
        label: <FormattedMessage id="is_available_short_question" defaultMessage={`Avail?`} />,
        renderer: entity => <i className={entity.activeRegistry && entity.activeRegistry.stock !== 0 ?
            'glyphicons glyphicons-check' :
            'glyphicons glyphicons-unchecked' }/>,
        cssClasses: 'hidden-md-down center-aligned',
      },
      {
        label: <FormattedMessage id="is_active_short_question" defaultMessage={`Act?`} />,
        renderer: entity => <i className={entity.activeRegistry ?
            'glyphicons glyphicons-check' :
            'glyphicons glyphicons-unchecked'}/>,
        cssClasses: 'hidden-md-down center-aligned',
      },
      {
        label: <FormattedMessage id="is_visible_short_question" defaultMessage={`Vis?`} />,
        renderer: entity => <i className={entity.isVisible ?
            'glyphicons glyphicons-check' :
            'glyphicons glyphicons-unchecked'}/>,
        cssClasses: 'hidden-md-down center-aligned',
      },
      {
        label: <span>{labels.normalPrice}
          {convertCurrencies &&
          <span>&nbsp;({labels.original})</span>}</span>,
        ordering: 'normal_price',
        renderer: entity => entity.activeRegistry ?
            <span>{localFormatCurrency(entity.activeRegistry.normal_price, entity.currency)}</span> :
            <em>N/A</em>,
        cssClasses: 'hidden-lg-down right-aligned',
      },
      {
        label: <span>{labels.offerPrice}
          {convertCurrencies &&
          <span>&nbsp;({labels.original})</span>
          }</span>,
        ordering: 'offer_price',
        renderer: entity => entity.activeRegistry ?
            <span>{localFormatCurrency(entity.activeRegistry.offer_price, entity.currency)}</span> :
            <em>N/A</em>,
        cssClasses: 'hidden-lg-down right-aligned',
      },
      {
        label: <span>{labels.normalPrice}
          {convertCurrencies &&
          <span>&nbsp;({preferredCurrency.isoCode})</span>
          }</span>,
        displayFilter: () => convertCurrencies,
        renderer: entity => entity.activeRegistry ?
            <span>{localFormatCurrency(entity.activeRegistry.normal_price, entity.currency, preferredCurrency)}</span> :
            <em>N/A</em>,
        cssClasses: 'show-xxl-up right-aligned',
      },
      {
        label: <span>{labels.offerPrice}
          {convertCurrencies &&
          <span>&nbsp;({preferredCurrency.isoCode})</span>
          }</span>,
        displayFilter: () => convertCurrencies,
        renderer: entity => entity.activeRegistry ?
            <span>{localFormatCurrency(entity.activeRegistry.offer_price, entity.currency, preferredCurrency)}</span> :
            <em>N/A</em>,
        cssClasses: 'show-xxl-up right-aligned',
      },
    ];

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoint="entities/"
              fields={['stores', 'categories', 'is_available', 'is_active', 'is_visible', 'is_associated', 'search', 'page', 'page_size', 'ordering']}
              onResultsChange={this.setEntities}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <ApiFormChoiceField
                name="ordering"
                choices={createOrderingOptionChoices(['name', 'country', 'type'])}
                hidden={true}
                initial="name"
                value={this.state.formValues.ordering}
                onChange={this.state.apiFormFieldChangeHandler}
            />
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
                        <label htmlFor="stores">
                          <FormattedMessage id="stores" defaultMessage={`Stores`} />
                        </label>
                        <ApiFormChoiceField
                            name="stores"
                            id="stores"
                            choices={this.props.stores}
                            multiple={true}
                            searchable={!this.props.breakpoint.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.stores}
                            placeholder={messages.all_feminine}

                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="categories">
                          <FormattedMessage id="categories" defaultMessage={`Categories`} />
                        </label>
                        <ApiFormChoiceField
                            name="categories"
                            id="categories"
                            choices={this.props.categories}
                            multiple={true}
                            searchable={!this.props.breakpoint.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.categories}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                        <label id="is_available_label" className="dashed" htmlFor="is_available"><FormattedMessage id="is_available_question" defaultMessage={`Available?`} /></label>
                        <ApiFormChoiceField
                            name="is_available"
                            id="is_available"
                            choices={booleanChoices}
                            searchable={false}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.is_available}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                        <label id="is_active_label" className="dashed" htmlFor="is_active"><FormattedMessage id="is_active_question" defaultMessage={`Active?`} /></label>
                        <ApiFormChoiceField
                            name="is_active"
                            id="is_active"
                            choices={booleanChoices}
                            searchable={false}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.is_active}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                        <label id="is_visible_label" className="dashed" htmlFor="is_visible">
                          <FormattedMessage id="is_visible_question" defaultMessage={`Visible?`} />
                        </label>
                        <ApiFormChoiceField
                            name="is_visible"
                            id="is_visible"
                            choices={booleanChoices}
                            searchable={false}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.is_visible}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                        <label id="is_associated_label" className="dashed" htmlFor="is_associated"><FormattedMessage id="is_associated_question" defaultMessage={`Associated?`} /></label>
                        <ApiFormChoiceField
                            name="is_associated"
                            id="is_associated"
                            choices={booleanChoices}
                            searchable={false}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.is_associated}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-5 col-md-6 col-lg-4 col-xl-4">
                        <label htmlFor="search">
                          <FormattedMessage id="keywords" defaultMessage={'Keywords'} />
                        </label>
                        <ApiFormTextField
                            name="search"
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.search}
                        />
                      </div>
                      <div className="col-12 col-sm-7 col-md-6 col-lg-12 col-xl-12 float-right">
                        <label htmlFor="submit" className="hidden-xs-down hidden-lg-up">&nbsp;</label>
                        <ApiFormSubmitButton
                            label={<FormattedMessage id="search" defaultMessage='Search' />}
                            loadingLabel={<FormattedMessage id="searching" defaultMessage='Searching'/>}
                            onChange={this.state.apiFormFieldChangeHandler}
                            loading={this.state.entities === null}
                        />
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
                    <i className="glyphicons glyphicons-list">&nbsp;</i>
                    <FormattedMessage id="entities" defaultMessage={`Entities`} />
                    &nbsp;<ApiFormResultPageCount
                      page={this.state.formValues.page}
                      pageSize={this.state.formValues.page_size}
                      resultCount={this.state.entities && this.state.entities.count}
                  />
                  </div>
                  <div className="card-block" id="results-container">
                    <div className="d-flex justify-content-between flex-wrap align-items-center mb-3 api-form-filters">
                      <div className="d-flex results-per-page-fields align-items-center mr-3">
                        <div className="results-per-page-dropdown ml-0 mr-2">
                          <ApiFormChoiceField
                              name="page_size"
                              choices={createPageSizeChoices([50, 100, 200])}
                              initial="50"
                              onChange={this.state.apiFormFieldChangeHandler}
                              value={this.state.formValues.page_size}
                              required={true}
                              updateResultsOnChange={true}
                              searchable={false}
                          />
                        </div>
                        <label><FormattedMessage id="results_per_page" defaultMessage="Results per page" /></label>
                      </div>
                      <div className="pagination-fields ml-auto d-flex align-items-center mr-0">
                          <ApiFormPaginationField
                              page={this.state.formValues.page}
                              pageSize={this.state.formValues.page_size}
                              resultCount={this.state.entities && this.state.entities.count}
                              onChange={this.state.apiFormFieldChangeHandler}
                          />
                      </div>
                    </div>

                    <ApiFormResultsTable
                        results={this.state.entities && this.state.entities.results}
                        columns={columns}
                        ordering={this.state.formValues.ordering}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ApiForm>
        </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    preferredCurrency: state.apiResourceObjects[state.apiResourceObjects[settings.ownUserUrl].preferred_currency],
    preferredNumberFormat: state.apiResourceObjects[state.apiResourceObjects[settings.ownUserUrl].preferred_number_format],
    entities: filterApiResourceObjectsByType(state.apiResourceObjects, 'entities'),
    breakpoint: state.breakpoint
  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(EntityList);
