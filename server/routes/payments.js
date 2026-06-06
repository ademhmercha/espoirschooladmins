const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { getAll, getHistory, generate, create, update } = require('../controllers/paymentController');

router.use(auth, adminOnly);

router.get('/history/:studentId', getHistory);
router.get('/', getAll);
router.post('/generate', generate);
router.post('/', create);
router.put('/:id', update);

module.exports = router;
