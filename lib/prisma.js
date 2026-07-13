const {PrismaPg} = require('@prisma/adapter-pg')
const {PrismaClient} = require('../generated/prisma/client.js')
const { getConnectionString }= require('../lib/getConnectionString.js')

const connectionString = getConnectionString(process.env.NODE_ENV)
const adapter = new PrismaPg({connectionString})
const prisma = new PrismaClient({adapter})

module.exports = prisma