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

const array1 = [
  { "45": "20" },
  { "21": "55" },
  // ... (rest of the objects)
];

const array2 = [
  { "45": "20" },
  { "21": "51" },
  // ... (rest of the objects)
];

const score = calculateScore(array1, array2);
console.log("Score:", score);
