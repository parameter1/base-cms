module.exports = (date) => {
  const dateInUTC = new Date(Date.UTC(
    date.toDate().getFullYear(),
    date.toDate().getMonth(),
    date.toDate().getDate(),
  ));
  return dateInUTC.valueOf();
};
