import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

const getPublicIdFromCloudinaryUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;

  try {
    const url = new URL(cloudinaryUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const uploadIndex = pathParts.indexOf("upload");

    if (uploadIndex === -1) {
      return null;
    }

    let publicId = pathParts.slice(uploadIndex + 1).join("/");

    if (!publicId) {
      return null;
    }

    publicId = publicId.replace(/^v\d+\//, "");

    const lastDotIndex = publicId.lastIndexOf(".");
    if (lastDotIndex > -1) {
      return publicId.slice(0, lastDotIndex);
    }

    return publicId;
  } catch (error) {
    console.log("Cloudinary public ID parse error:", error);
    return null;
  }
};

const deleteFromCloudinary = async (cloudinaryUrl, resourceType = "image") => {
  try {
    if (!cloudinaryUrl) {
      return false;
    }

    const publicId = getPublicIdFromCloudinaryUrl(cloudinaryUrl);

    if (!publicId) {
      return false;
    }

    configureCloudinary();

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return result?.result === "ok" || result?.result === "not found";
  } catch (error) {
    console.log("Cloudinary delete error:", error);
    return false;
  }
};

const uploadCloudinary = async (localFilePath, resourceType = "auto") => {
  try {
    if (!localFilePath) {
      return null;
    }

    configureCloudinary();

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
    });

    console.log("File is uploaded:", response.url);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.log("Cloudinary upload error:", error);

    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadCloudinary, deleteFromCloudinary, getPublicIdFromCloudinaryUrl };
