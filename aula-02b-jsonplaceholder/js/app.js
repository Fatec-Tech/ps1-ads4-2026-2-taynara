const URL_BASE = 'https://jsonplaceholder.typicode.com';

const telaLista = document.getElementById('tela-lista');
const telaDetalhe = document.getElementById('tela-detalhe');
const mensagemCarregando = document.getElementById('carregando');
const detalheNome = document.getElementById('detalhe-nome');
const listaPosts = document.getElementById('lista-posts');
const botaoVoltar = document.getElementById('btn-voltar');
const areaBusca = document.getElementById('area-busca');
const campoBusca = document.getElementById('campo-busca');
const contagemPosts = document.getElementById('contagem-posts');

let todosUsuarios = [];

async function carregarUsuarios() {
  try {
    const resposta = await fetch(`${URL_BASE}/users`);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    todosUsuarios = await resposta.json();
    renderizarListaUsuarios(todosUsuarios);
  } catch (erro) {
    console.error('Erro ao carregar usuários:', erro);
    mensagemCarregando.textContent = 'Não foi possível carregar os usuários.';
    return;
  }

  mensagemCarregando.style.display = 'none';
}

function pegarIniciais(nome) {
  return nome
    .split(' ')
    .filter((parte) => !parte.endsWith('.'))
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('');
}

function renderizarListaUsuarios(usuarios) {
  telaLista.innerHTML = '';

  if (usuarios.length === 0) {
    telaLista.innerHTML = '<p class="text-muted">Nenhum usuário encontrado.</p>';
    return;
  }

  usuarios.forEach((usuario) => {
    const item = document.createElement('div');
    item.className = 'item-usuario list-group-item list-group-item-action d-flex align-items-center gap-3 py-3';
    item.dataset.id = usuario.id;

    item.innerHTML = `
      <div class="avatar">${pegarIniciais(usuario.name)}</div>
      <div class="flex-grow-1">
        <div class="fw-semibold">${usuario.name}</div>
        <div class="small text-muted">${usuario.email} — ${usuario.company.name}</div>
        <div class="small text-muted d-flex flex-wrap gap-3">
          <span>Telefone: ${usuario.phone}</span>
          <span>Website: ${usuario.website}</span>
        </div>
      </div>
      <span class="seta">›</span>
    `;

    item.addEventListener('click', () => {
      abrirDetalheUsuario(usuario);
    });

    telaLista.appendChild(item);
  });
}

campoBusca.addEventListener('input', () => {
  const termo = campoBusca.value.toLowerCase().trim();

  const filtrados = todosUsuarios.filter((usuario) =>
    usuario.name.toLowerCase().includes(termo)
  );

  renderizarListaUsuarios(filtrados);
});

async function abrirDetalheUsuario(usuario) {
  detalheNome.textContent = `Posts de ${usuario.name}`;
  contagemPosts.textContent = '';
  listaPosts.innerHTML = '<li class="list-group-item">Carregando posts...</li>';

  telaLista.classList.add('d-none');
  areaBusca.classList.add('d-none');
  telaDetalhe.classList.remove('d-none');

  try {
    const resposta = await fetch(`${URL_BASE}/posts?userId=${usuario.id}`);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const posts = await resposta.json();
    renderizarPosts(posts);
  } catch (erro) {
    console.error('Erro ao carregar posts:', erro);
    listaPosts.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar posts.</li>';
  }
}

function renderizarPosts(posts) {
  listaPosts.innerHTML = '';

  if (posts.length === 0) {
    contagemPosts.textContent = '';
    listaPosts.innerHTML =
      '<li class="list-group-item text-muted">Este usuário ainda não publicou nenhum post.</li>';
    return;
  }

  contagemPosts.textContent =
    posts.length === 1 ? '1 post encontrado' : `${posts.length} posts encontrados`;

  posts.forEach((post) => {
    const item = document.createElement('li');
    item.className = 'list-group-item';
    item.innerHTML = `<strong>${post.title}</strong><p class="mb-0">${post.body}</p>`;
    listaPosts.appendChild(item);
  });
}

botaoVoltar.addEventListener('click', () => {
  telaDetalhe.classList.add('d-none');
  telaLista.classList.remove('d-none');
  areaBusca.classList.remove('d-none');
});

carregarUsuarios();