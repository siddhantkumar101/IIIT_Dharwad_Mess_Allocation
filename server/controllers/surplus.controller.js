const SurplusReport = require('../models/SurplusReport');

// POST /api/surplus
// Access: mess1, mess2
const submitSurplus = async (req, res) => {
  try {
    let { mess, date, mealType, headcountExpected, headcountServed, surplusQuantityKg, ngoName } = req.body;

    // Enforce mess manager scoping
    if (req.user.role === 'mess1') {
      mess = 'mess1';
    } else if (req.user.role === 'mess2') {
      mess = 'mess2';
    }

    const report = await SurplusReport.create({
      mess,
      date,
      mealType,
      headcountExpected: Number(headcountExpected),
      headcountServed: Number(headcountServed),
      surplusQuantityKg: Number(surplusQuantityKg),
      ngoName: ngoName ? ngoName.trim() : 'Local Food Rescue Partner',
      reportedBy: req.user.userId,
      reportedAt: new Date()
    });

    return res.status(201).json({
      message: 'Surplus report submitted successfully',
      report
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error submitting surplus report', error: error.message });
  }
};

// GET /api/surplus?mess=&date=&mealType=
// Access: admin (and mess1/mess2 managers to see past entries)
const getSurplusReports = async (req, res) => {
  try {
    let { mess, date, mealType } = req.query;

    const filter = {};

    // If manager, scope to their own mess
    if (req.user.role === 'mess1') {
      filter.mess = 'mess1';
    } else if (req.user.role === 'mess2') {
      filter.mess = 'mess2';
    } else if (mess) {
      filter.mess = mess;
    }

    if (date) {
      filter.date = date;
    }

    if (mealType) {
      filter.mealType = mealType;
    }

    const reports = await SurplusReport.find(filter)
      .populate('reportedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving surplus reports', error: error.message });
  }
};

module.exports = {
  submitSurplus,
  getSurplusReports
};

