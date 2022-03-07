# Stock Tracker (Node.js Console App)

## Summary

This Node.js app is written in TypeScript and allows one to track their investments.

Given a CSV file with the asset symbols and purchase prices, the app will print the current value with charts to illustrate gains/losses. The Yahoo Finance API is leveraged to fetch current market data.

## Set-up

Clone the repo and run `npm install`, then fill out the assets.csv file with the stocks you'd like to track. Provide your Yahoo Finance API key (available [here](https://www.yahoofinanceapi.com/)) in yfapikey.txt, then run with `npm run start`.