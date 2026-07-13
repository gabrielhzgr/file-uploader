/**
 * TESTING PRISMA CLIENT
 */
const  prisma = require("./lib/prisma");

async function main() {
  // Create a new user with a post
  /*
  const user = await prisma.user.create({
    data: {
      username: "alice@prisma.io",
      password: 'asfasf' 
    }
  });
  console.log("Created user:", user);
  */
  // Fetch all users with their posts
  //const allUsers = await prisma.user.findMany({});

  const allUsers = await prisma.user.findFirst({where: {username: 'alice@prisma.io'}})

  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });