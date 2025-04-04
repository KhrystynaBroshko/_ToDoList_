const jsonServer = require('json-server');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('C:\\Users\\brosh\\Downloads\\ToDoList-main\\ToDoList-main\\todo-api\\db.json');
const middlewares = jsonServer.defaults();
const port = 3000;

server.use(cors());
server.use(middlewares);

server.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
  }
  
  next();
});

server.use('/api', router);

server.listen(port, () => {
  console.log(`JSON Server is running at http://localhost:${port}`);
  console.log(`Todos API is available at http://localhost:${port}/api/todos`);
});
