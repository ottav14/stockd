<script>
	import Papa from 'papaparse';
	import { onMount } from 'svelte';
	import Dropdown from './Dropdown.svelte';

	const canvasWidth = 800;
	const canvasHeight = 500;

	const padding = 50;
	const yLabelCount = 10;

	const tickers = { 
		'SPY': { underlying: 'S&P' },
		'GLD': { underlying: 'Gold' },
		'BTC': { underlying: 'Bitcoin' },
		'USO': { underlying: 'Oil' }
	};

	let ticker = 'SPY';
	let canvas;

	const line = (x1, y1, x2, y2, ctx) => {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	const getLow = (d) => {
		let low = 100000000;
		for(const p of d) low = p.Close < low ? p.Close : low;
		return low;
	}

	const getStartYear = (d) => {
		return Number(d[0].Date.slice(0, 4));
	}

	const getEndYear = (d) => {
		return Number(d[d.length-1].Date.slice(0, 4));
	}

	const getHigh = (d) => {
		let high = -100000000;
		for(const p of d) high = p.Close > high ? p.Close : high;
		return high;
	}

	const normalize = (p, low, high) => { 
		return canvasHeight - (p.Close - low) / (high - low) * (canvasHeight - 2*padding) - padding;
	}

	const denormalize = (y, low, high) => {
		return (canvasHeight - y - padding) / (canvasHeight - padding) * (high - low) + low;
	}

	const loadTicker = async (ticker) => {
		const data = await fetch(`/${ticker}.csv`);
		const text = await data.text();

		return Papa.parse(text, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true
		}).data;
	}

	const drawGraph = async () => {
		const d = await loadTicker(ticker);
		const ctx = canvas.getContext('2d');

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#000';
		ctx.font = "20px monospace";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";

		const pointCount = d.length;
		const low = getLow(d);
		const high = getHigh(d);
		const startYear = getStartYear(d);
		const endYear = getEndYear(d);
		for(let i=0; i<pointCount-1; i++) {
			const x1 = i * (canvas.width - 2*padding) / pointCount + padding;
			const x2 = (i+1) * (canvas.width - 2*padding) / pointCount + padding;
			const y1 = normalize(d[i], low, high);
			const y2 = normalize(d[i+1], low, high);
			line(x1, y1, x2, y2, ctx);
		}

		for(let i=0; i<=yLabelCount; i++) {
			const y = i * (canvas.height - 2*padding) / yLabelCount + padding;
			const val = Math.floor(denormalize(y, low, high));
			ctx.fillText(val, 10, y);
		}

		const yearCount = endYear - startYear;
		for(let i=0; i<yearCount; i++) {
			const x = i * (canvas.width - 2*padding) / yearCount + padding;
			const y = canvas.height - 15;
			const year = String(startYear + i).slice(-2);
			ctx.fillText(year, x, y);
		}
	}

	const handleTickerChange = async (e) => {
		ticker = e.detail;
		await drawGraph();
	}

	onMount(async () => {
		await drawGraph();
	});
</script>

<div class="container">
	<Dropdown on:change={(e) => handleTickerChange(e)} items={Object.keys(tickers)} active="SPY" />
	<p id="underlying">{tickers[ticker].underlying}</p>
	<canvas bind:this={canvas}></canvas>
</div>
