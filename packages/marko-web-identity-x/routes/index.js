const { Router } = require('express');
const { json } = require('body-parser');
const jsonErrorHandler = require('../utils/json-error-handler');
const authenticate = require('./authenticate');
const changeEmail = require('./change-email');
const commentCount = require('./comment-count');
const comments = require('./comments');
const countries = require('./countries');
const createComment = require('./create-comment');
const flagComment = require('./flag-comment');
const login = require('./login');
const loginFields = require('./login-fields');
const logout = require('./logout');
const profile = require('./profile');
const regions = require('./regions');

const router = Router();

router.use(json());
router.get('/comment-count/:identifier', commentCount);
router.get('/comments/:identifier', comments);
router.get('/countries', countries);
router.get('/regions', regions);
router.post('/authenticate', authenticate);
router.post('/change-email', changeEmail);
router.post('/comment', createComment);
router.post('/comment/flag/:id', flagComment);
router.post('/login-fields', loginFields);
router.post('/login', login);
router.post('/logout', logout);
router.post('/profile', profile);
router.use(jsonErrorHandler());

module.exports = router;
