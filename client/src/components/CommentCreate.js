import React, { useState } from "react";
import axios from "axios";
// import { useParams } from 'react-router-dom'

const CommentCreate = ({ postId }) => {
  // const postId = useParams('id').id

  const [comment, setComment] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // send new post
    await axios.post(`http://posts.com/posts/${postId}/comments`, {
      content: comment,
    });

    // reset title
    setComment("");
  };

  return (
    <div>
      <form onSubmit={onSubmitHandler}>
        <div className="form-group">
          <label>New Comment</label>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-control"
          />
        </div>

        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default CommentCreate;
