import { Axios, AxiosRequestConfig } from "axios";
import { Asset, MarketDataResponse } from "./types";
import { plot } from './chart';

const fs = require('fs');
const axios: Axios = require("axios").default;
const yfapikeyPath = process.argv[2];
const assetsCsvPath: string = process.argv[3];

if (assetsCsvPath === undefined) {
    throw new Error('assets CSV path required');
}

if (yfapikeyPath === undefined) {
    throw new Error('Yahoo Finance Key API path required');
}

const assetsCsvData: string = fs.readFileSync(assetsCsvPath, 'utf8');
const assetsCsvRows: string[] = assetsCsvData.split('\n').slice(1);

const yfapikey: string = fs.readFileSync(yfapikeyPath, 'utf8');

const assets: Asset[] = assetsCsvRows.map(row => {
    const cols: string[] = row.split(',');
    return new Asset(cols[0], parseFloat(cols[1]), parseFloat(cols[2]));
});

console.log('SYMBOL       QUANTITY     PURCHASED    MARKET       UNIT CHANGE    TOTAL CHANGE');
console.log('----------   ----------   ----------   ----------   ------------   -----------------------');

const promises: Promise<MarketDataResponse>[] = [];

for (var i = 0; i < assets.length; i++) {
    const asset = assets[i];
    var options: AxiosRequestConfig = {
        method: 'GET',
        url: `https://yfapi.net/v11/finance/quoteSummary/${asset.symbol}`,
        params: { modules: 'price' },
        headers: {
            'x-api-key': yfapikey
        }
    };

    promises.push(new Promise((resolve, reject) => {
        axios.request(options).then(response => resolve({ asset, response })).catch(error => reject(error));
    }));
}

Promise.all(promises).then(responses => {

    type Output = {
        totalChange: number;
        output: string;
    }

    const outputs: Output[] = [];

    for (var i = 0; i < responses.length; i++) {
        const response = responses[i];
        const s = response.asset;

        const unitPrice: number = response.response.data['quoteSummary']['result'][0]['price']['regularMarketPrice']['raw'];
        s.market = unitPrice * s.quantity;

        const sym = s.symbol.padEnd(10);
        const qu = s.quantity.toString().padStart(10);
        const pu = s.purchased.toFixed(2).padStart(10);
        const ma = (unitPrice === undefined ? '???' : s.market.toFixed(2)).padStart(10);

        const unitChange = s.getUnitChange(unitPrice);
        const down = unitChange < 0;
        const sign = down ? '-' : '+';
        const color = down ? '\x1b[31m' : '\x1b[32m';
        const emoji = down ? '🔻' : '🚀';
        const uca = Math.abs(unitChange).toFixed(2).padStart(7);
        const cp = Math.abs(s.getChangePercent(unitPrice)).toFixed(2).padStart(5);
        const uc = `${sign} $ ${uca}`.padStart(12);

        const tca = Math.abs(s.getTotalChange()).toFixed(2).padStart(7);
        const tc = `${sign} $ ${tca} ( ${cp} % )`.padStart(23);

        outputs.push({ totalChange: s.getTotalChange(), output: `${sym}   ${qu}   ${pu}   ${ma}   ${color}${uc}   ${tc}\x1b[0m ${emoji}` });
    }

    outputs.sort((a, b) => b.totalChange - a.totalChange);

    for (var i = 0; i < responses.length; i++) {
        console.log(outputs[i].output);
    }

    for (var i = 0; i < responses.length; i++) {
        const response = responses[i];
        const s = response.asset;

        plot(s.symbol, s.getUnitPriceAtPurchase(), yfapikey);
    }

}).catch(error => {
    console.error(error);
});

