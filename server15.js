const express = require("express");
const expressHbs = require("express-handlebars");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const fs = require("fs");

const app = express();

app.engine("hbs", expressHbs.engine({
  layoutsDir: "views/layouts",
  defaultLayout: "layout",
  extname: "hbs",
  helpers: {
    cancelButton: function (url, text) {
      return `<a href="${url}"><button>${text}</button></a>`;
    }
  }
}));


app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
 hbs.registerPartials(__dirname + "/views/partials");

 hbs.registerHelper("cancelButton", function (url, text) {
   return `<a href="${url}"><button>${text}</button></a>`;
 });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));          // Парсинг данных формы
app.use(express.static("public"));

app.get("/", (req, res) => {
  readUsersFromFile("users.json", (err, users) => {
    if (err) {
      console.error("[GET/]Ошибка при чтении файла:", err);
    } else {
      console.log("[GET/]Пользователи успешно получены:");
    }
  });
  res.render("index", { users });                        // Отображение страницы index.hbs
});

app.get("/add", (req, res) => {
  console.log("[GET/add]");
  res.render("add", {
    users,
    cancelButtonUrl: "/",
    cancelButtonText: "Отказаться",
    title: "Добавление",
    header: "Добавление контакта",
  });
});

app.post("/add", (req, res) => {
  if (!req.body) return res.sendStatus(400);

  let lastUserId;

  if (users.length > 0) {
    lastUserId = users[users.length - 1].id;
  } else {
    lastUserId = 0;
  }
  const userId = lastUserId + 1;
  const userName = req.body.name;
  const userNumber = req.body.number;
  const userNew = { id: userId, name: userName, number: userNumber };
  console.log(userNew);

  users.push(userNew);

  saveUsersToFile(users, (err) => {
    if (err) {
      console.error("[POST/add]Ошибка при сохранении данных в файл:", err);
    } else {
      console.log("[POST/add]Данные успешно сохранены в файл.");
    }
  });
  res.redirect("/");
});



app.get("/update", (req, res) => {
  console.log("[GET/update]");

  if (!req.body) return res.sendStatus(400);

  const selectedUserId = req.query.id;
  const selectedUserName = req.query.name;
  const selectedUserNumber = req.query.number;

  res.render("update", {
    users,
    selectedUserId,
    selectedUserName,
    selectedUserNumber,
    cancelButtonUrl: "/",
    cancelButtonText: "Отказаться",
    title: "Изменение",
    header: "Изменения контакта",
  });
});

app.post("/update", (req, res) => {
  if (!req.body) return res.sendStatus(400);

  const id = req.body.id;
  const userName = req.body.name;
  const userNumber = req.body.number;
  const index = findUserIndexById(id);

  if (index > -1) {
    const user = users[index];
    user.name = userName;
    user.number = userNumber;
    saveUsersToFile(users, (err) => {
      if (err) {
        console.error("[POST/update]Ошибка при сохранении данных в файл:", err);
      } else {
        console.log("[POST/update]Данные успешно сохранены в файл.");
      }
    });

    res.redirect("/");
  } else {
    res.status(404).send("[POST/update]Пользователь не найден");
  }
});

app.post("/delete", (req, res) => {
  if (!req.body) return res.sendStatus(400);

  const id = req.body.id;
  const index = findUserIndexById(id);

  if (index > -1) {
    const user = users.splice(index, 1)[0];

    saveUsersToFile(users, (err) => {
      if (err) {
        console.error("[POST/delete]Ошибка при удалении данных из файла:", err);
      } else {
        console.log("[POST/delete]Данные успешно удалены из файла.");
      }
    });

    res.redirect("/");
  } else {
    res.status(404).send("[POST/delete]Пользователь не найден");
  }
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения http://localhost:3000/");
});

const users = [];

function readUsersFromFile(filename, callback) {
  users.splice(0, users.length);

  fs.readFile(filename, "utf8", (err, data) => {
    if (err) {
      console.error("[readUsersFromFile] Ошибка чтения файла:", err);
      callback(err, null);
      return;
    }

    try {
      const usersData = JSON.parse(data);
      if (Array.isArray(usersData)) {
        users.push(...usersData);
        callback(null, usersData);
      } else {
        console.error(
          "[readUsersFromFile] Ошибка чтения файла: данные о пользователях имеют неправильный формат."
        );
        callback(
          new Error("[readUsersFromFile] Неправильный формат данных"),
          null
        );
      }
    } catch (parseError) {
      console.error("[readUsersFromFile] Ошибка парсинга JSON:", parseError);
      callback(parseError, null);
    }
  });
}

function saveUsersToFile(usersData, callback) {
  // Сохраняем обновленный массив пользователей в JSON-файл
  fs.writeFile("users.json", JSON.stringify(usersData), (err) => {
    if (err) {
      console.error("[saveUsersToFile] Ошибка при записи в файл:", err);
      callback(err);
    } else {
      //console.log("[saveUsersToFile] Данные успешно сохранены в файл.");
      callback(null); // Ошибка равна null в случае успешной записи
    }
  });
}

function findUserIndexById(id) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id == id) return i;
  }
  return -1;
}
