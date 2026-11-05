const Menu = require("../models/Menu");

// POST /api/menus
// Admin uploads menu for a mess + date
const uploadMenu = async (req, res) => {
  try {
    const { mess, date, meals } = req.body;

    const updatedMenu = await Menu.findOneAndUpdate(
      { mess, date },
      {
        mess,
        date,
        meals,
        uploadedBy: req.user.userId,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json({
      message: "Menu saved successfully",
      menu: updatedMenu,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error saving menu", error: error.message });
  }
};

// GET /api/menus?mess=&date=
// All logged-in: Get menu for a mess on a date (or all menus for that date if mess is not provided)
const getMenu = async (req, res) => {
  try {
    const { mess, date } = req.query;

    const filter = {};
    if (date) {
      filter.date = date;
    }
    if (mess) {
      filter.mess = mess;
    }

    const menus = await Menu.find(filter);

    return res.status(200).json(menus);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching menus", error: error.message });
  }
};

module.exports = {
  uploadMenu,
  getMenu,
};
