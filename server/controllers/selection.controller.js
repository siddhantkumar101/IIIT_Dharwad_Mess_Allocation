const MealSelection = require('../models/MealSelection');
const User = require('../models/User');

const MAX_CAPACITY = 750; // Seating capacity limit per mess per meal

// Helper to get tomorrow's date string in YYYY-MM-DD format
const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// Helper to get today's date string in YYYY-MM-DD format
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// POST /api/selections
// Student submits or updates selections with 750-seat capacity check
const submitSelection = async (req, res) => {
  try {
    const { date, selections } = req.body;
    const studentId = req.user.userId;

    if (!Array.isArray(selections) || selections.length === 0) {
      return res.status(400).json({ message: 'Selections array is required' });
    }

    const validMealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const validChoices = ['mess1', 'mess2', 'skip'];

    for (const sel of selections) {
      if (!sel.mealType || !validMealTypes.includes(sel.mealType)) {
        return res.status(400).json({ message: `Invalid mealType: ${sel.mealType}` });
      }
      if (!sel.choice || !validChoices.includes(sel.choice)) {
        return res.status(400).json({ message: `Invalid choice: ${sel.choice}` });
      }
    }

    // Mess booking can be made for tomorrow only
    const tomorrow = getTomorrowDate();
    const targetDate = date || tomorrow;

    if (targetDate !== tomorrow) {
      return res.status(400).json({
        message: `Mess booking is allowed for tomorrow (${tomorrow}) only.`
      });
    }

    // Capacity check: Ensure neither mess exceeds MAX_CAPACITY (750) for any chosen meal
    for (const sel of selections) {
      if (sel.choice === 'mess1' || sel.choice === 'mess2') {
        const count = await MealSelection.countDocuments({
          date: targetDate,
          student: { $ne: studentId },
          selections: {
            $elemMatch: {
              mealType: sel.mealType,
              choice: sel.choice
            }
          }
        });

        if (count >= MAX_CAPACITY) {
          const messName = sel.choice === 'mess1' ? 'Mess 1' : 'Mess 2';
          const altMess = sel.choice === 'mess1' ? 'Mess 2' : 'Mess 1';
          return res.status(400).json({
            message: `${messName} is fully booked (${count}/${MAX_CAPACITY} seats) for ${sel.mealType}. Please select ${altMess} or Skip.`
          });
        }
      }
    }

    // Check if user already submitted for tomorrow to report status cleanly
    const existing = await MealSelection.findOne({ student: studentId, date: targetDate });
    const isUpdate = Boolean(existing);

    // Upsert selection for { student, date }
    const saved = await MealSelection.findOneAndUpdate(
      { student: studentId, date: targetDate },
      {
        student: studentId,
        date: targetDate,
        selections,
        submittedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: isUpdate
        ? 'Selections updated successfully!'
        : 'Selections submitted successfully!',
      isUpdate,
      selection: saved
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error saving meal selections', error: error.message });
  }
};

// GET /api/selections/availability?date=
// Returns seat bookings and full-status per mess per meal (750 limit)
const getAvailability = async (req, res) => {
  try {
    const targetDate = req.query.date || getTomorrowDate();

    const pipeline = [
      { $match: { date: targetDate } },
      { $unwind: '$selections' },
      {
        $group: {
          _id: {
            mealType: '$selections.mealType',
            choice: '$selections.choice'
          },
          count: { $sum: 1 }
        }
      }
    ];

    const results = await MealSelection.aggregate(pipeline);

    const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const availability = {};

    mealTypes.forEach((m) => {
      availability[m] = {
        mess1: 0,
        mess2: 0,
        maxCapacity: MAX_CAPACITY,
        mess1Full: false,
        mess2Full: false
      };
    });

    results.forEach((r) => {
      const { mealType, choice } = r._id;
      if (availability[mealType] && (choice === 'mess1' || choice === 'mess2')) {
        availability[mealType][choice] = r.count;
        if (r.count >= MAX_CAPACITY) {
          availability[mealType][`${choice}Full`] = true;
        }
      }
    });

    return res.status(200).json({
      date: targetDate,
      maxCapacity: MAX_CAPACITY,
      meals: availability
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error checking seat availability', error: error.message });
  }
};

// GET /api/selections/my?date=
// Student gets own selection for a given date (defaults to tomorrow)
const getMySelection = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const date = req.query.date || getTomorrowDate();

    const selection = await MealSelection.findOne({ student: studentId, date });
    return res.status(200).json(selection || null);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching own selections', error: error.message });
  }
};

// GET /api/selections/headcount?mess=&date=&meal=
// Aggregates headcounts including Default Hostel Allocations:
// If a student hasn't selected for this day:
// - Boys Hostel defaults to Mess 1
// - Girls Hostel defaults to Mess 2
const getHeadcount = async (req, res) => {
  try {
    let { mess, date, meal } = req.query;

    // Enforce role scoping
    if (req.user.role === 'mess1') {
      mess = 'mess1';
    } else if (req.user.role === 'mess2') {
      mess = 'mess2';
    }

    const targetDate = date || getTodayDate();
    const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];

    // Pipeline to join all students with their meal selection for targetDate
    const pipeline = [
      { $match: { role: 'student' } },
      {
        $lookup: {
          from: 'mealselections',
          let: { sId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$student', '$$sId'] },
                    { $eq: ['$date', targetDate] }
                  ]
                }
              }
            }
          ],
          as: 'selectionDoc'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          hostel: { $ifNull: ['$hostel', 'boys'] },
          selection: { $arrayElemAt: ['$selectionDoc.selections', 0] }
        }
      }
    ];

    const students = await User.aggregate(pipeline);

    const summary = {
      breakfast: 0,
      lunch: 0,
      snacks: 0,
      dinner: 0
    };

    students.forEach((s) => {
      const defaultMess = s.hostel === 'girls' ? 'mess2' : 'mess1';

      mealTypes.forEach((m) => {
        let choice = defaultMess; // Default allocation if not explicitly submitted

        if (s.selection && Array.isArray(s.selection)) {
          const found = s.selection.find((item) => item.mealType === m);
          if (found && found.choice) {
            choice = found.choice;
          }
        }

        // Count if matching target mess
        if (mess) {
          if (choice === mess) {
            summary[m] += 1;
          }
        } else {
          // If all messes requested
          summary[m] += 1;
        }
      });
    });

    return res.status(200).json({
      mess: mess || 'all',
      date: targetDate,
      summary
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error aggregating headcount', error: error.message });
  }
};

// GET /api/selections/list?mess=&date=&meal=
// Named student list per mess, date, and meal with default allocation fallback
const getStudentList = async (req, res) => {
  try {
    let { mess, date, meal } = req.query;

    if (!meal) {
      return res.status(400).json({ message: 'Meal query parameter is required' });
    }

    // Role-based scoping
    if (req.user.role === 'mess1') {
      mess = 'mess1';
    } else if (req.user.role === 'mess2') {
      mess = 'mess2';
    }

    if (!mess) {
      return res.status(400).json({ message: 'Mess query parameter is required' });
    }

    const targetDate = date || getTodayDate();

    const pipeline = [
      { $match: { role: 'student' } },
      {
        $lookup: {
          from: 'mealselections',
          let: { sId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$student', '$$sId'] },
                    { $eq: ['$date', targetDate] }
                  ]
                }
              }
            }
          ],
          as: 'selectionDoc'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          rollNumber: 1,
          email: 1,
          hostel: { $ifNull: ['$hostel', 'boys'] },
          submittedDoc: { $arrayElemAt: ['$selectionDoc', 0] }
        }
      },
      { $sort: { name: 1 } }
    ];

    const allStudents = await User.aggregate(pipeline);

    const filteredList = [];

    allStudents.forEach((student) => {
      const defaultMess = student.hostel === 'girls' ? 'mess2' : 'mess1';
      let effectiveChoice = defaultMess;
      let isDefaultAllocation = true;
      let submittedAt = null;

      if (student.submittedDoc && Array.isArray(student.submittedDoc.selections)) {
        const found = student.submittedDoc.selections.find((s) => s.mealType === meal);
        if (found && found.choice) {
          effectiveChoice = found.choice;
          isDefaultAllocation = false;
          submittedAt = student.submittedDoc.submittedAt;
        }
      }

      if (effectiveChoice === mess) {
        filteredList.push({
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          hostel: student.hostel,
          isDefaultAllocation,
          submittedAt
        });
      }
    });

    return res.status(200).json(filteredList);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving student list', error: error.message });
  }
};

// GET /api/selections/overview?date=
// Admin overview including explicit and default hostel allocations
const getOverview = async (req, res) => {
  try {
    const targetDate = req.query.date || getTodayDate();
    const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];

    const pipeline = [
      { $match: { role: 'student' } },
      {
        $lookup: {
          from: 'mealselections',
          let: { sId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$student', '$$sId'] },
                    { $eq: ['$date', targetDate] }
                  ]
                }
              }
            }
          ],
          as: 'selectionDoc'
        }
      },
      {
        $project: {
          _id: 1,
          hostel: { $ifNull: ['$hostel', 'boys'] },
          selection: { $arrayElemAt: ['$selectionDoc.selections', 0] }
        }
      }
    ];

    const students = await User.aggregate(pipeline);

    const overview = {
      date: targetDate,
      maxCapacity: MAX_CAPACITY,
      mess1: { breakfast: 0, lunch: 0, snacks: 0, dinner: 0, total: 0 },
      mess2: { breakfast: 0, lunch: 0, snacks: 0, dinner: 0, total: 0 },
      skip: { breakfast: 0, lunch: 0, snacks: 0, dinner: 0, total: 0 }
    };

    students.forEach((s) => {
      const defaultMess = s.hostel === 'girls' ? 'mess2' : 'mess1';

      mealTypes.forEach((m) => {
        let choice = defaultMess;
        if (s.selection && Array.isArray(s.selection)) {
          const found = s.selection.find((item) => item.mealType === m);
          if (found && found.choice) {
            choice = found.choice;
          }
        }

        if (overview[choice] && overview[choice][m] !== undefined) {
          overview[choice][m] += 1;
          overview[choice].total += 1;
        }
      });
    });

    return res.status(200).json(overview);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching overview', error: error.message });
  }
};

module.exports = {
  submitSelection,
  getAvailability,
  getMySelection,
  getHeadcount,
  getStudentList,
  getOverview
};
