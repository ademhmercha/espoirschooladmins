const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { getDashboard } = require('../controllers/dashboardController');

router.get('/', auth, adminOnly, getDashboard);

module.exports = router;
