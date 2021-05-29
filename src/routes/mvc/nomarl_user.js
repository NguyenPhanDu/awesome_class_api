const express = require('express');
const router = express.Router();
const NomarlUserController = require('../../app/controllers/NomarlUserController');

router.get('/', NomarlUserController.index);

module.exports = router;