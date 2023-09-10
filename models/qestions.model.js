
module.exports = (sequelize, Sequelize) => {
// Define the Question model
const Question = sequelize.define("Question", {
  q_id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  q_title: {
    type: Sequelize.TEXT,
  },
  q_ctitle: {
    type: Sequelize.TEXT,
  },
  q_status: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});
return Question;
}