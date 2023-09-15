const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fileUpload = require("express-fileupload");
const expressValidator = require("express-validator");

const app = express();
app.use(fileUpload());
const dbConfig = require("./config/db.config");
const { Sequelize, DataTypes } = require("sequelize");
const corsOptions = {
  origin: "http://localhost:8080",
};

app.use(express.static(path.join(__dirname, "/public/")));

// express validater middelware
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
    customValidators: {
      isImage: function (value, filename) {
        var extension = path.extname(filename).toLowerCase();
        switch (extension) {
          case ".jpg":
            return ".jpg";
          case ".jpeg":
            return ".jpeg";
          case ".png":
            return ".png";
          case "":
            return ".jpg";
          default:
            return false;
        }
      },
    },
  })
);
// Sequelize setup
// const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
//   host: "localhost",
//   dialect: "mysql",
// });


const sequelize = new Sequelize("friendshipdares", "root", "Pakistan@!", {
  host: "localhost",
  dialect: "mysql",
});


// // Fetch all table names
// async function getAllTableNames() {
//   try {
//     const query = `
//       SELECT table_name
//       FROM information_schema.tables
//       WHERE table_schema = '${sequelize.config.database}'
//       AND table_type = 'BASE TABLE'
//     `;
//     const [results, metadata] = await sequelize.query(query);
// console.log(results);
//     const tableNames = results.map((result) => result.table_name);

//     return tableNames;
//   } catch (error) {
//     console.error('Error fetching table names:', error);
//     throw error;
//   }
// }

// // Call the function to get table names
// getAllTableNames()
//   .then((tableNames) => {
//     console.log('Table names:', tableNames);
//   })
//   .catch((error) => {
//     console.error('Error:', error);
//   });

// Define the Admin model
const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(255),
    },
    password: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "admin",
    timestamps: false, // Disable timestamps
  }
);

// Define the Answer model
const Answer = sequelize.define(
  "Answer",
  {
    a_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    q_id: {
      type: DataTypes.BIGINT,
    },
    a_text: {
      type: DataTypes.STRING(255),
    },
    a_thumb: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "answer",
    timestamps: false, // Disable timestamps
  }
);

// Define the Challenge model
const Challenge = sequelize.define(
  "Challenge",
  {
    c_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    quiz_uid: {
      type: DataTypes.STRING(255),
    },
    c_score: {
      type: DataTypes.INTEGER,
    },
    c_name: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "challenge",
    timestamps: false, // Disable timestamps
  }
);

// Define the Question model
const Question = sequelize.define(
  "Question",
  {
    q_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    q_title: {
      type: DataTypes.TEXT,
    },
    q_ctitle: {
      type: DataTypes.TEXT,
    },
    q_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "question",
    timestamps: false, // Disable timestamps
  }
);

// Define the Quiz model
const Quiz = sequelize.define(
  "Quiz",
  {
    quiz_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    quiz_uid: {
      type: DataTypes.STRING(255),
      unique: true,
    },
    quiz_performer: {
      type: DataTypes.STRING(255),
    },
    quiz_data: {
      type: DataTypes.TEXT,
    },
    quiz_view: {
      type: DataTypes.BIGINT,
    },
    quiz_hash: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "quiz",
    timestamps: false, // Disable timestamps
  }
);

// Define the Site model
const Site = sequelize.define(
  "Site",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    site_title: {
      type: DataTypes.STRING(255),
    },
    site_short_title: {
      type: DataTypes.STRING(255),
    },
    site_wishing_web: {
      type: DataTypes.STRING(255),
    },
    site_description: {
      type: DataTypes.STRING(255),
    },
    site_og_image: {
      type: DataTypes.STRING(255),
    },
    site_user_can_del: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    site_about: {
      type: DataTypes.TEXT,
    },
    site_privacy: {
      type: DataTypes.TEXT,
    },
    site_contact: {
      type: DataTypes.TEXT,
    },
    site_custom_header: {
      type: DataTypes.TEXT,
    },
    site_custom_footer: {
      type: DataTypes.TEXT,
    },
    site_ad_ver: {
      type: DataTypes.TEXT,
    },
    site_ad_100: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "site",
    timestamps: false, // Disable timestamps
  }
);

// Define the association between Question and Answer
Question.hasMany(Answer, { foreignKey: "q_id" }); // Specify the foreign key name
Answer.belongsTo(Question, { foreignKey: "q_id" }); // Specify the foreign key name
// Define associations between models, e.g., Admin.hasMany(Answer);

Challenge.hasMany(Quiz, { foreignKey: 'quiz_uid', sourceKey: 'quiz_uid' });
Quiz.belongsTo(Challenge, { foreignKey: 'quiz_uid', targetKey: 'quiz_uid' });


// Sync the model with the database
 sequelize.sync();

// app.use(cors(corsOptions));
app.use(cors());

// parse requests of content-type - application/json

app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: true }));

// In your server.js file

// Define your middleware and routes here

// Sync the database
// db.sequelize.sync().then(() => {
//   console.log("Database synchronized.");
// });

//simple route

app.get("/", async (req, res) => {
  
    return res.send("hello from backend5");
 
});


app.get("/getQuestionsWithAnswers", async (req, res) => {
  try {
    const questionsWithAnswers = await Question.findAll({
      include: [Answer],
    });
    return res.send(questionsWithAnswers);
  } catch (error) {
    console.error("Error fetching questions with answers:", error);
    throw error;
  }
});

app.get("/getQuestions", async (req, res) => {
  await verifyToken(req, res);
  try {
    const questions = await Question.findAll();
    return res.send(questions);
  } catch (error) {
    console.error("Error fetching questions with answers:", error);
    throw error;
  }
});

app.get("/getQuestionWithAnswerById/:q_id", async (req, res) => {
  await verifyToken(req, res);
  try {
    const questionWithAnswerById = await Question.findOne({
      where: { q_id: req.params.q_id },
      include: [Answer],
    });

    return res.send(questionWithAnswerById);
  } catch (error) {
    console.error("Error fetching questions with answers:", error);
    throw error;
  }
});

app.post("/createAnswerByQuestionId/:q_id", async (req, res) => {
  await verifyToken(req, res);
  if (!req.files || Object.keys(req.files).length === 0) {
  return  res.status(400).send("No files were uploaded.");
    try {
      await Answer.create(
        {
          a_text: req.body.a_text,
        },
        {
          where: { a_id: req.params.a_id },
        }
      );

      return res.send({ message: "Answer updated successfully" });
    } catch (error) {
      console.error("Error updating Answer with answers:", error);
      throw error;
    }
  } else {
    try {
      req
        .checkBody("img", "picture must have needed animage")
        .isImage(req.files.img.name);
      const errors = req.validationErrors();
      if (errors) {
        return res.status(200).send({
          status: 400,
          error: errors,
        });
      }
      const path_file = "./public/";
      const fileOne = "img" + Date.now() + req.files.img.name;
      //-----------------move profile into server-------------------------------//
     await req.files.img.mv(path_file + "" + fileOne, async function (err) {
        if (err) console.log("error occured");
      });
    
      await Answer.create(
        {
          q_id:req.params.q_id,
          a_text: req.body.a_text,
          a_thumb: "/" + fileOne,
        }
        
      );

      return res.send({ message: "Answer created successfully" });
    } catch (error) {
      console.error("Error fetching questions with answers:", error);
      throw error;
    }
  }
});


app.post("/updateAnswerById/:a_id", async (req, res) => {
  await verifyToken(req, res);
  if (!req.files || Object.keys(req.files).length === 0) {
    // res.status(400).send("No files were uploaded.");
    try {
      await Answer.update(
        {
          a_text: req.body.a_text,
        },
        {
          where: { a_id: req.params.a_id },
        }
      );

      return res.send({ message: "Answer updated successfully" });
    } catch (error) {
      console.error("Error updating Answer with answers:", error);
      throw error;
    }
  } else {
    try {
      req
        .checkBody("img", "picture must have needed animage")
        .isImage(req.files.img.name);
      const errors = req.validationErrors();
      if (errors) {
        return res.status(200).send({
          status: 400,
          error: errors,
        });
      }
      const path_file = "./public/";
      const fileOne = "img" + Date.now() + req.files.img.name;
      //-----------------move profile into server-------------------------------//
      req.files.img.mv(path_file + "" + fileOne, function (err) {
        if (err) console.log("error occured");
      });
      const answerFind = await Answer.findOne({
        where: { a_id: req.params.a_id },
      });

     
       fs.unlink("./public"+answerFind.a_thumb, (err) => {
         if (err) {
           console.error("Error occurred while deleting the file:", err);
         } else {
           console.log("File deleted successfully");
         }
       });
      await Answer.update(
        {
          a_text: req.body.a_text,
          a_thumb: "/" + fileOne,
        },
        {
          where: { a_id: req.params.a_id },
        }
      );

      return res.send({ message: "Answer updated successfully" });
    } catch (error) {
      console.error("Error fetching questions with answers:", error);
      throw error;
    }
  }
});


app.post("/updateQuestion", async (req, res) => {
  await verifyToken(req, res);
  try {
    await Question.update(
      {
        q_title: req.body.q_title,
        q_ctitle: req.body.q_ctitle,
        q_status: req.body.q_status,
      },
      {
        where: { q_id: req.body.q_id },
      }
    );
    return res.send({ message: "Question updated successfully" });
  } catch (error) {
    console.error("Error fetching questions with answers:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/createQuestion", async (req, res) => {
  await verifyToken(req, res);
  try {
    await Question.create(
      {
        q_title: req.body.q_title,
        q_ctitle: req.body.q_ctitle,
        q_status: req.body.q_status,
      }
    );
    return res.send({ message: "Question created successfully" });
  } catch (error) {
    console.error("Error create questions :", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  if (
    req.body.username !== null ||
    req.body.username !== "" ||
    (req.body.password = !null || req.body.password != "")
  ) {
    try {
      const adminUser = await Admin.findOne({
        where: {
          username: req.body.username,
          //  password: bcrypt.hashSync(req.body.password, 8),
        },
      });
      if (!adminUser) {
        return res.status(200).send({
          status: 400,
          message: "User email Not found.",
          successData: {},
        });
      }

      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        adminUser.password
      );

      if (!passwordIsValid) {
        return res.status(200).send({
          status: 400,
          accessToken: null,
          message: "Invalid user Password!",
        });
      }
      const token = jwt.sign({ id: adminUser.id }, "bezkoder-secret-key", {});
      return res.status(200).send({
        message: "Login Successfull.",
        username: adminUser.username,
        id: adminUser.id,
        accessToken: token,
      });
      //  return res.send(adminUser);
    } catch (error) {
      console.error("Error fetching questions with answers:", error);
      throw error;
    }
  } else {
    throw "Credential is not correct";
  }
});

const verifyToken = async (req, res) => {
  let token = req.headers["access_token"];

  if (!token) {
    return res.status(200).send({
      status: 400,
      message: "No token provided!",
    });
  }

  await jwt.verify(token, "bezkoder-secret-key", async (err, decoded) => {
    if (err) {
      return res.status(200).send({
        status: 400,
        message:
          "Please provide a token to authorized otherwise you Unauthorized!",
      });
    }
    // console.log(decoded);
    req.body.userId = decoded.id;
    return;
  });
};

app.post("/updateAdmin", async (req, res) => {
  await verifyToken(req, res);
  if (
    req.body.username !== null ||
    req.body.username !== "" ||
    req.body.password !== null ||
    req.body.password !== ""
  ) {
    try {
      const hashedPassword = bcrypt.hashSync(req.body.password, 8);
      await Admin.update(
        { username: req.body.username, password: hashedPassword },
        {
          where: {
            id: req.body.userId,
          },
        }
      );

      return res.send({ message: "Admin updated successfully" });
    } catch (error) {
      console.error("Error updating admin:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // Handle the case where credentials are not correct
    return res.status(400).send("Credentials are not correct");
  }
});

app.get("/getSite", async (req, res) => {
  // await verifyToken(req, res);

  try {
    const siteInformation = await Site.findAll();
    return res.send(siteInformation);
  } catch (error) {
    // console.error("Error updating admin:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/updateSite", async (req, res) => {
  await verifyToken(req, res);
if (!req.files || Object.keys(req.files).length === 0) {
  try {
    const {
      id,
      site_title,
      site_short_title,
      site_wishing_web,
      site_description,
      site_og_image,
      site_user_can_del,
      site_about,
      site_privacy,
      site_contact,
      site_custom_header,
      site_custom_footer,
      site_ad_ver,
      site_ad_100,
    } = req.body;

    await Site.update(
      {
        site_title,
        site_short_title,
        site_wishing_web,
        site_description,
        site_og_image,
        site_user_can_del,
        site_about,
        site_privacy,
        site_contact,
        site_custom_header,
        site_custom_footer,
        site_ad_ver,
        site_ad_100,
      },
      { where: { id: id } }
    );
    return res.send({ message: "Site updated successfully" });
  } catch (error) {
    console.error("Error updating:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}else{
    try {
       req
         .checkBody("img", "picture must have needed animage")
         .isImage(req.files.site_og_image.name);
       const errors = req.validationErrors();
       if (errors) {
         return res.status(200).send({
           status: 400,
           error: errors,
         });
       }
       const path_file = "./public/";
       const fileOne = "img" + Date.now() + req.files.site_og_image.name;
       //-----------------move profile into server-------------------------------//
       req.files.site_og_image.mv(path_file + "" + fileOne, function (err) {
         if (err) console.log("error occured");
       });

        const findSite_og_image = await Site.findOne({
          where: { id: req.body.id },
        });

        fs.unlink("./public" + findSite_og_image.site_og_image, (err) => {
          if (err) {
            console.error("Error occurred while deleting the file:", err);
          } else {
            console.log("File deleted successfully");
          }
        });
      const {
        id,
        site_title,
        site_short_title,
        site_wishing_web,
        site_description,
     
        site_user_can_del,
        site_about,
        site_privacy,
        site_contact,
        site_custom_header,
        site_custom_footer,
        site_ad_ver,
        site_ad_100,
      } = req.body;

      await Site.update(
        {
          site_title,
          site_short_title,
          site_wishing_web,
          site_description,
          site_og_image: "/" + fileOne,
          site_user_can_del,
          site_about,
          site_privacy,
          site_contact,
          site_custom_header,
          site_custom_footer,
          site_ad_ver,
          site_ad_100,
        },
        { where: { id:id} }
      );
      return res.send({ message: "Site updated successfully" });
    } catch (error) {
      console.error("Error updating:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
}
});

// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to Turing.com" });
// });
// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
