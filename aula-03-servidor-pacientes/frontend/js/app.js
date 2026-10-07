const URL_API = 'http://localhost:3000/pacientes';

// ... (adicionarPaciente, renderizarTabela e formatarData continuam iguais à Aula 2)

async function carregarPacientesIniciais() {
  try {
    const resposta = await fetch(URL_API); // única linha que muda de verdade

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const dados = await resposta.json();

    dados.forEach((paciente) => {
      adicionarPaciente(paciente.nome, paciente.email, paciente.nascimento);
    });

    renderizarTabela();
  } catch (erro) {
    console.error('Não foi possível carregar os pacientes:', erro);
    mensagemCarregando.textContent =
      'Erro ao carregar pacientes. O servidor está rodando?';
    return;
  }

  mensagemCarregando.style.display = 'none';
}