const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { Sequelize, Model, DataTypes } = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "production";
const config = require("./config/config.json")[env];
const db = {};
const bodyParser = require("body-parser");
const axios = require("axios");
const res = require("express/lib/response");
const FormData = require("form-data");

app.use(cors({ origin: (orig, cb) => cb(null, true), credentials: true }));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "templates")));

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

class Users extends Model {}
class Tasks extends Model {}

Users.init(
  {
    userName: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    location: DataTypes.STRING,
    role: DataTypes.STRING,
    userImage: DataTypes.BLOB,
  },
  {
    sequelize,
    modelName: "Users",
  }
);

Tasks.init(
  {
    userName: DataTypes.STRING,
    taskName: DataTypes.STRING,
    category: DataTypes.STRING,
    description: DataTypes.STRING,
    assignedContractor: DataTypes.STRING,
    scheduled: DataTypes.BOOLEAN,
    date: DataTypes.DATEONLY,
    maxBudget: DataTypes.INTEGER,
  },
  {
    sequelize,
    modelName: "Tasks",
  }
);

// sequelize.sync({ force: true }).then(() => {
//   // Or you can pass multer-style File object, for example
//   let user2 = Users.build({
//     // picture: "http://example.com/somepic2.jpg",
//     backgroundImage: {
//       path: "/assets/img",
//       mimetype: "image/png",
//     },
//   });

//   user2.save();

//   // Deleting file(s)
//   user2.update({ picture: null });
// });

//
// This will be accessed from the frontend?
//
// Users.findById(1).then((user) => {
//   console.log(user.picture.small);
//   console.log(user.picture.big);
//   console.log(user.picture.original);
// });

// add a user   WORKING
app.post("/users", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  await Users.create({
    userName: req.body.userName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    location: req.body.location,
    role: req.body.role,
    userImage: req.body.userImage,
  });
  res.send('{"userRegistered": "true"}');
});

// get all users
app.get("/users", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const users = await Users.findAll();
  res.status(200).send(users);
});

// get one user
app.get("/users/:email", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let email = req.params.email;
  const users = await Users.findAll({
    where: {
      email: email,
    },
  });
  res.status(200).send(users);
});

// update a user   WORKING
app.put("/users/modify/:user_name", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let userName = req.params["user_name"];
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      if (!err) {
        Users.update(
          {
            userName: req.body.userName,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash,
            location: req.body.location,
            role: req.body.role,
          },
          {
            where: {
              userName: userName,
            },
          }
        );
      }
      res.send('{"userRegistered": "true"}');
    });
  });
});

// delete a user   WORKING
app.delete("/users/delete/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let id = req.params["id"];
  await Users.destroy({
    where: {
      id: id,
    },
  });
  res.send('{"userDeleted": "true"}');
});

// post a new task
app.post("/tasks", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // const userId = req.params["userName"];
  await Tasks.create({
    userName: req.body.userName,
    taskName: req.body.taskName,
    category: req.body.category,
    description: req.body.description,
    assignedContractor: req.body.assignedContractor,
    scheduled: req.body.scheduled,
    date: req.body.date,
    maxBudget: req.body.maxBudget,
  });
  return res.send('{"status": "Task Updated!"}');
});

// Update Task by id
app.put("/tasks/updatebyid/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const id = req.params["id"];
  await Tasks.update(
    {
      userName: req.body.userName,
      taskName: req.body.taskName,
      category: req.body.category,
      description: req.body.description,
      assignedContractor: req.body.assignedContractor,
      scheduled: req.body.scheduled,
      date: req.body.date,
      maxBudget: req.body.maxBudget,
    },
    {
      where: {
        id: id,
      },
    }
  );
  return res.send('{"status": "Tasks updated!"}');
});

// Update Task by taskname
app.put("/tasks/update/:taskname", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const taskName = req.params["taskName"];
  await Tasks.update(
    {
      userName: req.body.userName,
      taskName: req.body.taskName,
      category: req.body.category,
      description: req.body.description,
      assignedContractor: req.body.assignedContractor,
      scheduled: req.body.scheduled,
      date: req.body.date,
      maxBudget: req.body.maxBudget,
    },
    {
      where: {
        taskname: taskName,
      },
    }
  );
  return res.send('{"status": "Tasks updated!"}');
});

// get all tasks
app.get("/tasks", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const tasks = await Tasks.findAll();
  res.status(200).send(tasks);
});

// get all tasks for current
app.get("/tasks/:userName", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const userName = req.params["userName"];
  const userTasks = await Tasks.findAll({
    where: {
      userName: userName,
    },
  });
  res.status(200).send(userTasks);
});

// get one task by date for current user
app.get("/tasks/:user_name/:date_of_task", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const taskrId = req.params["user_name"];
  const dateId = req.params["date_of_task"];
  const taskData = await Tasks.findOne({
    where: {
      user_name: taskrId,
      date_of_task: dateId,
    },
  });

  res.status(200).send(taskData);
});

// delete a task by id  WORKING
app.delete("/tasks/delete/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let id = req.params["id"];
  await Tasks.destroy({
    where: {
      id: id,
    },
  });
  res.send('{"taskDeleted": "true"}');
});

// Jake Section

// Database work
// export default function Datatable({ data }) {
//   const columns = data[0] && Object.keys(data[0]);
//   return (
//     <table cellPadding={0} cellSpacing={0}>
//       <thead>
//         <tr>
//           {data[0] && columns.map((heading) => <th>{heading}</th>)}
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((row) => (
//           <tr>
//             {columns.map((column) => (
//               <td>{row[column]}</td>
//             ))}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }
//-------------------------------------------WORKING YELP GET---------------------------------------------//
//app.get('/yelp', (req, res) => {
//      axios.get('https://api.yelp.com/v3/businesses/search?location=GA',{
//     headers:{
//        'Authorization':'Bearer mP9UEWzoZ-_Px4TlJdHVmehnpdNfYIuAXtkW7kbwTnKLjgNJ2tYUd2oGBnKxEeyy7EgK3SXn8mIsvvt4l9CTmzZRs6PYKKTtQfyT4wVVWy-SAfp9ypJ_a6F8xTiYYXYx',
//        'Accept': 'application/json',
//        'Content-Type': 'application/json'
//     }
//   })
//    .then(response => {
//      console.log(response)
//     res.json(response.data)})
//});
//--------------------------------------------WORKING YELP POST-GET ROUTE (dynamic params - the search uses this route)----------//
app.post("/yelp", (req, res) => {
  const { location, categories } = req.body;
  axios
    .get(`https://api.yelp.com/v3/businesses/search?location=${location}&categories=${categories}`, {
      headers: {
        Authorization: "Bearer mP9UEWzoZ-_Px4TlJdHVmehnpdNfYIuAXtkW7kbwTnKLjgNJ2tYUd2oGBnKxEeyy7EgK3SXn8mIsvvt4l9CTmzZRs6PYKKTtQfyT4wVVWy-SAfp9ypJ_a6F8xTiYYXYx",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      res.json(response.data);
    });
});

// Upload image to freeimage.host
app.post("/image-upload", (req, res) => {
  const { photo } = req.body;
  const source = req.body.source.trim();
  const data = new FormData();
  data.append("source", source);
  axios
    .post("https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5&action=upload", {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .catch(function (error) {})
    // .then((res) => res.json())
    .then((res) => {
      console.log("Photo response = ", res);
    });
});
