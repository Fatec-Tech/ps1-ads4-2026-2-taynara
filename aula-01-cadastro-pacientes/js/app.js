// Array que guarda os pacientes cadastrados (em memória, só nesta sessão)
const pacientes = [];

// Referências aos elementos do DOM que vamos usar várias vezes
const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');

// Função responsável por adicionar um paciente ao array
function adicionarPaciente(nome, email, telefone, nascimento) {
  
  const emailExiste = pacientes.some(
    (paciente) => paciente.email.toLowerCase() === email.toLowerCase()
  );  
  if (emailExiste) {
    alert('Este e-mail já está cadastrado!');
    return false;
  }
 
  const novoPaciente = { nome, email, telefone, nascimento };
  pacientes.push(novoPaciente);
  salvarNoLocalStorage();
  return true;
}
function atualizarContador() {
  const elementoContador = document.getElementById('contador-pacientes'); 
  if (elementoContador) {
    elementoContador.textContent = `Total de pacientes: ${pacientes.length}`;
  }
}
// Funcao para remover um paciente do array pelo e-mail
function removerPaciente(email) {
  // Procura a posicao do paciente que tem esse e-mail
  const indice = pacientes.findIndex((paciente) => paciente.email === email);

  // Se encontrar, remove do array e redesenha a tabela
  if (indice !== -1) {
    pacientes.splice(indice, 1);
    salvarNoLocalStorage();
    renderizarTabela();
    atualizarContador();
  }
}
let ordemCrescente = true;

// Funcao para ordenar os pacientes por nome
function ordenarPorNome() {
  pacientes.sort((a, b) => {
    if (ordemCrescente) {
      return a.nome.localeCompare(b.nome);
    } else {
      return b.nome.localeCompare(a.nome);
    }
  });

    ordemCrescente = !ordemCrescente;

  // Redesenha a tabela com a nova ordem
  renderizarTabela();
}
// Função responsável por desenhar a tabela inteira a partir do array
function renderizarTabela() {
  tabela.innerHTML = ''; // limpa a tabela antes de redesenhar

  pacientes.forEach((paciente) => {
    const linha = document.createElement('tr');

    linha.innerHTML = `
      <td>${paciente.nome}</td>
      <td>${paciente.email}</td>
      <td>${paciente.telefone}</td>
      <td>${formatarData(paciente.nascimento)}</td>
      <td>${calcularIdade(paciente.nascimento)}</td>
      <td>
    <button class="btn btn-danger btn-sm" onclick="removerPaciente('${paciente.email}')">
      Remover
    </button>
  </td>
    `;

    tabela.appendChild(linha);
  });
  atualizarContador();
}

function calcularIdade(dataNascimento) {

const nascimento = new Date(dataNascimento + 'T00:00:00');
const hoje = new Date();

let idade = hoje.getFullYear() - nascimento.getFullYear();

const mesAtual = hoje.getMonth();
const mesNascimento = nascimento.getMonth();

// Se ainda não fez aniversário neste ano, diminui 1
if (
mesAtual < mesNascimento ||
(
mesAtual === mesNascimento &&
hoje.getDate() < nascimento.getDate()
)
) {
idade--;
}

return idade;
}

// Funcao utilitaria so para formatar a data no padrao dd/mm/aaaa
function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}
// Salva a lista de pacientes no localStorage
function salvarNoLocalStorage() {
  localStorage.setItem('pacientes', JSON.stringify(pacientes));
}
// Carrega os pacientes salvos no localStorage ao iniciar a aplicacao
function carregarDoLocalStorage() {
  const pacientesSalvos = localStorage.getItem('pacientes');
  if (pacientesSalvos) {
    // Converte o texto JSON de volta para array
    pacientes.length = 0;
    pacientes.push(...JSON.parse(pacientesSalvos));
  }
}

// Evento disparado quando o formulário é enviado
formulario.addEventListener('submit', (event) => {
  event.preventDefault(); // evita o recarregamento da página

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const telefone = document.getElementById('telefone').value;
  const nascimento = document.getElementById('nascimento').value;
 
  const cadastrouComSucesso = adicionarPaciente(nome, email, telefone, nascimento);
  
  if (cadastrouComSucesso) {
    
    renderizarTabela();
    formulario.reset();
  }
});
carregarDoLocalStorage();
renderizarTabela();