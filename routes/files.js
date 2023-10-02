const express = require('express')
const router = express.Router()
const { uploadFiles, downloadFile, listFiles } = require(
  '../controllers/fileController')

router.post('/upload', uploadFiles)
router.get('/download/:filename', downloadFile)
router.get('/', listFiles)

module.exports = router
