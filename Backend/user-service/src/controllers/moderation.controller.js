exports.warnUser = async (req, res) => {

  const userId = req.params.id;

  const user = await userRepo.getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updated = await userRepo.updateUserById(userId, {
    violationCount: user.violationCount + 1
  });

  res.json({
    message: "User warned",
    violationCount: updated.violationCount
  });

};

exports.suspendUser = async (req, res) => {

  const userId = req.params.id;

  const suspensionDays = req.body.suspensionDays || 3;

  const suspensionEnd = new Date();
  suspensionEnd.setDate(suspensionEnd.getDate() + suspensionDays);

  const user = await userRepo.getUserById(userId);

  const updated = await userRepo.updateUserById(userId, {

    isSuspended: true,

    suspensionEnd: suspensionEnd,

    suspensionCount: user.suspensionCount + 1

  });

  res.json({
    message: "User suspended",
    suspensionEnd: suspensionEnd
  });

};


exports.banUser = async (req, res) => {

  const userId = req.params.id;

  await userRepo.updateUserById(userId, {
    isBanned: true
  });

  res.json({
    message: "User permanently banned"
  });

};