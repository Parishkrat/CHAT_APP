import express from "express";
import {
  Create_Article,
  deleteArticle,
  getAllArticles,
  getbyid,
  updateArticle,
} from "../controller/controller.js";

const router = express();
router.post("/", Create_Article);
router.get("/", getAllArticles);
router.get("/:id", getbyid);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);

export default router;
