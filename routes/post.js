const express = require("express");
const router = express.Router();
const PostController = require("../controllers/PostController");
const ComentarioController = require("../controllers/ComentarioController");
const authentication = require("../middlewares/authentication");
const upload = require("../middlewares/upload");

router.get("/allPosts", PostController.getAllPosts);
router.get("/id/:_id", PostController.getPostById);
router.get("/titulo/:titulo", PostController.getPostByTitulo);
router.get("/user", authentication, PostController.getPostsByUser);
router.post("/create", authentication, upload.single("image"), PostController.create);
router.post("/comentario/:postId", authentication, ComentarioController.create);
router.put("/id/:_id", authentication, PostController.update);
router.post("/like/:_id", authentication, PostController.like);
router.post("/unlike/:_id", authentication, PostController.unLike);

module.exports = router;
