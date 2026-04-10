import Article from "../model/Schema.js";

//Post Create request
export const Create_Article = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "title and content are required" });
    }
    const article = new Article({ title, content });

    const savedArticle = await article.save();

    // // Emit WebSocket event
    // const io = req.app.get("io");
    // io.emit("article_created", savedArticle);

    //Redis changes
    // REDIS CHANGE: removed io.emit and using redis publish
    const redisClient = req.app.get("redisClient");

    await redisClient.publish(
      "articles_channel",
      JSON.stringify({
        event: "article_created",
        data: savedArticle,
      }),
    );

    res.status(201).json({ success: true, data: savedArticle });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Error", error: error });
  }
};

//get All api
export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get all by id

export const getbyid = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(400).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      message: article,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//update
export const updateArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true, runValidators: true },
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not Found",
      });
    }

    // Emit WebSocket event Update
    // const io = req.app.get("io");
    // io.emit("article_updated", updateArticle);

    // REDIS CHANGE
    const redisClient = req.app.get("redisClient");

    await redisClient.publish(
      "articles_channel",
      JSON.stringify({
        event: "article_updated",
        data: article,
      }),
    );

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: "Invalid article ID",
    });
  }
};

//Delete
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // // Emit WebSocket event delete
    // const io = req.app.get("io");
    // io.emit("article_deleted", deleteArticle._id);

    // 🔴 REDIS CHANGE
    const redisClient = req.app.get("redisClient");

    await redisClient.publish(
      "articles_channel",
      JSON.stringify({
        event: "article_deleted",
        data: article._id,
      }),
    );
    return res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid article ID",
    });
  }
};
