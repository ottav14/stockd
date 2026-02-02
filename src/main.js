import Display from './Display.js';
import { addListeners, updateDisplay } from './Display.js';

const count = 1;
const displays = [];

const addDisplay = async () => {
	const id = displays.length+1;
	const display = new Display('SPY', id);
	displays.push(display);
	
	addListeners(displays);
}

for(let i=0; i<count; i++)
	await addDisplay();

for(const display of displays) {
	await updateDisplay(display);
}


