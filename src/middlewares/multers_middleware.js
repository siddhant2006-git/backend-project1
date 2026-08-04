import multer from "multer";


// cb - call back
// fieldNameSize	Max field name size	100 bytes
// fieldSize	Max field value size (in bytes)	1MB
// fields	Max number of non-file fields	Infinity
// fileSize	For multipart forms, the max file size (in bytes)	Infinity
// files	For multipart forms, the max number of file fields	Infinity
// parts	For multipart forms, the max number of parts (fields + files)	Infinity
// headerPairs	For multipart forms, the max number of header key=>value pairs to parse	2000
// fieldNestingDepth	Max number of nesting levels for field names (e.g. a[b][c] has 2 levels)

// memory storage -it is used to save in tempary file (RAM).
//1. it cannot store the large data .
// 2. it is used upload in very fast (upload to cloudnary )

// diskmemory - it is used to store the image and vidio in local directory
// it can upload the large data formation 




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"/public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer(
  {
    storage,
    
   }
);