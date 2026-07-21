function getDriveIndex(req, res, next) {
  res.render('drive', {title: 'My files'})
}



module.exports = {getDriveIndex}