const express = require('express');
const router = express.Router();
const RequestController = require('../controllers/requests.controller');
const { requireAdmin } = require('../middlewares/role.middleware');

router.post('/', RequestController.create);
router.get('/', RequestController.getAll);
router.put('/:id/status', requireAdmin, RequestController.updateStatus);
router.get('/:id/history', RequestController.getHistory);
router.post('/:id/auto-process', RequestController.autoProcess);


router.get('/:id/history', async (req, res) => {
  try {
    const history = await RequestHistory.findByRequestId(req.params.id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
