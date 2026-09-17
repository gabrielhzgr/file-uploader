require("dotenv").config();
const express = require("express");
const path = require("node:path");

const session = require("express-session");
const prisma = require("./lib/prisma");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const indexRouter = require("./routes/indexRouter");
const usersRouter = require("./routes/usersRouter.js");
const storageRouter = require("./routes/storageRouter.js");

const flash = require("connect-flash");
const { error, log } = require("node:console");

//CREATE EXPRESS APP
const app = express();
const PORT = 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(
    `EXPRESS APP. LISTENING ON PORT: ${3000}, environment: ${process.env.NODE_ENV}`,
  );
});

//SET NECESSARY MIDDLEWARE
const assetPath = path.join(__dirname, "public");
app.use(express.static(assetPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// SET SESSION STORAGE
app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 2, // 2days
    },
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdFunction: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

//PASSPORT AUTHENTICATION
passport.use(
  new LocalStrategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
      try {
        const user = await prisma.user.findFirst({ where: { username } });

        if (!user) {
          return done(null, false, req.flash("error", "Incorrect username"));
        }
        let match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, req.flash("error", "Incorrect password"));
        } else {
          return done(null, user, req.flash("success", "Logged in"));
        }
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findFirst({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.session());
app.use(flash());

console.log(process.env.NODE_ENV);

// USER MIDDLEWARE
app.use((req, res, next) => {
  res.locals.currentUser = req.user; //Avoid manually passing user to all views
  next();
});

// ROUTES

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/storage", storageRouter);

app.use((req, res, next) => {
  res.status(404).render("404", { title: "Not found" });
});

app.use((err, req, res, next) => {
  res
    .status(err.statusCode || 500)
    .render("errorPage", { title: "Error", errorMessage: err.message });
});
