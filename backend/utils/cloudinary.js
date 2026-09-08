const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a memory file buffer to Cloudinary (images / generic files).
 * @param {Buffer} buffer  - File buffer.
 * @param {string} folder  - Folder name in Cloudinary.
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

/**
 * Uploads a PDF buffer to Cloudinary as a raw resource (preserves PDF MIME type).
 * Returns { secure_url, public_id } from the Cloudinary response.
 *
 * @param {Buffer} buffer       - PDF file buffer.
 * @param {string} folder       - Cloudinary folder (e.g. 'certyhub/pdfs').
 * @param {string} [filename]   - Optional base filename (without extension).
 * @returns {Promise<Object>}   - Cloudinary upload result.
 */
const uploadPdfBuffer = (buffer, folder = 'certyhub/pdfs', filename) => {
  return new Promise((resolve, reject) => {
    const opts = {
      folder,
      resource_type: 'raw',  // required for PDFs so Cloudinary doesn't convert them
      format: 'pdf',
      use_filename: !!filename,
      unique_filename: true,
    };
    if (filename) opts.public_id = filename;

    const uploadStream = cloudinary.uploader.upload_stream(
      opts,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Deletes a Cloudinary resource by its public_id.
 * Use resource_type: 'raw' for PDFs and 'image' for images.
 *
 * @param {string} publicId        - Cloudinary public_id of the asset.
 * @param {string} [resourceType]  - 'raw' (PDF) | 'image' | 'video'. Defaults to 'raw'.
 * @returns {Promise<Object>}      - Cloudinary destroy result.
 */
const deleteByPublicId = (publicId, resourceType = 'raw') => {
  if (!publicId) return Promise.resolve({ result: 'not_found' });
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = {
  cloudinary,
  uploadBuffer,
  uploadPdfBuffer,
  deleteByPublicId,
};
