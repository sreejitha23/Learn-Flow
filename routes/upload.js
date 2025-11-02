require("dotenv").config(); // <-- ADDED THIS
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuid } = require("uuid"); //for randomising the file-name.

// Secrets are now loaded safely from your .env file
const bucket = new S3Client({
  region: process.env.AWS_REGION, // <-- CHANGED
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // <-- CHANGED
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // <-- CHANGED
  },
});

const express = require("express");
const router = express.Router();

router.get("/get/preSignedURL", async (req, res) => {
  const contentType = req.query.contentType;
  const fileName =
    req.query.fileName.split(".")[0] +
    "-" +
    uuid() +
    "." +
    contentType.split("/")[1];

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME, // <-- CHANGED
    Key: fileName,
    ContentType: contentType,
  });

  const url = await getSignedUrl(bucket, command, { expiresIn: 3600 });
  console.log(url);
  console.log(fileName);
  res.json({
    url,
    fileName,
  });
});

module.exports = router;