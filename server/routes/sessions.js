const router = require('express').Router();
const auth = require('../middleware/auth');
const { getByGroup, create } = require('../controllers/sessionController');

router.use(auth);

router.get('/group/:groupId', getByGroup);
router.post('/', create);

module.exports = router;
