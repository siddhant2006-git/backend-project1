import {v2 as cloudnary } from "cloudinary"
import fs from "fs"

import { v2 as cloudinary } from "cloudinary";

(async function () {
  // Configuration
  cloudinary.config({
    cloud_name: "process.env.cloud_name",
    api_key: "process.env.api_key",
    api_secret: "process.env.api_secret" // Click 'View API Keys' above to copy your API secret
  });


  const uploadcloudnary = async (localfilepath) => {
    try {
      if (!localfilepath) return null;
      await cloudinary.uploader.upload(localfilepath, {
        resource_type:"auto"
      })
      // file has been uploaded  
      console.log("file is uploaded", response.url);
      return response 
      
    } catch (error) {
      fs.unlinkSync(localfilepath) // remove local file as upload operation to got failed
      retutn null;
      
    }
  
}


  // Upload an image
  const uploadResult = await cloudinary.uploader
    .upload(
      "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
      {
        public_id: "shoes",
      }
    )
    .catch((error) => {
      console.log(error);
    });

  console.log(uploadResult);

  // Optimize delivery by resizing and applying auto-format and auto-quality
  const optimizeUrl = cloudinary.url("shoes", {
    fetch_format: "auto",
    quality: "auto",
  });

  console.log(optimizeUrl);

  // Transform the image: auto-crop to square aspect_ratio
  const autoCropUrl = cloudinary.url("shoes", {
    crop: "auto",
    gravity: "auto",
    width: 500,
    height: 500,
  });

  console.log(autoCropUrl);
})();