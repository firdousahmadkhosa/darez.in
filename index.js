const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fileUpload = require("express-fileupload");
const expressValidator = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const app = express();
app.use(fileUpload());
const dbConfig = require("./config/db.config");
const { Op, Sequelize, DataTypes } = require("sequelize");
// const corsOptions = {
//   origin: "http://localhost:8080",
// };

// Serve static files from the "public" directory (for image uploads, etc.)
app.use(express.static(path.join(__dirname, 'public')));


// app.use(express.static(path.join(__dirname, "/build/")));

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

const sequelize = new Sequelize(
  "friendshipdares",
  "new_username",
  "MyP@ssw0rd2023",
  {
    host: "localhost",
    dialect: "mysql",
  }
);

sequelize.sync().then(() => {
  console.log("Database synchronized.");
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
      defaultValue: "",
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

Quiz.hasMany(Challenge, { foreignKey: "quiz_uid" });
Challenge.belongsTo(Quiz, {
  foreignKey: "quiz_uid",
});

// Sync the model with the database

// app.use(cors(corsOptions));
app.use(cors());

// parse requests of content-type - application/json

app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: true }));

// In your server.js file

// Define your middleware and routes here

// Sync the database

//simple route

// app.get("/", async (req, res,next) => {
//   console.log("hello from backend")
//     return res.send("hello from backend");

// });

// app.get('/',async (req,res)=>{
//   console.log("hello firdous")
// 	// res.sendFile(path.join(__dirname,"/client/build/static/",'index.html'));
// });

// app.get("/", (req, res) => {
//   console.log("hello firdous");
//   res.sendFile(path.join(__dirname, "build/", "index.html"));
// });



// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

// All other GET requests not handled before will return our React app
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, './build', 'index.html'));
// });



app.post("/create", async (req, res) => {
  const siteDataArray = req.body.SiteData; // Assuming req.body.SiteData is your array of JSON strings

  console.log(JSON.parse(siteDataArray));
  // const parsedSiteData = siteDataArray.map((jsonString) => {
  //   try {
  //     return JSON.parse(jsonString);
  //   } catch (error) {
  //     console.error("Error parsing JSON:", error);
  //     return null; // Handle the error as needed
  //   }
  // });

  // console.log(parsedSiteData); // An array of JavaScript objects

  // const body = {
  //   "options[31][a_text]": "Yescvvv",
  //   "options[31][a_thumb]":
  //     "/img1694848583021313333828_584268356808963_772710849526903833_n.jpg",
  //   "options[32][a_text]": "Nodsdf",
  //   "options[32][a_thumb]": "IMG_5d5a87ffefb10.jpg",
  // };
  // const jsonData = {};

  // for (const key in body) {
  //   if (body.hasOwnProperty(key)) {
  //     const matches = key.match(/\[(\d+)\]\[(\w+)\]/);
  //     if (matches) {
  //       const optionIndex = matches[1];
  //       const field = matches[2];

  //       // Initialize the option object if it doesn't exist
  //       if (!jsonData[optionIndex]) {
  //         jsonData[optionIndex] = {};
  //         jsonData[optionIndex]["a_id"] = optionIndex; // Include option index as a property
  //       }

  //       jsonData[optionIndex][field] = body[key];
  //     }
  //   }
  // }
  // const result = Object.values(jsonData);

  // console.log(result);
  // console.log(req.body.SiteData);
  // // const jsonData = {};
  // const data = JSON.parse(req.body.SiteData);
  // console.log(JSON.parse(data));

  // console.log("files: ", req.files);
  //  const q_text = req.body.q_text;

  //   if (!req.files || Object.keys(req.files).length === 0) {
  //     return res.status(400).send("No files were uploaded.");
  //   }

  // const options = [];

  // Loop through uploaded files
  // for (const key of Object.keys(body)) {
  //   const option = {
  //     a_text: req.body[key.replace("a_image", "a_text")], // Get corresponding text input
  //     // a_image: req.files[key], // Get the file data
  //   };
  //   options.push(option);
  // }

  //   // Now you can work with q_text and options as needed
  //   console.log("Question Text:", q_text);
  // console.log("Options:", options);

  // Respond with a success message or perform other actions
  res.status(200).send("Form data received successfully.");
});

app.post("/createQuiz", async (req, res, next) => {
  const { quiz_performer, quiz_data } = req.body;
  const newQuizData = {
    quiz_uid: uuidv4(),
    quiz_performer: quiz_performer,
    quiz_data: JSON.stringify(quiz_data),
    quiz_view: 0,
    quiz_hash: Date.now(),
  };

  Quiz.create(newQuizData)
    .then((quiz) => {
      return res.send({
        status: 200,
        message: "Quiz created successfully",
        newQuizData,
      });
      console.log("Quiz saved:", quiz.toJSON());
    })
    .catch((error) => {
      console.error("Error saving quiz:", error);
      throw error;
    });
});

app.get("/getAllChallengerByQuizId/:quiz_uid", async (req, res) => {
  const quiz_uid = req.params.quiz_uid;
  const quiz = await Quiz.findOne({ where: { quiz_uid } });
  // console.log(quiz);

  const allChallenge = await Challenge.findAll({ where: { quiz_uid } });
  const sites = await Site.findOne();
  res.send({
    quiz_owner: quiz.quiz_performer,
    advertisementURL: sites.site_wishing_web,
    quiz_performer: allChallenge,
  });
});
app.get("/getQuizWithQuestionsAnswers/:quiz_uid", async (req, res, next) => {
  const quiz_uid = req.params.quiz_uid;
  try {
    const findOneQuiz = await Quiz.findOne({ where: { quiz_uid: quiz_uid } });
    if (findOneQuiz) {
      // Quiz with the given quiz_uid was found
      //  console.log(findOneQuiz);

      const quiz_data = JSON.parse(findOneQuiz.quiz_data);
      const keysArray = quiz_data.map((obj) => parseInt(Object.keys(obj)[0]));
      const answersArray = quiz_data.map((obj) => Object.values(obj)[0]);
      console.log(quiz_data);
      // console.log(answersArray);
      // console.log("question",keysArray.length);

      try {
        const questions = await Question.findAll({
          where: {
            q_id: {
              [Op.in]: keysArray,
            },
          },
          include: [Answer],
        });

        let qqqq = [];
        //        // Iterate through the questions array and add the owner_id property from the answer array
        //        questions.forEach((question, i) => {
        //         //  console.log(i);
        //          question.owner_id = answersArray[i];
        // qqqq.push(question);

        //         //  delete question.q_id;
        //         //  console.log(question);
        //        });

        for (let i = 0; i < questions.length; ++i) {
          qqqq.push({
            q_id: questions[i].q_id,
            q_title: questions[i].q_title,
            q_ctitle: questions[i].q_ctitle,
            q_status: questions[i].q_status,
            Answers: questions[i].Answers,
            owner_a_id: answersArray[i],
          });

          //  qqqq.push({ owner_id: answersArray[i] });
          //  questions[i].owner_id = answersArray[i];
        }

        //  delete questions[0].q_id;

        // Now, each question object in the questions array has an owner_id property
        //  console.log(questions);

        // const myTimeout = setTimeout(()=>{console.log('done')}, 5000);
        console.log("-------------------------------");
        res.json({
          quiz_performer: findOneQuiz.quiz_performer,
          questions: qqqq,
        });
      } catch (error) {
        console.error(error);
      }
      // Return the found quiz as JSON response
    } else {
      // Quiz with the given quiz_uid was not found
      return res.status(404).json({ error: "Quiz not found" });
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

function calculateScore(array1, array2) {
  return array1.reduce((score, question1) => {
    const questionId1 = Object.keys(question1)[0];
    const answerId1 = question1[questionId1];

    const matchingQuestion = array2.find((question2) => {
      const questionId2 = Object.keys(question2)[0];
      const answerId2 = question2[questionId2];
      return questionId1 === questionId2 && answerId1 === answerId2;
    });

    return matchingQuestion ? score + 1 : score;
  }, 0);
}

app.post("/acceptChallenge", async (req, res, next) => {
  const { quiz_uid, c_name, quiz_data } = req.body;

  try {
    const findOneQuiz = await Quiz.findOne({ where: { quiz_uid: quiz_uid } });
    if (findOneQuiz) {
      const find_quiz_data = JSON.parse(findOneQuiz.quiz_data);
      console.log(find_quiz_data);
      const score = calculateScore(quiz_data, find_quiz_data);
      // console.log("Score:", score);

      const newQuizData = {
        quiz_uid: quiz_uid,
        c_score: score,
        c_name: c_name,
      };

      findOneQuiz.quiz_view = findOneQuiz.quiz_view + 1;
      await findOneQuiz.save();

      Challenge.create(newQuizData)
        .then((quiz) => {
          return res.send({
            status: 200,
            message: "Quiz created successfully",
            newQuizData,
          });
          console.log("Quiz saved:", quiz.toJSON());
        })
        .catch((error) => {
          console.error("Error saving quiz:", error);
          throw error;
        });

      // Return the found quiz as JSON response
    } else {
      // Quiz with the given quiz_uid was not found
      return res.status(404).json({ error: "Quiz not found" });
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getQuestionsWithAnswers", async (req, res, next) => {
  try {
    const questionsWithAnswers = await Question.findAll({
      include: [Answer],
      limit: 20, // Limit the number of records to 20
    });
    return res.send(questionsWithAnswers);
  } catch (error) {
    console.error("Error fetching questions with answers:", error);
    throw error;
  }
});

app.get("/getQuestions", async (req, res, next) => {
  try {
    const questions = await Question.findAll();
    return res.send(questions);
  } catch (error) {
    console.error("Error fetching questions with answers:", error);
    throw error;
  }
});

app.get(
  "/getQuestionWithAnswerById/:q_id",
  checkAuthorization,
  async (req, res, next) => {
    // console.log(req.headers);

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
  }
);

app.post(
  "/createAnswerByQuestionId/:q_id",
  checkAuthorization,
  async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
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

        await Answer.create({
          q_id: req.params.q_id,
          a_text: req.body.a_text,
          a_thumb: "/" + fileOne,
        });

        return res.send({ message: "Answer created successfully" });
      } catch (error) {
        console.error("Error fetching questions with answers:", error);
        throw error;
      }
    }
  }
);

app.post(
  "/updateAnswerById/:a_id",
  checkAuthorization,
  async (req, res, next) => {
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

        fs.unlink("./public" + answerFind.a_thumb, (err) => {
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
  }
);

app.post("/updateQuestion", checkAuthorization, async (req, res, next) => {
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

app.post("/createQuestion", checkAuthorization, async (req, res, next) => {
  try {
    await Question.create({
      q_title: req.body.q_title,
      q_ctitle: req.body.q_ctitle,
      q_status: req.body.q_status,
    });
    return res.send({ message: "Question created successfully" });
  } catch (error) {
    console.error("Error create questions :", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post(
  "/createQuestionWithAnswers",
  checkAuthorization,
  async (req, res, next) => {
    try {
      const q = {
        q_title: req.body.q_text,
        q_ctitle: " ",
        q_status: 1,
      };
      const question = await Question.create(q);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.send({ message: "Question created successfully" });
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
      }
      const options = [];
      for (const key of Object.keys(req.files)) {
        const path_file = "./public/";
        const fileOne = "img" + Date.now() + req.files[key].name;
        //-----------------move profile into server-------------------------------//
        await req.files[key].mv(path_file + "" + fileOne, async function (err) {
          if (err) console.log("error occured");
        });
        const option = {
          q_id: question.q_id,
          a_text: req.body[key.replace("a_image", "a_text")],
          a_thumb: "/" + fileOne,
        };
        options.push(option);
      }
      await Answer.bulkCreate(options);
      return res.status(200).send("Question with Answers created successfully");
    } catch (error) {
      console.error("Error create questions :", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.post(
  "/updateQuestionWithAnswers",
  checkAuthorization,
  async (req, res, next) => {
    try {
      // const question = await Question.update(
      //   { q_title: req.body.q_text },
      //   { where: { q_id: req.body.q_id } }
      // );

      if (!req.files || Object.keys(req.files).length === 0) {
        // return res.send({ message: "Question updated successfully" });
        try {
          const jsonData = {};

          for (const key in req.body) {
            // Use req.body here
            const matches = key.match(/\[(\d+)\]\[(\w+)\]/);
            if (matches) {
              const optionIndex = matches[1];
              const field = matches[2];

              // Initialize the option object if it doesn't exist
              if (!jsonData[optionIndex]) {
                jsonData[optionIndex] = {};
                jsonData[optionIndex]["a_id"] = optionIndex; // Include option index as a property
              }

              jsonData[optionIndex][field] = req.body[key]; // Use req.body here
            }
          }
          const result = Object.values(jsonData);

          for (const item of result) {
            await Answer.update(
              {
                a_text: item.a_text,
              },
              {
                where: { a_id: item.a_id },
              }
            );
          }

          return res.send({ message: "Answers updated successfully" });
        } catch (error) {
          console.error("Error updating Answer with answers:", error);
          throw error;
        }
      } else {
        const body = req.body; // Assign req.body to body
        const files = req.files;
        // Iterate through the options data and process it
        for (const key in body) {
          // Use body here
          const matches = key.match(/options\[(\d+)\]\[a_text\]/);
          // const matches = key.match(/options\[(\d+)\]\[a_thumb\]/);
          if (matches) {
            const optionIndex = matches[1];
            const aText = body[key];

            // Check if an image file was uploaded for this option
            const imageKey = `options[${optionIndex}][a_image]`;
            if (files && files[imageKey]) {
              if (body[`options[${optionIndex}][a_thumb]`]) {
                fs.unlink(
                  "./public" + body[`options[${optionIndex}][a_thumb]`],
                  (err) => {
                    if (err) {
                      console.error(
                        "Error occurred while deleting the file:",
                        err
                      );
                    } else {
                      console.log("File deleted successfully");
                    }
                  }
                );
              }

              const uploadedFile = files[imageKey];
              const path_file = "./public/";
              const fileOne = "img" + Date.now() + uploadedFile.name;

              uploadedFile.mv(path_file + "" + fileOne, (err) => {
                if (err) {
                  console.error("Error saving uploaded file:", err);
                } else {
                  // Update the database with the file path
                  Answer.update(
                    { a_text: aText, a_thumb: "/" + fileOne },
                    { where: { a_id: optionIndex } }
                  )
                    .then(() => {
                      console.log(
                        `Updated option ${optionIndex} with text and file path`
                      );
                    })
                    .catch((updateError) => {
                      console.error("Error updating database:", updateError);
                    });
                }
              });
            } else {
              // No image uploaded, update the database with a_text
              Answer.update({ a_text: aText }, { where: { a_id: optionIndex } })
                .then(() => {
                  console.log(`Updated option ${optionIndex} with text`);
                })
                .catch((updateError) => {
                  console.error("Error updating database:", updateError);
                });
            }
          }
        }

        return res.status(200).send("Answers updated successfully");
      }
    } catch (error) {
      console.error("Error create questions :", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.get("/getAllQuiz", checkAuthorization, async (req, res) => {
  const totalQuestion = await Question.findAll();

  const allQuizs = await Quiz.findAll({
    attributes: [
      "quiz_id",
      "quiz_uid",
      "quiz_performer",
      "quiz_view",
      // [Sequelize.fn("SUM", Sequelize.col("quiz_view")), "total_quiz_view"], // Calculate the sum of quiz_view
    ],
    limit: 100,
    order: [
      ["quiz_id", "DESC"], // Replace "createdAt" with the actual timestamp field you want to use
    ],
  });
  let total_View = 0;
  allQuizs.forEach((element) => {
    total_View = total_View + element.quiz_view;
  });
  // console.log(allChallenges);
  res.send({
    totalQuestions: totalQuestion.length,
    totalQuiz: allQuizs.length,
    totalView: total_View,
    allQuizs: allQuizs,
  });
});

app.post("/login", async (req, res, next) => {
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

// Function to verify the JWT token asynchronously.
async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, "bezkoder-secret-key", (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

// Step 1: Create an async middleware function to check the authorization token.
async function checkAuthorization(req, res, next) {
  // Extract the token from the request headers or query parameters, depending on your setup.
  const token = req.headers.authorization || req.query.token;

  try {
    // Verify the token asynchronously using async/await.
    const decodedToken = await verifyToken(token);

    // Attach the decoded user information to the request for later use.
    // req.user = decodedToken;
    req.body.userId = decodedToken.id;

    next(); // Continue to the next middleware or route handler.
  } catch (error) {
    // If the token is invalid or has expired, respond with an unauthorized status code (401).
    res.status(401).json({ error: "Unauthorized" });
  }
}

// const verifyToken = async (req, res,next) => {
//   let token = req.headers["Authorization"];
//   console.log(token);
//   if (!token) {
//     return res.status(200).send({
//       status: 400,
//       message: "No token provided!",
//     });
//   }

//    jwt.verify(token, "bezkoder-secret-key",  (err, decoded) => {
//     if (err) {
//       return res.status(200).send({
//         status: 400,
//         message:
//           "Please provide a token to authorized otherwise you Unauthorized!",
//       });
//     }
//     // console.log(decoded);
//     req.body.userId = decoded.id;
//     console.log(decoded);
//     next();
//   });
// };

app.post("/updateAdmin", checkAuthorization, async (req, res, next) => {
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

app.get("/getSite", async (req, res, next) => {

  

  try {
    const siteInformation = await Site.findAll();
    return res.send(siteInformation);
  } catch (error) {
    // console.error("Error updating admin:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/updateSite", checkAuthorization, async (req, res, next) => {
  // console.log(req.body);
  const body = JSON.parse(req.body.SiteData);

  delete req.body.SiteData;
  req.body = body;
  // console.log( body);
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

      // const findSite_og_image = await Site.findOne({
      //   where: { id: req.body.id },
      // });

      fs.unlink("./public" + req.body.site_og_image, (err) => {
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
        { where: { id: id } }
      );
      return res.send({ message: "Site updated successfully" });
    } catch (error) {
      console.error("Error updating:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

app.get("/deleteQuiz/:quiz_uid", checkAuthorization, async (req, res) => {

  try {
    const challenge = await Challenge.findAll({
      where: { quiz_uid: req.params.quiz_uid },
    });

    if (challenge.length > 0) {
  
      await Challenge.destroy({
        where: { quiz_uid: req.params.quiz_uid }, // Corrected the extra "where" property
      });
    }

    const quiz = await Quiz.findOne({
      where: { quiz_uid: req.params.quiz_uid },
    });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Delete the question and its associated children
    await quiz.destroy();

   return res.status(200).send({message:"Quiz deleted successfully"}); // Respond with a 204 No Content status
  }
   catch (error) {
    console.error("Error deleting parent and children:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/deleteQuestionById/:q_id", checkAuthorization, async (req, res) => {
  try {
    const answers = await Answer.findAll({
      where: { q_id: req.params.q_id },
    });

    if (answers.length > 0) {
      for (let i = 0; i < answers.length; i++) {
         fs.unlink(
           "./public" +answers[i].a_thumb,
           (err) => {
             if (err) {
               console.error("Error occurred while deleting the file:", err);
             } else {
               console.log("File deleted successfully");
             }
           }
         );
      }
      


      await Answer.destroy({
        where: { q_id: req.params.q_id }, // Corrected the extra "where" property
      });
    }

    const question = await Question.findOne({
      where: { q_id: req.params.q_id },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Delete the question and its associated children
    await question.destroy();

    res.status(200).send("Question deleted successfully"); // Respond with a 204 No Content status
  } catch (error) {
    console.error("Error deleting question and answers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Serve React build assets from the "build" directory
// app.use(express.static(path.join(__dirname, "build")));

// Handle all other routes and serve the React app
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "public/build", "./index.html"));
});

// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to Turing.com" });
// });
// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


