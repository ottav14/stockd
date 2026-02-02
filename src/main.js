import { addDisplay, addListeners, updateDisplay } from './Display.js';

const count = 3;
const displays = [];

for(let i=0; i<count; i++)
	displays.push(await addDisplay());

for(const display of displays) {
	await updateDisplay(display);
	addListeners(display);
}


