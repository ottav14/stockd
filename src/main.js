import Display from './Display.js';
import { addListeners, updateDisplays } from './Display.js';

const count = 1;
const displays = [];

const addDisplay = async () => {
	const id = displays.length+1;
	const display = new Display('SPY', id);
	displays.push(display);
	
	addListeners(displays);
	await updateDisplays(displays);
}

for(let i=0; i<count; i++)
	await addDisplay();

document.getElementById('add-button').addEventListener('click', addDisplay);


