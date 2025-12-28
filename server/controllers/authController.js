const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const generateToken = (id)=>{
  return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"1d"});
};

exports.register = async(req,res)=>{
  const {name,email,password} = req.body;

  const exists = await User.findOne({email});
  if(exists) return res.status(400).json({message:"User exists"});

  const hashed = await bcrypt.hash(password,10);
  const user = await User.create({name,email,password:hashed});

  res.json({
    _id:user._id,
    name:user.name,
    token:generateToken(user._id)
  });
};

exports.login = async(req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({email});
  if(!user) return res.status(401).json({message:"Invalid credentials"});

  const match = await bcrypt.compare(password,user.password);
  if(!match) return res.status(401).json({message:"Invalid credentials"});

  res.json({
    _id:user._id,
    name:user.name,
    token:generateToken(user._id)
  });
};

exports.getProfile = async (req, res) => {
  const createdGroups = await Group.find({ admin: req.user._id });
  const memberGroups = await Group.find({
    members: req.user._id,
    admin: { $ne: req.user._id }
  });

  res.json({
    name: req.user.name,
    email: req.user.email,
    createdGroups,
    memberGroups
  });
};

