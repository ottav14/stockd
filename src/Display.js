import Papa from "papaparse";

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

const displays = [];

export const addDisplay = async () => {
	const id = displays.length+1;
	const display = new Display('SPY', id);
	displays.push(display);

	return display;
}

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

const drawGraph = async (display) => {
	const d = await loadTicker(display.ticker);
	const canvas = document.getElementById(`canvas-${display.num}`);
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


const toggleDropdown = (display) => {
	display.dropdown = !display.dropdown;
	const extension = document.getElementById(`dropdown-extension-${display.num}`);
	if(display.dropdown)
		extension.classList.remove('hidden');
	else
		extension.classList.add('hidden');
}

export const updateDisplay = async (display) => {
	const underlying = document.getElementById(`underlying-${display.num}`);

	underlying.innerText = tickers[display.ticker].underlying;
	await drawGraph(display);
}

export const addListeners = (display) => {
	document.getElementById(`dropdown-button-${display.num}`).addEventListener('click', () => toggleDropdown(display));

	document.querySelectorAll(`.dropdown-item-${display.num}`).forEach(item => {
		const activeItem = document.getElementById(`active-item-${display.num}`);
		item.addEventListener('click', async () => {
			display.ticker = item.innerText;
			const temp = activeItem.innerText;
			activeItem.innerText = item.innerText;
			item.innerText = temp;
			toggleDropdown(display);
			await updateDisplay(display);
		});
	});
}

class Display {
	constructor(ticker, num) {
		this.ticker = ticker;
		this.num = num;
		this.dropdown = false;

		document.body.innerHTML += `
		<div class="container">
			<div class="dropdown-container">
				<div id="dropdown-top">
					<div class="dropdown-field">
						<li id="active-item-${num}" class="dropdown-item dropdown-item-${num}">SPY</li>
					</div>
					<button id="dropdown-button-${num}" class="dropdown-button">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="30px" height="30px" fill="#000"><path d="M480-360 280-559h400L480-360Z"/></svg>
					</button>
				</div>
				<div class="hidden dropdown-extension" id="dropdown-extension-${num}">
					<li class="dropdown-item dropdown-item-${num}">GLD</li>
					<li class="dropdown-item dropdown-item-${num}">USO</li>
					<li class="dropdown-item dropdown-item-${num}">BTC</li>
				</div>
			</div>
			<p id="underlying-${num}">S&P</p>
			<canvas id="canvas-${num}"></canvas>
		</div>`;

	}





}
export default Display;
