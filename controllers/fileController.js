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

const upload = multer({storage: storage});

exports.uploadFiles = (req, res) => {
    upload.array('files', 10)(req, res, async (err) => {
        if (err) {
            return res.status(400).send({error: err.message});
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
            res.status(500).send({error: 'Error encrypting files'});
        }
    });
};

// ...

exports.downloadFile = (req, res) => {
    const {filename} = req.params;

    // Path to the encrypted file
    const filePath = path.resolve('uploads', filename);

    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({error: 'File not found'});
        }

        // Create read and write streams
        const input = fs.createReadStream(filePath);
        const decipher = crypto.createDecipher('aes-256-cbc', 'secretkey');

        // Set the response headers
        res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(filename.replace('.enc', '')));
        res.setHeader('Content-Transfer-Encoding', 'binary');

        // Decrypt the file on the fly and send it
        input.pipe(decipher).pipe(res);
    } catch (error) {
        res.status(500).json({error: 'Error downloading the file'});
    }
};

exports.listFiles = (req, res) => {
    const directoryPath = path.join(__dirname, '..', 'uploads');

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({error: 'Unable to scan directory'});
        }

        const fileList = files.map(file => {
            const filePath = path.join(directoryPath, file);
            const stat = fs.statSync(filePath);

            return {
                name: file,
                size: stat.size,
                createdAt: stat.birthtime,
                modifiedAt: stat.mtime
            };
        });

        res.status(200).json(fileList);
    });
};

