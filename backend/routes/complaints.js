const express = require('express');
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.use(protect);

// @route  POST /api/complaints
// @desc   USER: Submit Complaint -> status = Pending
router.post('/', requireRole('user'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const complaint = await Complaint.create({
      title,
      description,
      category: category || 'General',
      submittedBy: req.user._id,
      status: 'Pending',
    });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/complaints/my
// @desc   USER: track own complaints' status
router.get('/my', requireRole('user'), async (req, res) => {
  const complaints = await Complaint.find({ submittedBy: req.user._id }).sort('-createdAt');
  res.json(complaints);
});

// @route  GET /api/complaints
// @desc   ADMIN: View All Complaints (search/filter)
router.get('/', requireRole('admin'), async (req, res) => {
  const { search, status, category } = req.query;
  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  const complaints = await Complaint.find(query)
    .populate('submittedBy', 'name email')
    .sort('-createdAt');
  res.json(complaints);
});

// @route  GET /api/complaints/:id
// @desc   View Details (admin, or the user who owns it)
router.get('/:id', async (req, res) => {
  const complaint = await Complaint.findById(req.params.id).populate(
    'submittedBy',
    'name email'
  );
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  const isOwner = complaint.submittedBy._id.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(complaint);
});

// @route  PUT /api/complaints/:id/status
// @desc   ADMIN: Update Status -> Admin Review / In Progress / Resolved / Rejected
router.put('/:id/status', requireRole('admin'), async (req, res) => {
  const { status, adminNotes } = req.body;
  const allowed = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `status must be one of ${allowed.join(', ')}` });
  }
  const update = { status };
  if (adminNotes !== undefined) update.adminNotes = adminNotes;

  const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, {
    new: true,
  }).populate('submittedBy', 'name email');
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  res.json({ message: 'Complaint updated', complaint });
});

module.exports = router;
