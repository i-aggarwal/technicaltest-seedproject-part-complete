import Store from "../Store";
import mockData from "../../../public/db.json";

describe("filter", () => {
  let sut;
  beforeEach(() => {
    sut = new Store();
    sut.setDeals(mockData.deals);
  });

  it("should call filterByState as many times as there are number of deals", () => {
    const spy = jest.spyOn(sut, "filterByState");
    const result = sut.deals;
    expect(spy).toHaveBeenCalledTimes(mockData.deals.length);
  });

  it("should return all deals when no filters applied", () => {
    const result = sut.deals;
    expect(result).toEqual(mockData.deals);
  });

  it("should return four deals when productType is set to broadband", () => {
    sut.setProductFilter("broadband");
    const result = sut.deals;
    expect(result.length).toEqual(4);
  });

  it("should return four deals when productType is set to broadband and tv", () => {
    sut.setProductFilter("broadband");
    sut.setProductFilter("tv");
    const result = sut.deals;
    expect(result.length).toEqual(4);
  });

  it("should return one deal when productType is set to broadband and mobile", () => {
    sut.setProductFilter("broadband");
    sut.setProductFilter("mobile");
    const result = sut.deals;
    expect(result.length).toEqual(1);
  });

  it("should return one deal when productType is not set and provider is sky", () => {
    sut.setProviderFilter(1);
    const result = sut.deals;
    expect(result.length).toEqual(1);
    expect(result[0].provider.id).toEqual(1);
  });

  it("should return two deals when productType is set to broadband and tv and provider is BT", () => {
    sut.setProviderFilter(3);
    sut.setProductFilter("broadband");
    sut.setProductFilter("tv");
    const result = sut.deals;
    expect(result.length).toEqual(2);
  });

  describe("filter by provider", () => {
    describe("isProviderFilterStateSet", () => {
      it("should return false if provider state is not set", () => {
        const result = sut.isProviderFilterStateSet();
        expect(result).toEqual(false);
      });

      it("should return true if provider state is set", () => {
        sut.setProviderFilter(99);
        const result = sut.isProviderFilterStateSet();
        expect(result).toEqual(true);
      });
    });

    describe("isDealOfferedByProviderFromFilterState", () => {
      it("should have called isProviderFilterStateSet", () => {
        const spy = jest.spyOn(sut, "isProviderFilterStateSet");
        const plusNetDeal = sut.state.deals[1];
        sut.isDealOfferedByProviderFromFilterState(plusNetDeal);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it("should return true if the state is not set", () => {
        const plusNetDeal = sut.state.deals[1];
        const result = sut.isDealOfferedByProviderFromFilterState(plusNetDeal);
        expect(result).toEqual(true);
      });

      it("should return true if the provider filter state is set to plusnet", () => {
        sut.setProviderFilter(42);
        const plusNetDeal = sut.state.deals[1];
        const result = sut.isDealOfferedByProviderFromFilterState(plusNetDeal);
        expect(result).toEqual(true);
      });

      it("should return false if the provider filter state is not set to plusnet", () => {
        sut.setProviderFilter(50);
        const plusNetDeal = sut.state.deals[1];
        const result = sut.isDealOfferedByProviderFromFilterState(plusNetDeal);
        expect(result).toEqual(false);
      });
    });
  });

  describe("filter by product type", () => {
    describe("isProductFilterStateSet", () => {
      it("should return false if provider state is not set", () => {
        const result = sut.isProductFilterStateSet();
        expect(result).toEqual(false);
      });

      it("should return true if provider state is set", () => {
        sut.setProductFilter("value");
        const result = sut.isProductFilterStateSet();
        expect(result).toEqual(true);
      });
    });

    describe('getDealProductsForFiltering', () => {
      it('should return a string type', () => {
        expect(typeof sut.getDealProductsForFiltering(sut.state.deals[1])).toEqual("string");
      });

      it("should filter out phone", () => {
        const deal = sut.state.deals[0];
        deal.productTypes.push('Phone');
        expect(sut.getDealProductsForFiltering(deal).indexOf('phone')).toEqual(-1);
      });

      it('should convert fiber broadband to broadband', () => {
        const deal = sut.state.deals[0];
        deal.productTypes.push('Fibre Broadband');
        expect(sut.getDealProductsForFiltering(deal).indexOf('fiber broadband')).toEqual(-1);
        expect(sut.getDealProductsForFiltering(deal).indexOf('broadband')).toBeGreaterThan(-1);

      });

      it('should return sorted string', () => {
        const deal = {...sut.state.deals[0]};
        deal.productTypes = ['Mobile', 'TV', 'Broadband'];
        const expected = 'broadbandmobiletv';
        expect(sut.getDealProductsForFiltering(deal)).toEqual(expected);
      });

      it('should remove duplicates', () => {
        const deal = {...sut.state.deals[0]};
        deal.productTypes = ['Mobile', 'TV', 'Broadband', 'Fibre Broadband', 'TV'];
        const expected = 'broadbandmobiletv';
        expect(sut.getDealProductsForFiltering(deal)).toEqual(expected);
      });
    });

    describe("doesDealOfferProductTypesFromFilterState", () => {
      it("should have called isProductFilterStateSet", () => {
        const spy = jest.spyOn(sut, "isProductFilterStateSet");
        sut.setProductFilter("broadband");
        const broadbandDeal = sut.state.deals[1];
        sut.doesDealOfferProductTypesFromFilterState(broadbandDeal);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it("should have called getDealProductsForFiltering", () => {
        const spy = jest.spyOn(sut, "getDealProductsForFiltering");
        sut.setProductFilter("broadband");
        sut.doesDealOfferProductTypesFromFilterState(sut.state.deals[1]);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it("should return true if the state is not set", () => {
        const broadbandDeal = sut.state.deals[1];
        const result = sut.doesDealOfferProductTypesFromFilterState(broadbandDeal);
        expect(result).toEqual(true);
      });

      it("should return true if the prodyct type filter state is set to broadband and the deal has product type as broadband and phone", () => {
        sut.setProductFilter("broadband");
        const broadbandDeal = sut.state.deals[1];
        const result = sut.doesDealOfferProductTypesFromFilterState(broadbandDeal);
        expect(result).toEqual(true);
      });

      it("should return false if the prodyct type filter state is not set to broadband and the deal has product type as broadband and phone", () => {
        sut.setProductFilter("tv");
        const broadbandDeal = sut.state.deals[1];
        const result = sut.doesDealOfferProductTypesFromFilterState(broadbandDeal);
        expect(result).toEqual(false);
      });

      it("should return false if the prodyct type filter state is set to broadband Deal and the deal has product type as tv, broadband and phone", () => {
        sut.setProductFilter("broadband");
        const broadbandDeal = sut.state.deals[5];
        const result = sut.doesDealOfferProductTypesFromFilterState(broadbandDeal);
        expect(result).toEqual(false);
      });

      it("should return true if the prodyct type filter state is not set to broadband and tv and the deal has product type as tv, broadband and phone", () => {
        sut.setProductFilter("broadband");
        sut.setProductFilter("tv");
        const broadbandDeal = sut.state.deals[5];
        const result = sut.doesDealOfferProductTypesFromFilterState(broadbandDeal);
        expect(result).toEqual(true);
      });

      it("should return true if the prodyct type filter state is set to broadband and the deal has product type as fiber broadband and phone", () => {
        sut.setProductFilter("broadband");
        const broadbandDeal = sut.state.deals[3];
        const result = sut.doesDealOfferProductTypesFromFilterState(broadbandDeal);
        expect(result).toEqual(true);
      });
    });

    describe('filterByState', () => {
      it('should call isDealOfferedByProviderFromFilterState and doesDealOfferProductTypesFromFilterState if none of the filters are set', () => {
        const providerSpy = jest.spyOn(sut, "isDealOfferedByProviderFromFilterState");
        const productSpy = jest.spyOn(sut, "isDealOfferedByProviderFromFilterState");
        const broadbandDeal = sut.state.deals[0];
        sut.filterByState(broadbandDeal);
        expect(providerSpy).toHaveBeenCalled();
        expect(productSpy).toHaveBeenCalled();
      });

      it('should call isDealOfferedByProviderFromFilterState and doesDealOfferProductTypesFromFilterState if both the filters are set', () => {
        const providerSpy = jest.spyOn(sut, "isDealOfferedByProviderFromFilterState");
        const productSpy = jest.spyOn(sut, "isDealOfferedByProviderFromFilterState");
        sut.setProductFilter("broadband");
        sut.setProviderFilter(42);
        const broadbandDeal = sut.state.deals[0];
        sut.filterByState(broadbandDeal);
        expect(providerSpy).toHaveBeenCalled();
        expect(productSpy).toHaveBeenCalled();
      });
  
      describe('only product type set', () => {
        it('should call isDealOfferedByProviderFromFilterState and doesDealOfferProductTypesFromFilterState', () => {
          const providerSpy = jest.spyOn(sut, "isDealOfferedByProviderFromFilterState");
          const productSpy = jest.spyOn(sut, "isDealOfferedByProviderFromFilterState");
          sut.setProductFilter("broadband");
          const broadbandDeal = sut.state.deals[0];
          sut.filterByState(broadbandDeal);
          expect(providerSpy).toHaveBeenCalled();
          expect(productSpy).toHaveBeenCalled();
        });

        it('should return true', () => {
          sut.setProductFilter("broadband");
          const broadbandDeal = sut.state.deals[0];
          const result = sut.filterByState(broadbandDeal);
          expect(result).toEqual(true);
        });

        it("should return false", () => {
          sut.setProductFilter("tv");
          const broadbandDeal = sut.state.deals[0];
          const result = sut.filterByState(broadbandDeal);
          expect(result).toEqual(false);
        });
      });

      describe('only provider set', () => {
        it('should call isDealOfferedByProviderFromFilterState and doesDealOfferProductTypesFromFilterState', () => {
          const providerSpy = jest.spyOn(sut, "isDealOfferedByProviderFromFilterState");
          const productSpy = jest.spyOn(sut, "isDealOfferedByProviderFromFilterState");
          sut.setProviderFilter(42);
          const broadbandDeal = sut.state.deals[0];
          sut.filterByState(broadbandDeal);
          expect(providerSpy).toHaveBeenCalled();
          expect(productSpy).toHaveBeenCalled();
        });

        it('should return true of the deal is offered by provider', () => {
          sut.setProviderFilter(42);
          const broadbandDeal = sut.state.deals[1];
          const result = sut.filterByState(broadbandDeal);
          expect(result).toEqual(true);
        });

        it("should return false if provider does not offer the deal", () => {
          sut.setProviderFilter(42);
          const broadbandDeal = sut.state.deals[0];
          const result = sut.filterByState(broadbandDeal);
          expect(result).toEqual(false);
        });
      });

      describe('both provider and productTypes are set', () => {
        it('should call isDealOfferedByProviderFromFilterState and doesDealOfferProductTypesFromFilterState', () => {
          const providerSpy = jest.spyOn(sut, "isDealOfferedByProviderFromFilterState");
          const productSpy = jest.spyOn(sut, "isDealOfferedByProviderFromFilterState");
          sut.setProviderFilter(42);
          sut.setProductFilter("broadband");
          const broadbandDeal = sut.state.deals[0];
          sut.filterByState(broadbandDeal);
          expect(providerSpy).toHaveBeenCalled();
          expect(productSpy).toHaveBeenCalled();
        });

        it('should return true of the deal is offered by provider and deal offers broadband', () => {
          sut.setProviderFilter(42);
          sut.setProductFilter("broadband");
          const broadbandDeal = sut.state.deals[1];
          const result = sut.filterByState(broadbandDeal);
          expect(result).toEqual(true);
        });

        it("should return false if provider offers the deal, but the deal does not offer products", () => {
          sut.setProviderFilter(42);
          sut.setProductFilter("broadband");
          sut.setProductFilter("tv");
          const broadbandDeal = sut.state.deals[1];
          const result = sut.filterByState(broadbandDeal);
          expect(result).toEqual(false);
        });

        it("should return false if provider does not offer the deal, but the deal offers the products", () => {
          sut.setProviderFilter(42);
          sut.setProductFilter("broadband");
          sut.setProductFilter("tv");
          sut.setProductFilter("mobile");
          const broadbandDeal = sut.state.deals[9];
          const result = sut.filterByState(broadbandDeal);
          expect(result).toEqual(false);
        });

        it("shoukd return false if the deal is neither offered by provider not the deal offers the products", () => {
          sut.setProviderFilter(42);
          sut.setProductFilter("broadband");
          sut.setProductFilter("tv");
          sut.setProductFilter("mobile");
          const broadbandDeal = sut.state.deals[0];
          const result = sut.filterByState(broadbandDeal);
          expect(result).toEqual(false);
        })
      });
    });

  });
});
