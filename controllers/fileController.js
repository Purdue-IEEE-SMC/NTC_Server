const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

exports.uploadFiles = (req, res) => {
    upload.array('files', 10)(req, res, async (err) => {
        if (err) {
            return res.status(400).send({ error: err.message });
        }

        try {
            // Encrypt the uploaded files
            const encryptedFiles = req.files.map(file => {
                const input = fs.createReadStream(file.path);
                const output = fs.createWriteStream(file.path + '.enc');
                const cipher = crypto.createCipher('aes-256-cbc', 'secretkey');

                input.pipe(cipher).pipe(output);

                return file.filename + '.enc';
            });

            res.status(200).json({
                message: 'Files uploaded and encrypted successfully',
                encryptedFiles
            });
        } catch (error) {
            res.status(500).send({ error: 'Error encrypting files' });
        }
    });
};
