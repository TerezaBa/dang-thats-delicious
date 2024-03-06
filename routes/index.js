const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { catchErrors } = require("../handlers/errorHandlers");

// Do work here
router.get("/", catchErrors(storeController.getStores));
router.get("/stores", catchErrors(storeController.getStores));
router.get("/add", authController.isLoggedIn, storeController.addStore);

router.post(
  "/add",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
router.post(
  "/add/:id",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

router.get("/stores/:id/edit", catchErrors(storeController.editStore));
router.get("/store/:slug", catchErrors(storeController.getStoreBySlug));
router.get("/tags", catchErrors(storeController.getStoresByTags));
router.get("/tags/:tag", catchErrors(storeController.getStoresByTags));

router.get("/login", userController.loginForm);
router.post("/login", authController.login);
router.get("/register", userController.registerForm);

// 1. validate registr data
// 2. register user
// 3. log them in
router.post(
  "/register",
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get("/logout", authController.logout);
// router.get("/", (req, res) => {
//   // const ter = { name: "terezicka", age: "NA", cool: true };
//   // res.json(ter);
//   // res.send("Hey! It works!");
//   // res.json(req.query);
//   res.render("hello", {
//     name: "wes",
//     dog: req.query.dog,
//   });
// });

// router.get("/reverse/:name", (req, res) => {
//   const reverse = [...req.params.name].reverse().join("");
//   res.send(reverse);
// });

module.exports = router;
