import { isValidObjectId } from "mongoose";

import { Video } from "../model/videomodel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const filter = {};

  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }

  if (userId) {
    filter.owner = userId;
  }

  const sortVideo = {
    [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1,
  };

  const videos = await Video.find(filter)
    .sort(sortVideo)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoFile = req.file || req.files?.videoFile?.[0];

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  if (!videoFile?.path) {
    throw new ApiError(400, "Video file is required");
  }

  const uploadedVideo = await uploadCloudinary(videoFile.path, "video");

  if (!uploadedVideo?.url) {
    throw new ApiError(400, "Video upload failed");
  }

  const video = await Video.create({
    title: title.trim(),
    description: description.trim(),
    videoFile: uploadedVideo.url,
    thumbnail: uploadedVideo.thumbnail_url || "",
    duration: Number(uploadedVideo.duration || 0),
    owner: req.user?._id,
    isPublished: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const createVideo = asyncHandler(async (req, res) => {
  const { title, description, videoFile, thumbnail, duration } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const video = await Video.create({
    title: title.trim(),
    description: description.trim(),
    videoFile,
    thumbnail,
    duration: Number(duration || 0),
    owner: req.user?._id,
  });

  if (!video) {
    throw new ApiError(400, "Video cannot be created");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video created successfully"));
});

const uploadvidio = asyncHandler(async (req, res) => {
  const videoFile = req.file || req.files?.videoFile?.[0];

  if (!videoFile?.path) {
    throw new ApiError(400, "Video file is required");
  }

  const uploadedVideo = await uploadCloudinary(videoFile.path, "video");

  if (!uploadedVideo) {
    throw new ApiError(400, "Video cannot be uploaded");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedVideo, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (title !== undefined) video.title = title.trim();
  if (description !== undefined) video.description = description.trim();
  if (thumbnail !== undefined) video.thumbnail = thumbnail;

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.videoFile) {
    await deleteFromCloudinary(video.videoFile, "video");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `Video ${video.isPublished ? "published" : "unpublished"} successfully`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  createVideo,
  uploadvidio,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
