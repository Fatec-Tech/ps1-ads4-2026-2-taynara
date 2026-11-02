const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const pacientes = [
  { id: 1, nome: 'Maria Silva', email: 'maria.silva@email.com', nascimento: '1990-04-12' },
  { id: 2, nome: 'João Pereira', email: 'joao.pereira@email.com', nascimento: '1985-11-30' },
  { id: 3, nome: 'Ana Costa', email: 'ana.costa@email.com', nascimento: '2001-07-08' },
];
let proximoId = 4;

// READ (lista) — GET /pacientes

app.get('/pacientes', (req, res) => {
  const { nome } = req.query;

  if (nome) {
    const filtrados = pacientes.filter((p) =>
      p.nome.toLowerCase().includes(nome.toLowerCase())
    );
    return res.json(filtrados);
  }

  res.json(pacientes);
});


app.get('/pacientes/total', (req, res) => {
  res.json({ total: pacientes.length });
});

// READ (um) — GET /pacientes/:id
app.get('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const paciente = pacientes.find((p) => p.id === id);

  if (!paciente) {
    return res.status(404).json({ erro: 'Paciente não encontrado' });
  }

  res.json(paciente);
});

// CREATE — POST /pacientes
app.post('/pacientes', (req, res) => {
  const { nome, email, nascimento } = req.body ?? {};

  if (!nome || !email || !nascimento) {
    return res.status(400).json({ erro: 'Nome, e-mail e nascimento são obrigatórios' });
  }

 
  const emailJaExiste = pacientes.some(
    (p) => p.email.toLowerCase() === email.toLowerCase()
  );
  if (emailJaExiste) {
    return res.status(409).json({ erro: 'E-mail já cadastrado' });
  }

  const novoPaciente = { id: proximoId++, nome, email, nascimento };
  pacientes.push(novoPaciente);

  res.status(201).json(novoPaciente);
});

// UPDATE — PUT /pacientes/:id
app.put('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const paciente = pacientes.find((p) => p.id === id);

  if (!paciente) {
    return res.status(404).json({ erro: 'Paciente não encontrado' });
  }

  const { nome, email, nascimento } = req.body ?? {};

  if (!nome || !email || !nascimento) {
    return res.status(400).json({ erro: 'Nome, e-mail e nascimento são obrigatórios' });
  }

  paciente.nome = nome;
  paciente.email = email;
  paciente.nascimento = nascimento;

  res.json(paciente);
});

// DELETE — DELETE /pacientes/:id
app.delete('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = pacientes.findIndex((p) => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Paciente não encontrado' });
  }

  pacientes.splice(indice, 1);

  res.status(204).send();
});

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});