require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const sharp = require('sharp');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { uploadFile, deleteFile, getObjectSignedUrl } = require('../s3');

const { Post } = require('../models/post.model');

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

router.get('/', async (req, res) => {
  try {
    const images = await Post.find();

    for (let image of images) {
      image.imageUrl = await getObjectSignedUrl(image.imageName);
    }

    res.send(images);
  } catch (error) {
    console.log('error ', error);
  }
});

// pass in the name of the input el -> for React: formData.append('image', file)
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) res.send('No file attached');
  else {
    const file = req.file;
    const caption = req.body.caption;
    const imageName = generateFileName();

    // resize the image
    const fileBuffer = await sharp(file.buffer)
      .resize({ height: 400 })
      .toBuffer();

    await uploadFile(fileBuffer, imageName, file.mimetype);

    //send to DB
    try {
      let post = await Post.find();
      console.log(req.file);
      post = new Post({
        caption: caption,
        imageName: imageName,
      });

      await post.save();
      res.send(post);
    } catch (error) {
      console.log('error in post', error);
    }
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);

  const post = await Post.findOne({ imageName: id });
  if (!post) {
    res.status(404).send('Post not found');
    return;
  }

  await deleteFile(post.imageName);
  const result = await Post.deleteOne({ imageName: id });

  if (result.deletedCount == 0) {
    res.status(404).send({ message: 'Error trying to delete Post' });
    return;
  }

  res.send({ message: `Image: ${post.imageName} has been deleted` });
});

module.exports = router;

// Reference Video
// https://www.youtube.com/watch?v=eQAIojcArRY&t=750s
