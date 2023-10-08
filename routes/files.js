const express = require('express')
const router = express.Router()
const { uploadFiles, downloadFile, listFiles, deleteFile } = require(
  '../controllers/fileController')

router.post('/', uploadFiles)
router.get('/:filename', downloadFile)
router.get('/', listFiles)
router.delete('/:filename', deleteFile)

module.exports = router
