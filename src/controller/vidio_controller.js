import mongoose, { isValidObjectId } from "mongoose";

import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;


  // TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  // TODO: get video, upload to cloudinary, create video
});

const createVideo = asyncHandler(async (req, res) => {
  const vidio = await Video.create(req.userId)
  if (!vidio) {
    throw new ApiError(400,"vidio cannor be create")
  }
})

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
  const video = await Video.findByIdAndUpdate(videoId, {
    set: {
      title,
      description,
      thumbnail,
    },
    new: true,
  });

  // TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await deleteFromCloudinary(req.videoId)
  if (!vidio) {
    throw new ApiError(500,"video cannot be deleted ")
  }
  return res 
    .status(200, "vido can be deleted ")
  .json(new ApiResponse(200,"vidio can be deleted from cloudnary") )
  


  // TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const vidio = await Vidio.findById(req.userId)
  if (!vidio) {
    throw new ApiError(400,"vidio is not published")
  }
  vidio.publishVideo = !vidio.publishVideo
  await vidio.save()

  return res
    .status(200, "visio can be publised")
  .json(new ApiResponse(200,vidio,"publised successfully"))

  // TODO: toggle publish status
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
