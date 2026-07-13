require('dotenv').config()
function getConnectionString(env) {
  if (env == "dev") {
    return process.env.DEV_DATABASE_URL;
  } else if (env == "prod") {
    return process.env.DATABASE_URL;
  } else {
    return null;
  }
}

function getCLIConnectionString(env) { //Connection string for prisma CLI
  if (env == "dev") {
    return process.env.DEV_DATABASE_URL;
  } else {
    return process.env.DIRECT_URL;
  }
}

module.exports = { getConnectionString, getCLIConnectionString };
