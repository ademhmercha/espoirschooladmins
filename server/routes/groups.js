const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { getAll, getOne, create, update, remove, addStudent, removeStudent } = require('../controllers/groupController');

router.use(auth);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', adminOnly, create);
router.put('/:id', adminOnly, update);
router.delete('/:id', adminOnly, remove);
router.post('/:id/students', adminOnly, addStudent);
router.delete('/:id/students/:studentId', adminOnly, removeStudent);

module.exports = router;
