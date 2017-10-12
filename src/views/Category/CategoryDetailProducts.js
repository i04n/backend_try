import React, {Component} from 'react'
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import connect from "react-redux/es/connect/connect";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import ApiForm from "../../api_forms/ApiForm";
import ApiFormChoiceField from "../../api_forms/ApiFormChoiceField";
import {FormattedMessage} from "react-intl";
import ApiFormResultTableWithPagination from "../../api_forms/ApiFormResultTableWithPagination";
import {NavLink} from "react-router-dom";
import ApiFormTextField from "../../api_forms/ApiFormTextField";
import "./CategoryDetailProducts.css"
import ApiFormDiscreteRangeField from "../../api_forms/ApiFormDiscreteRangeField";
import ApiFormContinuousRangeField from "../../api_forms/ApiFormContinouousRangeField";

class CategoryDetailProducts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formLayouts: undefined,
      formLayout: undefined,
      apiFormFieldChangeHandler: undefined,
      formValues: {},
      productsPage: undefined,
      formChoices: {}

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

  setProductsPage = json => {
    if (json) {
      this.setState({
        productsPage: {
          count: json.payload.count,
          results: json.payload.results
        },
        formChoices: json.payload.aggs
      })
    } else {
      // Keep the old formChoices to prevent the form fields from resetting so much
      this.setState({
        productsPage: null
      })
    }
  };

  componentDidMount() {
    const countryUrls = this.props.stores.map(store => this.props.ApiResourceObject(store).country.url);
    const preferredCountryUrl = this.props.preferredCountry.url;

    this.props.fetchAuth(settings.apiResourceEndpoints.category_specs_form_layouts + '?category=' + this.props.apiResourceObject.id)
        .then(all_form_layouts => {
          const processed_form_layouts = all_form_layouts
              .filter(layout => layout.country === null || countryUrls.includes(layout.country))
              .map(layout => {
                let priority = 0;
                if (layout.country === preferredCountryUrl) {
                  priority = 2
                } else if (layout.country === null) {
                  priority = 1
                }
                return {
                  ...layout,
                  priority
                }
              });

          processed_form_layouts.sort((a, b) => b.priority - a.priority);
          this.setState({
            formLayouts: processed_form_layouts,
            formLayout: processed_form_layouts[0],
          })
        })
  }

  render() {
    const formLayout = this.state.formLayout;
    let products = null;

    if (this.state.productsPage) {
      products = this.state.productsPage
    }

    const formChoices = this.state.formChoices;

    if (!formLayout) {
      return <Loading />
    }

    const apiFormFields = ['page', 'page_size', 'search'];
    const processedFormLayout = [{
      label: <FormattedMessage id="keywords" defaultMessage="Keywords" />,
      filters: [{
        name: 'search',
        component: <ApiFormTextField
            name="search"
            placeholder={<FormattedMessage id="keywords" defaultMessage="Keywords" />}
            onChange={this.state.apiFormFieldChangeHandler}
            value={this.state.formValues.search}
            debounceTimeout={500}
        />
      }]
    }];

    for (const fieldset of formLayout.fieldsets) {
      const fieldSetFilters = [];
      for (const filter of fieldset.filters) {
        apiFormFields.push(filter.name);
        let originalFilterChoices = formChoices[filter.name];
        let filterComponent = null;
        if (filter.type === 'exact') {
          let filterChoices = undefined;
          if (originalFilterChoices) {
            filterChoices = originalFilterChoices.map(choice => ({
              ...choice,
              name: `${choice.label} (${choice.doc_count})`
            }));
          }

          filterComponent = <ApiFormChoiceField
              name={filter.name}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
              value={this.state.formValues[filter.name]}
              multiple={true}
          />
        } else if (filter.type === 'lte') {
          let accumulatedDocCount = 0;
          let filterChoices = originalFilterChoices.map(choice => {
            accumulatedDocCount += choice.doc_count

            return {
              ...choice,
              name: `${choice.label} (${accumulatedDocCount})`
            };
          });

          filterComponent = <ApiFormChoiceField
              name={filter.name}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
              value={this.state.formValues[filter.name]}
          />
        } else if (filter.type === 'gte') {
          let filterChoices = undefined;

          if (originalFilterChoices) {
            let resultCount = originalFilterChoices.reduce((acum, choice) => acum + choice.doc_count, 0)

            filterChoices = originalFilterChoices.map(choice => {
              let result = {
                ...choice,
                name: `${choice.label} (${resultCount})`
              };

              resultCount -= choice.doc_count;

              return result
            });
          }

          filterComponent = <ApiFormChoiceField
              name={filter.name}
              apiField={filter.name + '_0'}
              urlField={filter.name + '_start'}
              choices={filterChoices}
              placeholder={filter.label}
              searchable={true}
              onChange={this.state.apiFormFieldChangeHandler}
              value={this.state.formValues[filter.name]}
          />
        } else if (filter.type === 'range') {
          if (filter.continuous_range_step) {
            // Continous (weight....)
            filterComponent = <ApiFormContinuousRangeField
                name={filter.name}
                label={filter.label}
                onChange={this.state.apiFormFieldChangeHandler}
                choices={originalFilterChoices}
                value={this.state.formValues[filter.name]}
                step={filter.continuous_range_step}
                unit={filter.continuous_range_unit}
            />
          } else {
            // Discrete (screen size...)
            filterComponent = <ApiFormDiscreteRangeField
                name={filter.name}
                label={filter.label}
                onChange={this.state.apiFormFieldChangeHandler}
                choices={originalFilterChoices}
                value={this.state.formValues[filter.name]}
            />
          }
        }

        fieldSetFilters.push({
          ...filter,
          component: filterComponent,
        })
      }

      processedFormLayout.push({
        label: fieldset.label,
        filters: fieldSetFilters
      })
    }

    const columns = [
      {
        label: <FormattedMessage id="name" defaultMessage='Name' />,
        ordering: 'name',
        renderer: result => <NavLink to={'/products/' + result.id}>{result.name}</NavLink>
      },
    ];

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={[`categories/${this.props.apiResourceObject.id}/products/`]}
              fields={apiFormFields}
              onResultsChange={this.setProductsPage}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}
              updateOnChange={true}>
            <div className="row">
              <div className="col-12 col-md-6 col-lg-8 col-xl-8">
                <ApiFormResultTableWithPagination
                    page_size_choices={[50, 100, 200]}
                    page={this.state.formValues.page}
                    page_size={this.state.formValues.page_size}
                    data={products}
                    onChange={this.state.apiFormFieldChangeHandler}
                    columns={columns}
                    ordering={this.state.formValues.ordering}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4 col-xl-4">
                <div className="card">
                  <div className="card-header">
                    <i className="glyphicons glyphicons-search">&nbsp;</i>
                    <FormattedMessage id="filters" defaultMessage="Filters" />
                  </div>
                  <div className="card-block">
                    {processedFormLayout.map(fieldset => (
                        <fieldset key={fieldset.label}>
                          <legend>{fieldset.label}</legend>
                          {fieldset.filters.map(filter => (
                              <div key={filter.name} className="pb-2">
                                {filter.component}
                              </div>
                          ))}
                        </fieldset>
                    ))}
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

  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps))(CategoryDetailProducts);