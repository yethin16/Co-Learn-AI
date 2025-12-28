const Group = require("../models/Group");
const Message = require("../models/Message");

exports.createGroup = async(req,res)=>{
  const group = await Group.create({
    name: req.body.name,
    admin: req.user._id,
    members: [req.user._id]
  });
  res.json(group);
};

exports.joinGroup = async(req,res)=>{
  const group = await Group.findById(req.params.id);
  if(!group){
    return res.status(404).json({ message: "Group not found" });
  }

  const userId = req.user._id.toString();

  if (!group.members.map(m => m.toString()).includes(userId)) {
    group.members.push(req.user._id);
    await group.save();
  }

  res.json(group);
};

exports.getAllGroups = async (req, res) => {
  const groups = await Group.find({})
    .populate("admin", "name _id");

  res.json(groups);
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Message.deleteMany({ group: group._id });
    await group.deleteOne();

    global.io.to(req.params.groupId).emit("groupDeleted", {
      groupId: req.params.groupId
    });

    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
