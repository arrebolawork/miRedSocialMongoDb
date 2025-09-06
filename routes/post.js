const express = require("express");
const router = express.Router();
// Debería ser algo como:
const PostController = require("../controllers/PostController");
// No: postController
const ComentarioController = require("../controllers/ComentarioController");
const { authentication } = require("../middlewares/authentication");
const upload = require("../middlewares/upload");

router.get("/allPosts", PostController.getAllPosts);
router.get("/id/:_id", PostController.getPostById);
router.get("/titulo/:titulo", PostController.getPostByTitulo);
router.get("/user", authentication, PostController.getPostsByUser);
router.post("/create", upload.single("postImage"), authentication, PostController.create);
router.post("/comentario/:postId", authentication, ComentarioController.create);
router.put("/id/:_id", authentication, PostController.update);
router.post("/like/:_id", authentication, PostController.like);
router.post("/unlike/:_id", authentication, PostController.unLike);
router.delete("/id/:_id", authentication, PostController.delete);

module.exports = router;
