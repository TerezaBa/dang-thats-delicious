const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true); // callback next with one value = error/ null means it worked and 2nd value gets passed
    } else {
      next({ message: `That filetype isn't allowed!` }, false);
    }
  },
};
// exports.myMiddleWare = (req, res, next) => {
//   req.name = "Terezicka";
//   res.cookie("name", "Terezicka je cool", { maxAge: 60000 });
//   next();
// };

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", { title: "Add Store" });
};

exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  //check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once photo is written to filesystem, keep going
  next();
};

exports.createStore = async (req, res) => {
  // const store = new Store(req.body);
  // await store.save();
  // this should be better for slug - try the above version, too pls, maybe ask chat
  const store = await new Store(req.body).save();
  req.flash(
    "success",
    `Successfully Created ${store.name}. Care to leave a review?`
  ); // success/warning/error
  res.redirect(`/store/${store.slug}`);
  console.log(store);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find(); // query db for stores (all)
  res.render("stores", { title: "Stores", stores });
};

exports.editStore = async (req, res) => {
  // 1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });
  // res.json(store);
  // 2. confirm they are the owner of the store
  // TODO
  // 3. render out the edit form so the user can update the store
  res.render("editStore", { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // set the location data to be a point
  req.body.location.type = "Point";
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true, // runs validators also on update, not only on first save
  }).exec(); //( query, data, options)
  // redirect them to the store and say it worked
  req.flash(
    "success",
    `Successfully updated <strong>${store.name}</strong>! <a href="/stores/${store.slug}">View Store →</a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  if (!store) {
    next();
    return;
  }
  res.render("store", { title: store.name, store });
};