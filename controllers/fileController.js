const multer = require('multer')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { pipeline } = require('stream')
const { promisify } = require('util')
const pipelineAsync = promisify(pipeline)
const { Readable } = require('stream')

// Set up multer with a file filter to only allow CSV files
// Use memory storage to avoid writing to disk
const upload = multer({
  storage: multer.memoryStorage(), fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.csv') {
      return cb(new Error('Only CSV files are allowed'))
    }
    cb(null, true)
  },
})


// Upload files and encrypt them
exports.uploadFiles = (req, res) => {
  upload.array('files', 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ error: err.message })
    }

    try {
      // Encrypt each file asynchronously
      const encryptedFilesPromises = req.files.map(async (file) => {
        const outputPath = path.resolve('uploads', file.originalname + '.enc')

        // Generate a random IV and salt
        const iv = crypto.randomBytes(16)
        const salt = crypto.randomBytes(32)

        // Generate a key
        const key = crypto.scryptSync(process.env.SECRET_KEY, salt, 32)

        // Create a cipher
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

        const input = Buffer.from(file.buffer)
        const encrypted = Buffer.concat(
          [salt, iv, cipher.update(input), cipher.final()])

        // Asynchronously write the encrypted file
        await fs.promises.writeFile(outputPath, encrypted)

        return file.originalname + '.enc'
      })

      const encryptedFiles = await Promise.all(encryptedFilesPromises)

      res.status(200).json({
        message: 'Files uploaded and encrypted successfully',
        encryptedFiles,
      })

    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Error encrypting files' })
    }
  })
}

exports.downloadFile = async (req, res) => {
  const { filename } = req.params
  const filePath = path.resolve('uploads', filename)

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    const input = await fs.promises.readFile(filePath)
    const salt = input.subarray(0, 32)
    const iv = input.subarray(32, 48)
    const fileContent = input.subarray(48)

    const key = crypto.scryptSync(process.env.SECRET_KEY, salt, 32)
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)

    res.setHeader('Content-Disposition',
      'attachment; filename=' + path.basename(filename.replace('.enc', '')))
    res.setHeader('Content-Transfer-Encoding', 'binary')

    const decipherStream = new Readable({
      read () {
        this.push(decipher.update(fileContent))
        this.push(decipher.final())
        this.push(null) // indicates the end of the stream
      },
    })

    await pipelineAsync(decipherStream, res)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error downloading the file' })
  }
}

exports.listFiles = (req, res) => {
  const directoryPath = path.resolve('uploads')

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' })
    }

    const fileList = files.map(file => {
      const filePath = path.join(directoryPath, file)
      const stat = fs.statSync(filePath)

      return {
        name: file,
        size: stat.size,
        createdAt: stat.birthtime,
        modifiedAt: stat.mtime,
      }
    })

    res.status(200).json(fileList)
  })
}
