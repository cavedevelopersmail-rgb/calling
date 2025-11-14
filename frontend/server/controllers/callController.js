const Call = require('../models/Call');

exports.getAllCalls = async (req, res) => {
  try {
    const calls = await Call.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.status(200).json(calls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createCall = async (req, res) => {
  try {
    const { phoneNumber, duration, status, transcript, recording } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const call = new Call({
      userId: req.userId,
      phoneNumber,
      duration,
      status,
      transcript,
      recording,
    });

    await call.save();

    res.status(201).json(call);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCallById = async (req, res) => {
  try {
    const call = await Call.findOne({ _id: req.params.id, userId: req.userId });

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    res.status(200).json(call);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
