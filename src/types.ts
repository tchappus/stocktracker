import { AxiosResponse } from "axios";

class Asset {
    symbol: string;
    quantity: number;
    purchased: number;
    market?: number;

    constructor(symbol: string, quantity: number, purchased: number) {
        this.symbol = symbol;
        this.quantity = quantity;
        this.purchased = purchased;
    }

    getUnitPriceAtPurchase(): number {
        return this.purchased / this.quantity;
    }

    getUnitChange(unitPrice: number): number {
        return unitPrice - this.getUnitPriceAtPurchase();
    }

    getTotalChange(): number {
        return this.market - this.purchased;
    }

    getChangePercent(unitPrice: number): number {
        return (this.getUnitChange(unitPrice) / this.getUnitPriceAtPurchase()) * 100;
    }
}

type MarketDataResponse = {
    response: AxiosResponse;
    asset: Asset;
}


export { MarketDataResponse, Asset };