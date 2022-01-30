const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const posts = require("./data");

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;

    // store new post
    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;

    // store comment in the approprate post
    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    // send to event bus
    const { id, content, postId, status } = data;

    // find all comments of the appropriate post and update the updated comment
    const post = posts[postId];
    const comment = post.comments.find((comment) => {
      // return the comment were trying to update
      return comment.id === id;
    });

    // update the comment
    comment.status = status;
    comment.content = content;
  }
};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  // check the event type
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on 4002");

  try {
    // get a list of all events that have been emitted in the past.
    const res = await axios.get("http://localhost:4005/events");

    for (let event of res.data) {
      console.log("Processing event:", event.type);

      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});
