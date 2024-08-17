/**
 * Builds a map of user answers to custom select/boolean questions.
 */
module.exports = (user) => {
  const answeredQuestionMap = new Map();
  user.customSelectFieldAnswers.forEach((select) => {
    if (!select.hasAnswered) return;
    answeredQuestionMap.set(select.field.id, true);
  });
  user.customBooleanFieldAnswers.forEach((boolean) => {
    if (!boolean.hasAnswered) return;
    answeredQuestionMap.set(boolean.field.id, true);
  });
  user.customTextFieldAnswers.forEach((field) => {
    if (!field.hasAnswered) return;
    answeredQuestionMap.set(field.field.id, true);
  });
  return answeredQuestionMap;
};
