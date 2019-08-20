const express = require("express");

const server = express();
const projects = [];
let requisitions = 0;
server.use(express.json());

//Middleware Global para contagem de requisições
server.use((req, res, next) => {
  requisitions++;
  console.log(`Total de requisiçẽs: ${requisitions}`);

  next();
});

//Middleware que verfica se o projeto já existe antes de adicionar um novo
function checkNewProject(req, res, next) {
  const { id } = req.body;
  const project = projects.filter(item => item.id === id);
  if (project[0]) {
    return res.status(400).json({ error: "Project id already exists" });
  }

  return next();
}

//Middleware que verifica se o projeto existe e salva o projeto e indice na req
function checkProjectExists(req, res, next) {
  const { id } = req.params;
  let index;
  const project = projects.filter((item, key) => {
    if (item.id === id) {
      index = key;
      return true;
    }
  });
  if (!project[0]) {
    return res.status(400).json({ error: "Project doesn't exists" });
  }
  req.project = project;
  req.index = index;

  return next();
}

//Retorna a listagem de projetos
server.get("/projects", (req, res) => {
  return res.json(projects);
});

//Retorna um projeto pelo ID
server.get("/projects/:id", checkProjectExists, (req, res) => {
  return res.json(req.project);
});

//Insere um novo projeto, recebe id e title como parametros dentro do body
server.post("/projects", checkNewProject, (req, res) => {
  const { id, title } = req.body;

  if (!id || !title)
    return res.status(400).json({ error: "Id and Title are mandatory" });

  projects.push({ id, title, tasks: [] });

  return res.json(projects);
});

//Atualiza um projeto de acordo com o ID, recebe title como parametro do body
server.put("/projects/:id", checkProjectExists, (req, res) => {
  const { title } = req.body;

  projects[req.index].title = title;

  return res.json(projects);
});

//deleta um projeto de acordo com um ID
server.delete("/projects/:id", checkProjectExists, (req, res) => {
  projects.splice(req.index, 1);
  return res.send();
});

//Adiciona uma task em um projeto de acordo com o ID, recebe title no body
server.post("/projects/:id/tasks", checkProjectExists, (req, res) => {
  const { title } = req.body;

  projects[req.index].tasks.push(title);

  return res.json(projects[req.index]);
});

server.listen(3000);
