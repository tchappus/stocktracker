import axios, { AxiosRequestConfig } from 'axios';
const asciichart = require('asciichart');

export function chart(timestamps: number[], prices: number[], purchasePrice: number) {
    const numPrices = 130;

    const first = timestamps[0];
    const last = timestamps[timestamps.length - 1];

    const step = (last - first) / numPrices;

    const toPlot: number[] = [];

    for (var i = first; i <= last; i = i + step) {
        const next = i + step;


        var count = 0;
        var sum = 0;

        for (var j = timestamps[0]; j < next; j = timestamps[0]) {
            if (prices[0] != null) {
                sum += prices.shift();
                count++;
            } else {
                prices.shift();
            }

            timestamps.shift();
        }

        if (sum > 0) {
            toPlot.push(sum / count);
        } else {
            toPlot.push(toPlot.length > 0 ? toPlot[toPlot.length - 1] : null);
        }
    }

    const purchased: number[] = [];

    for (var i = 0; i < toPlot.length; i++) {
        purchased.push(purchasePrice);
    }

    const colour = purchased[purchased.length - 1] > toPlot[toPlot.length - 1] ? asciichart.red : asciichart.green;

    console.log(asciichart.plot([toPlot, purchased], {
        colors: [colour, asciichart.darkgray],
        height: 30
    }));
}


export function plot(symbol: string, purchasePrice: number, yfapikey: string) {
    const options: AxiosRequestConfig = {
        method: 'GET',
        url: `https://yfapi.net/v8/finance/chart/${symbol}`,
        params: { range: '5d', region: 'US', interval: '15m', lang: 'en', events: 'div,split' },
        headers: {
            'x-api-key': yfapikey
        }
    };

    axios.request(options).then(response => {

        console.log(`SYMBOL: ${symbol}`)

        chart(response.data.chart.result[0].timestamp, response.data.chart.result[0].indicators.quote[0].open, purchasePrice);
    }).catch(error => console.log(error));
}
