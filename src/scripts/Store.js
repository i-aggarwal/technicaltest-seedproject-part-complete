import Observable from "./Observable";

class Store extends Observable {
  constructor() {
    super();
    this.state = {
      deals: [],
      productFilters: [],
      providerFilter: null
    };

    this.filterByState = this.filterByState.bind(this);
  }

  get deals() {
    return this.filter();
  }

  get productFilters() {
    return this.state.productFilters.sort().join('').toLowerCase();
  }

  filter() {
    return this.state.deals
      .filter(this.filterByState)
  }

  filterByState(deal) {
    return this.isDealOfferedByProviderFromFilterState(deal) && this.doesDealOfferProductTypesFromFilterState(deal);
  }

  isDealOfferedByProviderFromFilterState(deal) {
    return !this.isProviderFilterStateSet() || deal.provider.id === this.state.providerFilter;
  }

  isProviderFilterStateSet() {
    return !!this.state.providerFilter;
  }

  doesDealOfferProductTypesFromFilterState(deal) {
    return !this.isProductFilterStateSet()
      || this.getDealProductsForFiltering(deal) === this.productFilters;
  }

  isProductFilterStateSet() {
    return this.state.productFilters
      && this.state.productFilters.length > 0;
  }

  getDealProductsForFiltering(deal) {
    return deal.productTypes
      .filter(productType => productType !== 'Phone')
      .map(productType => productType === 'Fibre Broadband' ? 'broadband' : productType.toLowerCase())
      .filter((productType, index, array) => array.indexOf(productType) === index)
      .sort()
      .join('');
  }

  setDeals(data) {
    this.state.deals = data;
    this.notify(this.state);
  }

  setProductFilter(value) {
    const filter = value.trim().toLowerCase();
    const index = this.state.productFilters.indexOf(filter);
    if (index === -1) {
      this.state.productFilters.push(filter);
    } else {
      this.state.productFilters.splice(index, 1);
    }
    this.notify(this.state);
  }

  setProviderFilter(value = null) {
    this.state.providerFilter = value;
    this.notify(this.state);
  }
}

export default Store;
