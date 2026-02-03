<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let items = [];
	export let active;
	let dropdown = false;

	const toggleDropdown = () => {
		dropdown = !dropdown;
	}

	const changeActive = (item) => {
		const temp = active;
		active = item;
		item = temp;
		toggleDropdown();
		dispatch('change', active);
	}

</script>

<div class="dropdown-container">
	<div id="dropdown-top">
		<div class="dropdown-field">
			<li class="dropdown-item">{active}</li>
		</div>
		<button on:click={toggleDropdown} class="dropdown-button">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="30px" height="30px" fill="#000"><path d="M480-360 280-559h400L480-360Z"/></svg>
		</button>
	</div>
	<div class:hidden={!dropdown} class="dropdown-extension">
		{#each items as item}
			<li on:click={() => changeActive(item)} class="dropdown-item">{item}</li>
		{/each}
	</div>
</div>

<style>
.dropdown-button {
	display: flex;
	justify-content: center;
	align-items: center;
	aspect-ratio: 1 / 1;
	border: none;
	border-left: 1px solid #000;
}

.dropdown-item {
	background-color: #fff;
	padding: 0.5rem;
}

.dropdown-item:hover {
	background-color: #ddd;
}

.dropdown-extension {
	position: absolute;
	width: 100%;
	top: 100%;
	left: -1px;
	border: 1px solid #000;
}

.hidden {
	display: none;
}
</style>
