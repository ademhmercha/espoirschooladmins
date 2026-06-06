const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { getAll, getOne, create, update, remove } = require('../controllers/studentController');

router.use(auth);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', adminOnly, create);
router.put('/:id', adminOnly, update);
router.delete('/:id', adminOnly, remove);

module.exports = router;
