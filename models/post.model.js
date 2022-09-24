const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 99,
  },
  imageName: {
    type: String,
    required: true,
    trim: true,
  },
});

const Post = mongoose.model('Post', postSchema);

exports.Post = Post;
