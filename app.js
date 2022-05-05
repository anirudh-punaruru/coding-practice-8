const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(express.json());

let db = null;
const initDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: '${e.message}'`);
    process.exit(1);
  }
};
initDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (req, res) => {
  let data = null;
  let getTodoQuery = null;
  const { search_q = "", priority, status } = req.query;

  switch (true) {
    case hasPriorityAndStatusProperties(req.query):
      getTodoQuery = `select * from todo where todo like '${search_q}' and status= '${status}' and priority='${priority}';`;
      break;
    case hasPriorityProperty(req.query):
      getTodoQuery = `select * from todo where todo like '${search_q}' and priority='${priority}';`;
      break;
    case hasStatusProperty(req.query):
      getTodoQuery = `select * from todo where todo like '${search_q}' and status= '${status}';`;
      break;
    default:
      getTodoQuery = `select * from todo where todo like '${search_q}';`;
  }
  data = await db.all(getTodoQuery);
  res.send(data);
});

app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getTodoQuery = `select * from todo where id= '${todoId}';`;
  const data = await db.get(getTodoQuery);
  res.send(data);
});

app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.body;
  const postTodoQuery = `insert into todo (id, todo, priority, status) values ('${id}', '${todo}', '${priority}', '${status}');`;
  await db.run(postTodoQuery);
  res.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const reqBody = req.body;
  let updateTodoQuery = null;
  if (reqBody.status !== undefined) {
    updateTodoQuery = `update todo set status='${status}' where id='${todoId}';`;
    await db.run(updateTodoQuery);
    res.send("Status Updated");
  } else if (reqBody.priority !== undefined) {
    updateTodoQuery = `update todo set priority='${priority}' where id='${todoId}';`;
    await db.run(updateTodoQuery);
    res.send("Priority Updated");
  } else if (reqBody.todo !== undefined) {
    updateTodoQuery = `update todo set todo='${todo}' where id='${todoId}';`;
    await db.run(updateTodoQuery);
    res.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteQuery = `delete from todo where id='${todoId}';`;
  await db.run(deleteQuery);
  res.send("Todo Deleted");
});

module.exports = app;
