import React, { Component } from 'react';
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import moment from 'moment';
import {FormattedMessage, injectIntl} from "react-intl";
import {convertToDecimal} from "../../utils";
import ApiForm from "../../api_forms/ApiForm";
import ApiFormDateRangeField from "../../api_forms/ApiFormDateRangeField";
import ApiFormChoiceField from "../../api_forms/ApiFormChoiceField";
import ProductDetailPricingHistoryChart from "./ProductDetailPricingHistoryChart";
import ApiFormSubmitButton from "../../api_forms/ApiFormSubmitButton";
import {UncontrolledTooltip} from "reactstrap";

class ProductDetailPricingHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      chart: undefined,
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

  setChartData = (bundle) => {
    if (!bundle) {
      this.setState({
        chart: null,
      });
      return;
    }

    const convertedData = bundle.payload.map(pricingEntry => ({
      entity: pricingEntry.entity,
      pricingHistory: pricingEntry.pricing_history.map(entityHistory => ({
        timestamp: moment(entityHistory.timestamp),
        normalPrice: convertToDecimal(entityHistory.normal_price),
        offerPrice: convertToDecimal(entityHistory.offer_price),
      }))
    }));

    this.setState({
      chart: {
        startDate: bundle.fieldValues.timestamp.startDate,
        endDate: bundle.fieldValues.timestamp.endDate,
        currency: bundle.fieldValues.currency,
        priceType: bundle.fieldValues.price_type,
        data: convertedData
      }
    });
  };

  render() {
    const product = this.props.ApiResourceObject(this.props.apiResourceObject);

    const dateRangeInitialMin = moment().startOf('day').subtract(30, 'days');
    const dateRangeInitialMax = moment().startOf('day');

    const currencyOptions = this.props.currencies.map(currency => {
      const priority = currency.id === this.props.preferredCurrency.id ? 1 : 2;

      return {
        ...currency,
        name: currency.name,
        priority: priority
      }
    });

    currencyOptions.sort((a, b) => a.priority - b.priority);

    const countryUrlsInStores = this.props.stores.map(store => store.country);
    const countryOptions = this.props.countries.filter(country => countryUrlsInStores.includes(country.url));

    const excludeUnavailableOptions = [
      {
        id: '1',
        name: <FormattedMessage id="only_when_available" defaultMessage="Only when available"/>
      },
    ];

    const priceTypeOptions = [
      {
        id: 'normal',
        name: <FormattedMessage id="normal_price" defaultMessage="Normal price"/>
      },
      {
        id: 'offer',
        name: <FormattedMessage id="offer_price" defaultMessage="Offer price"/>
      },
    ];

    return (
        <div className="animated fadeIn d-flex flex-column">
          <UncontrolledTooltip placement="top" target="currency_label">
            <FormattedMessage id="product_pricing_history_currency" defaultMessage="The price points are converted to this currency. The values are calculated using standard exchange rates" />
          </UncontrolledTooltip>

          <ApiForm
              endpoints={[product.url + 'pricing_history/']}
              fields={['timestamp', 'countries', 'stores', 'exclude_unavailable', 'currency', 'price_type']}
              onResultsChange={this.setChartData}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <div className="card">
              <div className="card-header">
                <FormattedMessage id="filters" defaultMessage="Filters" />
              </div>
              <div className="card-block">
                <div className="row api-form-filters">
                  <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-4">
                    <label htmlFor="timestamp">
                      <FormattedMessage id="date_range_from_to" defaultMessage="Date range (from / to)" />
                    </label>
                    <ApiFormDateRangeField
                        name="timestamp"
                        id="timestamp"
                        initial={[dateRangeInitialMin, dateRangeInitialMax]}
                        value={this.state.formValues.timestamp}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4">
                    <label htmlFor="countries">
                      <FormattedMessage id="countries" defaultMessage="Countries" />
                    </label>
                    <ApiFormChoiceField
                        name="countries"
                        id="countries"
                        choices={countryOptions}
                        value={this.state.formValues.countries}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4">
                    <label htmlFor="stores">
                      <FormattedMessage id="stores" defaultMessage="Stores" />
                    </label>
                    <ApiFormChoiceField
                        name="stores"
                        id="stores"
                        multiple={true}
                        searchable={true}
                        choices={this.props.stores}
                        value={this.state.formValues.stores}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4">
                    <label htmlFor="exclude_unavailable">
                      <FormattedMessage id="view" defaultMessage="View" />
                    </label>
                    <ApiFormChoiceField
                        name="exclude_unavailable"
                        id="exclude_unavailable"
                        required={false}
                        choices={excludeUnavailableOptions}
                        placeholder={<FormattedMessage id="all_masculine" defaultMessage="All"/>}
                        value={this.state.formValues.exclude_unavailable}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4">
                    <label id="currency_label" htmlFor="currency">
                      <FormattedMessage id="currency" defaultMessage="Currency" />
                    </label>
                    <ApiFormChoiceField
                        name="currency"
                        id="currency"
                        choices={currencyOptions}
                        placeholder={<FormattedMessage id="keep_original" defaultMessage="Keep original" />}
                        apiField={null}
                        required={false}
                        searchable={false}
                        value={this.state.formValues.currency}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4">
                    <label htmlFor="price_type">
                      <FormattedMessage id="price_type" defaultMessage="Price type" />
                    </label>
                    <ApiFormChoiceField
                        name="price_type"
                        id="price_type"
                        choices={priceTypeOptions}
                        required={true}
                        apiField={null}
                        searchable={false}
                        value={this.state.formValues.price_type}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                    <label className="hidden-xs-down">&nbsp;</label>
                    <ApiFormSubmitButton
                        label={<FormattedMessage id="search" defaultMessage='Search' />}
                        loadingLabel={<FormattedMessage id="searching" defaultMessage='Searching'/>}
                        onChange={this.state.apiFormFieldChangeHandler}
                        loading={this.state.chart === null}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="card d-flex flex-column flex-grow">
              <div className="card-header">
                <FormattedMessage id="result" defaultMessage={`Result`} />
              </div>
              <div className="card-block d-flex flex-column">
                <ProductDetailPricingHistoryChart
                  product={this.props.apiResourceObject}
                  chart={this.state.chart}
                />
              </div>
            </div>
          </ApiForm>
        </div>
    )
  }
}

export default injectIntl(connect(
    addApiResourceStateToPropsUtils()
)(ProductDetailPricingHistory));