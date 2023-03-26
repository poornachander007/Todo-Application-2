const express = require("express");
const path = require("path");

var format = require("date-fns/format");
var isValid = require("date-fns/isValid");

const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Started And Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// ......................... Functions ...................................
const convertTodoDetails = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

const isStatusPriorityCategory = (status, priority, category) => {
  return (
    status !== undefined && priority !== undefined && category !== undefined
  );
};

const isStatusPriority = (status, priority) => {
  return status !== undefined && priority !== undefined;
};

const isStatusCategory = (status, category) => {
  return status !== undefined && category !== undefined;
};

const isPriorityCategory = (priority, category) => {
  return priority !== undefined && category !== undefined;
};

const isStatus = (status) => {
  return status !== undefined;
};

const isPriority = (priority) => {
  return priority !== undefined;
};

const isCategory = (category) => {
  return category !== undefined;
};

const isDate = (date) => {
  return date !== undefined;
};

const isTodo = (todo) => {
  return todo !== undefined;
};
// ......................... Functions ...................................
const formatDate = (date) => {
  const formattedDate = format(new Date(date), `yyyy-MM-dd`);
  console.log(formattedDate);
  return formattedDate;
};
// .........................Middleware Functions ...................................

const isValidStatus = (status) => {
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    return true;
  } else {
    return false;
  }
};

const isValidPriority = (priority) => {
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    return true;
  } else {
    return false;
  }
};

const isValidCategory = (category) => {
  if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    return true;
  } else {
    return false;
  }
};

const isValidDate = (date) => {
  if (isValid(new Date(date))) {
    return true;
  } else {
    return false;
  }
};

//------------------------------------------------------------------

//-------------------------------------------------------------------
function updateValueInTodo(parameter, value, id) {
  const updateQuery = `UPDATE todo SET ${parameter}='${value}'
                                WHERE id = ${id};`;
  return updateQuery;
}
function updateQuery(todoId, status, priority, todo, category, dueDate) {
  let query = [null, null, null];
  switch (true) {
    case isStatus(status):
      if (isValidStatus(status)) {
        query[0] = updateValueInTodo("status", status, todoId);
        query[1] = `Status Updated`;
      } else {
        query[2] = `Invalid Todo Status`;
      }
      break;
    case isPriority(priority):
      if (isValidPriority(priority)) {
        query[0] = updateValueInTodo("priority", priority, todoId);
        query[1] = `Priority Updated`;
      } else {
        query[2] = `Invalid Todo Priority`;
      }
      break;
    case isTodo(todo):
      query[0] = updateValueInTodo("todo", todo, todoId);
      query[1] = `Todo Updated`;
      break;
    case isCategory(category):
      if (isValidCategory(category)) {
        query[0] = updateValueInTodo("category", category, todoId);
        query[1] = `Category Updated`;
      } else {
        query[2] = `Invalid Todo Category`;
      }
      break;
    case isDate(dueDate):
      if (isValidDate(dueDate)) {
        const formattedDate = formatDate(dueDate);
        query[0] = updateValueInTodo("due_date", formattedDate, todoId);
        query[1] = `Due Date Updated`;
      } else {
        query[2] = `Invalid Due Date`;
      }
      break;

    default:
      break;
  }
  return query;
}

const validateQueriesMiddleWare = (request, response, next) => {
  const { status, priority, category, search_q = "", date } = request.query;
  let dbQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  switch (true) {
    case isStatusPriorityCategory(status, priority, category):
      if (
        isValidStatus(status) &&
        isValidPriority(priority) &&
        isValidCategory(category)
      ) {
        const dbQuery = `SELECT * FROM todo
                        WHERE status = '${status}'
                             and priority = '${priority}'
                              and category = '${category}'
                              and todo LIKE '%${search_q}%';`;
        request.dbQuery = dbQuery;
        next();
      } else {
        let result = "";
        if (isValidStatus(status) === false) {
          result = "Status";
        } else if (isValidPriority(priority) === false) {
          result = "Priority";
        } else {
          result = "Category";
        }
        response.status(400);
        response.send(`Invalid Todo ${result}`);
      }
      break;

    case isStatusPriority(status, priority):
      if (isValidStatus(status) && isValidPriority(priority)) {
        const dbQuery = `SELECT * FROM todo
                        WHERE status = '${status}'
                              and priority = '${priority}'
                              and todo LIKE '%${search_q}%';`;
        request.dbQuery = dbQuery;
        next();
      } else {
        let result = "";
        if (isValidStatus(status) === false) {
          result = "Status";
        } else {
          result = "Priority";
        }
        response.status(400);
        response.send(`Invalid Todo ${result}`);
      }
      break;

    case isStatusCategory(status, category):
      if (isValidStatus(status) && isValidCategory(category)) {
        const dbQuery = `SELECT * FROM todo
                        WHERE status = '${status}'
                              and category = '${category}'
                              and todo LIKE '%${search_q}%';`;
        request.dbQuery = dbQuery;
        console.log("sStatusCategory got hit...........");
        next();
      } else {
        let result = "";
        if (isValidStatus(status) === false) {
          result = "Status";
        } else {
          result = "Category";
        }
        response.status(400);
        response.send(`Invalid Todo ${result}`);
      }
      break;

    case isPriorityCategory(priority, category):
      if (isValidPriority(priority) && isValidCategory(category)) {
        const dbQuery = `SELECT * FROM todo
                        WHERE 
                              priority = '${priority}'
                              and category = '${category}'
                              and todo LIKE '%${search_q}%';`;
        request.dbQuery = dbQuery;
        next();
      } else {
        let result = "";
        if (isValidPriority(priority) === false) {
          result = "Priority";
        } else {
          result = "Category";
        }
        response.status(400);
        response.send(`Invalid Todo ${result}`);
      }
      break;

    case isStatus(status):
      if (isValidStatus(status)) {
        const dbQuery = `SELECT * FROM todo
                        WHERE status = '${status}'
                              and todo LIKE '%${search_q}%';`;
        request.dbQuery = dbQuery;
        next();
      } else {
        response.status(400);
        response.send(`Invalid Todo Status`);
      }
      break;

    case isPriority(priority):
      if (isValidPriority(priority)) {
        const dbQuery = `SELECT * FROM todo
                        WHERE
                              priority = '${priority}'
                              and todo LIKE '%${search_q}%';`;
        request.dbQuery = dbQuery;
        next();
      } else {
        response.status(400);
        response.send(`Invalid Todo Priority`);
      }
      break;

    case isCategory(category):
      if (isValidCategory(category)) {
        const dbQuery = `SELECT * FROM todo
                        WHERE
                              category = '${category}'
                              and todo LIKE '%${search_q}%';`;
        request.dbQuery = dbQuery;
        next();
      } else {
        response.status(400);
        response.send(`Invalid Todo Category`);
      }
      break;

    case isDate(date):
      if (isValidDate(date)) {
        const formattedDate = formatDate(date);
        const dbQuery = `SELECT * FROM todo
                WHERE due_date = '${formattedDate}';`;
        request.dbQuery = dbQuery;
        next();
      } else {
        response.status(400);
        response.send(`Invalid Due Date`);
      }
      break;

    default:
      request.dbQuery = dbQuery;
      next();
      break;
  }
};

// .........................Middleware Functions ...................................

//-----------------------------------------------------------------------

// GET ALL todo list or based on queries API (1)
//GET http://localhost:3000/todos/
app.get(`/todos/`, validateQueriesMiddleWare, async (request, response) => {
  console.log("Validation Done.........");
  const { dbQuery } = request;
  console.log("-----------------------------------------------------");
  console.log(dbQuery);
  console.log("-----------------------------------------------------");
  const todoArray = await db.all(dbQuery);
  response.send(todoArray.map(convertTodoDetails));
});

//-----------------------------------------------------

// GET todo by id API (2)
//GET http://localhost:3000/todos/:todoId/
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  console.log(getTodoQuery);
  const todo = await db.get(getTodoQuery);
  const convertedTodo = convertTodoDetails(todo);
  response.send(convertedTodo);
});

//-----------------------------------------------------

// GET list of todo by dueDate query API (3)
//GET http://localhost:3000/agenda/?date=2021-12-12
app.get("/agenda/", validateQueriesMiddleWare, async (request, response) => {
  const { dbQuery } = request;
  console.log(dbQuery);
  const todoArray = await db.all(dbQuery);
  response.send(todoArray.map(convertTodoDetails));
});

//-----------------------------------------------------

// ADD todo API (4)
//POST http://localhost:3000/todos/
app.post(`/todos/`, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (isValidStatus(status) === false) {
    response.status(400);
    response.send(`Invalid Todo Status`);
  } else if (isValidPriority(priority) === false) {
    response.status(400);
    response.send(`Invalid Todo Priority`);
  } else if (isValidCategory(category) === false) {
    response.status(400);
    response.send(`Invalid Todo Category`);
  } else if (isValidDate(dueDate) === false) {
    response.status(400);
    response.send(`Invalid Due Date`);
  } else {
    const AddTodoQuery = `INSERT INTO todo(id,todo,priority,status,category,due_date)
                           VALUES (${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`;
    console.log(AddTodoQuery);
    const dbResponse = await db.run(AddTodoQuery);
    response.status(200);
    response.send(`Todo Successfully Added`);
  }
});

//-----------------------------------------------------

// UPDATE todo by id API (5)
//PUT http://localhost:3000/todos/:todoId/
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, category, priority, status, dueDate } = request.body;
  const queryAndMessage = updateQuery(
    todoId,
    status,
    priority,
    todo,
    category,
    dueDate
  );
  if (queryAndMessage[2] !== null) {
    response.status(400);
    response.send(queryAndMessage[2]);
    console.log(queryAndMessage[0]);
    console.log(queryAndMessage[1]);
    console.log(queryAndMessage[2]);
  } else {
    console.log(queryAndMessage[0]);
    console.log(queryAndMessage[1]);
    console.log(queryAndMessage[2]);
    await db.run(queryAndMessage[0]);
    response.status(200);
    response.send(queryAndMessage[1]);
  }
});

//-----------------------------------------------------

//DELETE todo by id API (6)
//GET http://localhost:3000/todos/:todoId/
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id=${todoId};`;
  const dbResponse = await db.run(deleteQuery);
  response.send(`Todo Deleted`);
});
module.exports = app;
// console.log(isValid(new Date("2021-12 -24")));
