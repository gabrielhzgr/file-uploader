function getIndex(req,res,next){
    res.send('hola')
}

function getDrive(req,res,next){
    res.render('drive')
}

module.exports = { getIndex, getDrive }