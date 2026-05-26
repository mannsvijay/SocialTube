# Quick Reference: Production Patterns Used

## 1. DRY Helper Pattern (like.controller.js)
```javascript
const toggleLike = async (resourceType, resourceId, userId) => {
    if (!isValidObjectId(resourceId)) throw new ApiError(400, "Invalid resource ID")
    
    const query = {likedBy: userId, [resourceType]: resourceId}
    const existingLike = await Like.findOne(query)
    
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return {isLiked: false}
    }
    
    const newLike = await Like.create(query)
    return {isLiked: true, like: newLike}
}

// Reused for video, comment, tweet
const toggleVideoLike = asyncHandler(async (req, res) => {
    const result = await toggleLike("video", videoId, req.user._id)
    res.status(200).json(new ApiResponse(200, result, "..."))
})
```

## 2. Ownership Authorization Pattern (all CRUD endpoints)
```javascript
const resource = await Model.findById(resourceId)
if (!resource) throw new ApiError(404, "Resource not found")
if (resource.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized")
}
// Safe to modify now
```

## 3. Validation Pattern
```javascript
const {videoId} = req.params
const {content} = req.body

if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")
if (!content?.trim()) throw new ApiError(400, "Content required")
if (!entity) throw new ApiError(404, "Entity not found")
```

## 4. Aggregation + Pagination Pattern (dashboard, comments)
```javascript
const comments = await Comment.aggregate([
    {$match: {video: mongoose.Types.ObjectId(videoId)}},
    {$lookup: {from: "users", localField: "owner", foreignField: "_id", as: "ownerDetails"}},
    {$unwind: "$ownerDetails"},
    {$sort: {createdAt: -1}},
    {$skip: (page - 1) * limit},
    {$limit: parseInt(limit)},
    {$project: {"ownerDetails.password": 0}}
])

const total = await Comment.countDocuments({video: videoId})
res.status(200).json(new ApiResponse(200, {comments, total}, "Retrieved"))
```

## 5. Dynamic Filter/Sort Pattern (video controller)
```javascript
const filter = {isPublished: true}
if (query) {
    filter.$or = [
        {title: {$regex: query, $options: "i"}},
        {description: {$regex: query, $options: "i"}}
    ]
}
if (userId) filter.owner = userId

const sort = {[sortBy]: sortType === "desc" ? -1 : 1}

await Video.find(filter).sort(sort).skip(...).limit(...)
```

## 6. File Upload + Cloudinary Pattern (video controller)
```javascript
const videoFile = req.files?.videoFile?.[0]
const thumbnail = req.files?.thumbnail?.[0]

if (!videoFile || !thumbnail) throw new ApiError(400, "Files required")

const videoUrl = await uploadOnCloudinary(videoFile.path)
const thumbnailUrl = await uploadOnCloudinary(thumbnail.path)

if (!videoUrl || !thumbnailUrl) throw new ApiError(500, "Upload failed")

const video = await Video.create({
    videoFile: videoUrl.url,
    thumbNail: thumbnailUrl.url,
    ...
})
```

## 7. Counter/Increment Pattern (video views)
```javascript
const video = await Video.findById(videoId).populate("owner")
await Video.findByIdAndUpdate(videoId, {$inc: {views: 1}})
```

## 8. Toggle Boolean Pattern (publish status)
```javascript
video.isPublished = !video.isPublished
await video.save()
res.status(200).json(new ApiResponse(200, {isPublished: video.isPublished}, "..."))
```

## HTTP Status Codes Used
| Code | Scenario |
|------|----------|
| 200 | Successful GET/PATCH |
| 201 | Successful POST (created) |
| 400 | Validation error |
| 403 | Authorization failed (not owner) |
| 404 | Resource not found |
| 500 | Server error (upload failed) |

## All Error Messages Standardized
- "Invalid {resource} ID" - Bad ObjectId
- "{Resource} not found" - 404
- "{Resource} {action}" required/failed - 400
- "Unauthorized" - 403
- "Failed to upload files" - 500

---

## Key Takeaways

1. **Minimize Controllers** - Use helpers for repeated patterns
2. **Validate Early** - Check IDs and required fields first
3. **Populate Efficiently** - Select only needed fields
4. **Count Separately** - For pagination, count separately
5. **Secure by Default** - Always verify ownership for mutations
6. **Consistent Responses** - Use ApiResponse wrapper always
7. **Clear Error Messages** - Include what's wrong, not just codes

