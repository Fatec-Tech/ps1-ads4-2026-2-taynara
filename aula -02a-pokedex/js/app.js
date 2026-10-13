const API_URL = 'https://pokeapi.co/api/v2/pokemon';
 
const pokemonGrid = document.getElementById('pokemonGrid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
 

async function fetchPokemonData(urlOrName) {
	const url = urlOrName.startsWith('http')
		? urlOrName
		: `${API_URL}/${urlOrName.toLowerCase().trim()}`;
 
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('Pokémon não encontrado');
	}
	console.log('Response:', response); 
	return await response.json();
}
 

async function loadInitialPokemon(limit = 20) {
	showLoading(true);
	pokemonGrid.innerHTML = '';
 
	try {
		const response = await fetch(`${API_URL}?limit=${limit}`);
		const data = await response.json();
 
		
		const pokemonPromises = data.results.map((item) =>
			fetchPokemonData(item.url)
		);
		const pokemonList = await Promise.all(pokemonPromises);
 
		// Renderiza cada card
		pokemonList.forEach(renderPokemonCard);
	} catch (error) {
		showError('Erro ao carregar a lista de Pokémon.');
		console.error(error);
	} finally {
		showLoading(false);
	}
}
 

function renderPokemonCard(pokemon) {
	console.log('Rendering Pokémon:', pokemon); 
	
	const imageUrl =
		pokemon.sprites.other['official-artwork'].front_default ||
		pokemon.sprites.front_default;
 
	
	const typesBadges = pokemon.types
		.map(
			(t) =>
				`<span class="badge badge-type">${t.type.name}</span>`
		)
		.join('');
 
	// peso (em kg) e altura (em m)
	const heightInMeters = (pokemon.height / 10).toFixed(1);
	const weightInKg = (pokemon.weight / 10).toFixed(1);
 
	
	const cardHTML = `
        <div class="col">
          <div class="card h-100 shadow-sm pokemon-card border-0" style="cursor: pointer;" onclick="openPokemonModal(${pokemon.id})">
            <div class="text-center p-3 bg-white rounded-top">
              <img src="${imageUrl}" class="card-img-top img-fluid" style="max-height: 160px; object-fit: contain;" alt="${pokemon.name}">
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title text-capitalize fw-bold m-0">${pokemon.name}</h5>
                <small class="text-muted">#${String(pokemon.id).padStart(3, '0')}</small>
              </div>
              <div class="mb-3">
                ${typesBadges}
              </div>
              <div class="row text-center border-top pt-2">
                <div class="col-6 border-end">
                  <small class="text-muted d-block">Altura</small>
                  <strong>${heightInMeters} m</strong>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">Peso</small>
                  <strong>${weightInKg} kg</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
 
	pokemonGrid.insertAdjacentHTML('beforeend', cardHTML);
}
 

async function handleSearch() {
	const query = searchInput.value.trim();
	if (!query) {
		loadInitialPokemon();
		return;
	}
 
	showLoading(true);
	pokemonGrid.innerHTML = '';
 
	try {
		const pokemon = await fetchPokemonData(query);
		renderPokemonCard(pokemon);
	} catch (error) {
		showError(`Nenhum Pokémon encontrado com o termo "${query}".`);
	} finally {
		showLoading(false);
	}
}
 

function showLoading(state) {
	if (state) {
		loading.classList.remove('d-none');
	} else {
		loading.classList.add('d-none');
	}
}
 
function showError(message) {
	pokemonGrid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-primary text-center" role="alert">
            ${message}
          </div>
        </div>
      `;
}
 

function buildStatBar(label, value, colorClass) {
	const width = Math.min(value, 100); // não deixa a barra passar de 100%
	return `
		<div class="mb-2">
			<small class="fw-bold">${label}: ${value}</small>
			<div class="progress" style="height: 10px;">
				<div class="progress-bar ${colorClass}" role="progressbar"
					style="width: ${width}%;"
					aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"></div>
			</div>
		</div>`;
}
 
// Monta o conteúdo do modal a partir dos dados do Pokémon
function fillPokemonModal(pokemon) {
	// 1. Stats (a API devolve uma lista: hp, attack, defense, special-attack, special-defense, speed)
	const hp = pokemon.stats[0].base_stat;
	const attack = pokemon.stats[1].base_stat;
	const defense = pokemon.stats[2].base_stat;
	const speed = pokemon.stats[5].base_stat;
 
	// 2. Habilidades
	const abilities = pokemon.abilities
		.map(
			(item) =>
				`<span class="badge badge-habilidade text-capitalize me-1">${item.ability.name}</span>`
		)
		.join('');
 
	// 3. Som (cries.latest ou, se não existir, cries.legacy)
	const cry = pokemon.cries.latest || pokemon.cries.legacy;
 
	// 4. Sprites: só mostra os que existem (alguns Pokémon não têm todos)
	const sprites = [
		[pokemon.sprites.front_default, 'Frente'],
		[pokemon.sprites.back_default, 'Costas'],
		[pokemon.sprites.front_shiny, 'Frente Shiny'],
		[pokemon.sprites.back_shiny, 'Costas Shiny'],
	]
		.filter(([src]) => src)
		.map(([src, label]) => `<img src="${src}" title="${label}" alt="${label}">`)
		.join('');
 
	// 5. Preenche o modal
	document.getElementById('pokemonModalTitle').textContent =
		`${pokemon.name} #${String(pokemon.id).padStart(3, '0')}`;
 
	document.getElementById('pokemonModalBody').innerHTML = `
		<h6>Sprites</h6>
		<div class="text-center mb-3 sprites-box">${sprites}</div>
 
		<h6>Status Base</h6>
		${buildStatBar('HP', hp, 'bar-azul')}
		${buildStatBar('Ataque', attack, 'bar-azul')}
		${buildStatBar('Defesa', defense, 'bar-azul')}
		${buildStatBar('Velocidade', speed, 'bar-azul')}
 
		<h6 class="mt-3">Habilidades</h6>
		<div class="mb-3">${abilities}</div>
 
		<h6>Som</h6>
		${cry ? `<audio controls class="w-100" src="${cry}"></audio>` : '<p class="text-muted">Sem áudio.</p>'}
	`;
 
}
 

async function openPokemonModal(id) {
	const title = document.getElementById('pokemonModalTitle');
	const body = document.getElementById('pokemonModalBody');
 
	
	title.textContent = 'Carregando...';
	body.innerHTML = `
		<div class="text-center py-5">
			<div class="spinner-border" role="status">
				<span class="visually-hidden">Carregando...</span>
			</div>
		</div>`;
	bootstrap.Modal.getOrCreateInstance(
		document.getElementById('pokemonModal')
	).show();
 
	try {
		
		const pokemon = await fetchPokemonData(String(id));
		fillPokemonModal(pokemon);
	} catch (error) {
		console.error(error);
		title.textContent = 'Ops!';
		body.innerHTML = `
			<div class="alert alert-primary text-center mb-0" role="alert">
				Não foi possível carregar os detalhes. Verifique sua conexão e tente de novo.
			</div>`;
	}
}
 

document
	.getElementById('pokemonModal')
	.addEventListener('hidden.bs.modal', () => {
		const audio = document.querySelector('#pokemonModalBody audio');
		if (audio) audio.pause();
	});
 
// Eventos
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') handleSearch();
});
 

loadInitialPokemon();