const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a memory file buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer.
 * @param {string} folder - Folder name in Cloudinary.
 * @returns {Promise<Object>} - Cloudinary upload result.
 */
const uploadBuffer = (buffer, folder = 'courses') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadBuffer,
};
