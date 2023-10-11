const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dataValidation = require('../../validations/data.validation');
const dataController = require('../../controllers/data.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(dataValidation.uploadData), dataController.uploadData)
  .get(auth(), validate(dataValidation.listData), dataController.listData);

router
  .route('/:filename')
  .get(auth(), validate(dataValidation.getData), dataController.getData)
  .delete(auth(), validate(dataValidation.deleteData), dataController.deleteData);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Data
 *   description: Data management and retrieval
 */

/**
 * @swagger
 * /data/:
 *   post:
 *     summary: Upload data
 *     tags: [Data]
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
 *         description: Data uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *            schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DataItem'
 *       "400":
 *         description: Invalid data format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "409":
 *         description: Data already exists
 *
 *   get:
 *     summary: List data
 *     tags: [Data]
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
 *                 $ref: '#/components/schemas/DataItem'
 */

/**
 * @swagger
 * /data/{filename}:
 *   get:
 *     summary: Retrieve data by filename
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename of the desired data
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataItem'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete data by filename
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename of the data to be deleted
 *     responses:
 *       "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/DataItem'
 *       "204":
 *         description: No Content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
