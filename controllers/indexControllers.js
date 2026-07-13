function getIndex(req, res, next) {
  res.redirect('/drive')
}

function getDrive(req, res, next) {
  res.render('drive', {title: 'My files'})
}

module.exports = { getIndex, getDrive };
