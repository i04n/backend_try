import React, {Component} from 'react';
import {NavLink} from "react-router-dom";
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import {filterApiResourceObjectsByType} from "../../ApiResource";
import ApiFormChoiceField from "../../api_forms/ApiFormChoiceField";
import ApiForm from "../../api_forms/ApiForm";
import ApiFormResultsTable from "../../api_forms/ApiFormResultsTable";
import ApiFormDateRangeField from "../../api_forms/ApiFormDateRangeField";
import {formatDateStr} from "../../utils";
import ApiFormTextField from "../../api_forms/ApiFormTextField";
import {
  createOrderingOptionChoices,
  createPageSizeChoices
} from "../../api_forms/utils";
import ApiFormPaginationField from "../../api_forms/ApiFormPaginationField";
import ApiFormResultPageCount from "../../api_forms/ApiFormResultPageCount";
import ApiFormSubmitButton from "../../api_forms/ApiFormSubmitButton";

class ProductList extends Component {
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

  setProducts = json => {
    this.setState({
      products: json ? json.payload : null
    })
  };

  render() {
    const stores = this.props.stores;
    const categories = this.props.categories;

    const availabilityCountriesTooltipContent = <p>
      <FormattedMessage id="product_availability_countries_tooltip" defaultMessage='Filter the products that are available for purchase in the selected countries' />
    </p>;

    const availabilityStoresTooltipContent = <p>
      <FormattedMessage id="product_availability_stores_tooltip" defaultMessage='Filter the products that are available for purchase in the selected stores' />
    </p>;

    const creationDateTooltipContent = <p>
      <FormattedMessage id="creation_date_tooltip" defaultMessage='Filter the products that were created between the given dates' />
    </p>;

    const lastUpdatedTooltipContent = <p>
      <FormattedMessage id="last_updated_tooltip" defaultMessage='Filter the products that were last updated between the given dates' />
    </p>;

    const columns = [
      {
        label: <FormattedMessage id="name" defaultMessage='Name' />,
        ordering: 'name',
        renderer: result => <NavLink to={'/products/' + result.id}>{result.name}</NavLink>
      },
      {
        label: <FormattedMessage id="category" defaultMessage='Category' />,
        ordering: 'category',
        renderer: result => result.category.name
      },
      {
        label: <FormattedMessage id="creation_date" defaultMessage='Creation date' />,
        ordering: 'creation_date',
        renderer: result => formatDateStr(result.creationDate),
        cssClasses: 'hidden-xs-down'
      },
      {
        label: <FormattedMessage id="last_updated" defaultMessage='Last updated' />,
        ordering: 'last_updated',
        renderer: result => formatDateStr(result.lastUpdated),
        cssClasses: 'hidden-xs-down'
      }
    ];

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoint="products/"
              fields={['categories', 'availabilityCountries', 'availabilityStores', 'search', 'creationDate', 'lastUpdated', 'page', 'page_size', 'ordering']}
              onResultsChange={this.setProducts}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <ApiFormChoiceField
                name="ordering"
                choices={createOrderingOptionChoices(['id', 'name', 'category', 'creation_date', 'last_updated'])}
                hidden={true}
                initial="name"
                value={this.state.formValues.ordering}
                onChange={this.state.apiFormFieldChangeHandler}
            />
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <i className="glyphicons glyphicons-search">&nbsp;</i>
                    <FormattedMessage id="filters" defaultMessage={`Filters`} />
                  </div>
                  <div className="card-block">
                    <div className="row api-form-filters">
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="categories" defaultMessage={`Categories`} />
                        </label>
                        <ApiFormChoiceField
                            name="categories"
                            choices={categories}
                            placeholder={<FormattedMessage id="all_feminine" defaultMessage={`All`} />}
                            searchable={!this.props.breakpoint.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.categories}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="availability_countries" defaultMessage='Availability countries' />
                        </label>
                        <ApiFormChoiceField
                            name="availabilityCountries"
                            tooltipContent={availabilityCountriesTooltipContent}
                            choices={this.props.countries}
                            placeholder={<FormattedMessage id="do_not_apply" defaultMessage={`Do not apply`} />}
                            searchable={!this.props.breakpoint.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.availabilityCountries}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="availability_stores" defaultMessage='Availability stores' />
                        </label>
                        <ApiFormChoiceField
                            name="availabilityStores"
                            tooltipContent={availabilityStoresTooltipContent}
                            choices={stores}
                            placeholder={<FormattedMessage id="do_not_apply" defaultMessage={`Do not apply`} />}
                            searchable={!this.props.breakpoint.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.availabilityStores}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="keyword" defaultMessage='Keywords' />
                        </label>
                        <ApiFormTextField
                            name="search"
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.search}
                        />
                      </div>
                      <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="creation_date_from_to" defaultMessage='Creation date (from / to)' />
                        </label>
                        <ApiFormDateRangeField
                            name="creationDate"
                            tooltipContent={creationDateTooltipContent}
                            nullable={true}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.creationDate}
                        />
                      </div>
                      <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                        <label>
                          <FormattedMessage id="last_updated_from_to" defaultMessage='Last updated (from / to)' />
                        </label>
                        <ApiFormDateRangeField
                            name="lastUpdated"
                            tooltipContent={lastUpdatedTooltipContent}
                            nullable={true}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.lastUpdated}
                        />
                      </div>
                      <div className="col-12 col-sm-7 col-md-6 col-lg-12 col-xl-12 float-right">
                        <label htmlFor="submit" className="hidden-xs-down hidden-lg-up">&nbsp;</label>
                        <ApiFormSubmitButton
                            label={<FormattedMessage id="search" defaultMessage='Search' />}
                            loadingLabel={<FormattedMessage id="searching" defaultMessage='Searching'/>}
                            onChange={this.state.apiFormFieldChangeHandler}
                            loading={this.state.products === null}
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
                    <FormattedMessage id="products" defaultMessage="Products" />
                    &nbsp;<ApiFormResultPageCount
                      page={this.state.formValues.page}
                      pageSize={this.state.formValues.page_size}
                      resultCount={this.state.products && this.state.products.count}
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
                            resultCount={this.state.products && this.state.products.count}
                            onChange={this.state.apiFormFieldChangeHandler}
                        />
                      </div>
                    </div>

                    <ApiFormResultsTable
                        results={this.state.products && this.state.products.results}
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
    countries: filterApiResourceObjectsByType(state.apiResourceObjects, 'countries'),
    breakpoint: state.breakpoint
  }
}

export default connect(mapStateToProps)(ProductList);
