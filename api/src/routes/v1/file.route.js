const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const fileValidation = require('../../validations/file.validation');
const fileController = require('../../controllers/file.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(fileValidation.uploadFile), fileController.uploadFiles)
  .get(validate(fileValidation.listFiles), fileController.listFiles);

router
  .route('/:filename')
  .get(validate(fileValidation.getFile), fileController.getFile)
  .delete(auth(), validate(fileValidation.deleteFile), fileController.deleteFile);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: File
 *   description: File management and retrieval
 */

/**
 * @swagger
 * /files/:
 *   post:
 *     summary: Upload files
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: files
 *         in: formData
 *         description: File to be uploaded (max 10)
 *         required: true
 *         type: file
 *     responses:
 *       "201":
 *         description: File(s) uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 *       "400":
 *         description: Invalid data format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "409":
 *         description: File already exists
 *
 *   get:
 *     summary: List Files
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 */

/**
 * @swagger
 * /files/{filename}:
 *   get:
 *     summary: Retrieve file by filename
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename of the desired file
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete file by filename
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename of the file to be deleted
 *     responses:
 *       "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/File'
 *       "204":
 *         description: No Content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
