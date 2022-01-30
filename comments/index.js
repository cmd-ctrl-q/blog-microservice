const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { randomBytes } = require("crypto");
const commentsByPostId = require("./data.js");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/posts/:id/comments", (req, res) => {
  const postId = req.params.id;
  if (commentsByPostId[postId] === undefined) {
    return res.send([]);
  }

  res.send(commentsByPostId[postId]);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(2).toString("hex");
  const { content } = req.body;
  const postId = req.params.id;
  console.log("comments -> postId:", postId);

  // get comments associated with post if it exists, else []
  const comments = commentsByPostId[postId] || [];

  // add new comment to list of comments associated with post
  comments.push({ id: commentId, content, status: "pending" });

  // store the new list of comments to the post
  commentsByPostId[postId] = comments;

  // emit event to broker / event-bus
  await axios
    .post("http://localhost:4005/events", {
      type: "CommentCreated",
      data: {
        id: commentId,
        content,
        postId,
        status: "pending", // default value
      },
    })
    .catch((err) => {
      console.log(err.message);
      return;
    });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentModerated") {
    // find comment inside associated post and replace it
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];

    const comment = comments.find((comment) => {
      // return the comment were trying to update
      return comment.id === id;
    });
    comment.status = status;

    // send new comment to the event bus
    await axios.post("http://localhost:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        postId,
        content,
        status,
      },
    });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log("Listening on port 4001");
});
