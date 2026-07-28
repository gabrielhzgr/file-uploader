const prisma = require("../lib/prisma")

function isAuthenticated (req,res,next){
    if(!req.isAuthenticated()){
        return res.status(401).render('401')
    }
    next()
}

async function isOwner(req,res,next){
    try {
        let {id: userId} = req.user
        const {folderId} = req.params
        let {folder} = req
        

        if(!folder){
            folder = await prisma.folder.findFirst({where: {id: folderId}})
            req.folder = folder
        }
        if(folder.ownerId !== userId){
            return res.status(401).render('401')
        }
        
        next()
    } catch (err) {
        next(err)
    }
    
}


module.exports = {isAuthenticated, isOwner}