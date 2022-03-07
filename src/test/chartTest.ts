import data from './chart.json';
import { chart } from '../chart';

const prices: number[] = data.chart.result[0].indicators.quote[0].open;

const timestamps: number[] = data.chart.result[0].timestamp;

chart(timestamps, prices, 150);