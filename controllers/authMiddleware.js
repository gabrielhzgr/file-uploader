const prisma = require("../lib/prisma")

function isAuthenticated (req,res,next){
    if(!req.isAuthenticated()){
        return res.status(401).render('401')
    }
    next()
}

async function isOwner(req,res,next){
    try {
        let {user} = req
        const {folderId} = req.params
        
        const folder = await prisma.folder.findFirst({where: {id: folderId}})        
        if(folder !== null && folder.ownerId !== user.id){
            return res.status(401).render('401')
        }
        req.folder = folder
        next()
    } catch (err) {
        next(err)
    }
    
}


module.exports = {isAuthenticated, isOwner}