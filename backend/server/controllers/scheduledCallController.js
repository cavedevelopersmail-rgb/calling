const ScheduledCall = require('../models/ScheduledCall');

exports.getAllScheduledCalls = async (req, res) => {
  try {
    const scheduledCalls = await ScheduledCall.find({ userId: req.userId }).sort({ scheduledTime: 1 });

    res.status(200).json(scheduledCalls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createScheduledCall = async (req, res) => {
  try {
    const { phoneNumber, scheduledTime, message, name, notes } = req.body;

    if (!phoneNumber || !scheduledTime) {
      return res.status(400).json({ message: 'Phone number and scheduled time are required' });
    }

    const scheduledCall = new ScheduledCall({
      userId: req.userId,
      phoneNumber,
      scheduledTime,
      message,
      name,
      notes,
    });

    await scheduledCall.save();

    res.status(201).json(scheduledCall);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateScheduledCall = async (req, res) => {
  try {
    const { phoneNumber, scheduledTime, message, name, notes } = req.body;

    const scheduledCall = await ScheduledCall.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!scheduledCall) {
      return res.status(404).json({ message: 'Scheduled call not found' });
    }

    if (phoneNumber !== undefined) scheduledCall.phoneNumber = phoneNumber;
    if (scheduledTime !== undefined) scheduledCall.scheduledTime = scheduledTime;
    if (message !== undefined) scheduledCall.message = message;
    if (name !== undefined) scheduledCall.name = name;
    if (notes !== undefined) scheduledCall.notes = notes;

    await scheduledCall.save();

    res.status(200).json(scheduledCall);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteScheduledCall = async (req, res) => {
  try {
    const scheduledCall = await ScheduledCall.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!scheduledCall) {
      return res.status(404).json({ message: 'Scheduled call not found' });
    }

    res.status(200).json({ message: 'Scheduled call deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateScheduledCallStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const scheduledCall = await ScheduledCall.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!scheduledCall) {
      return res.status(404).json({ message: 'Scheduled call not found' });
    }

    scheduledCall.status = status;
    await scheduledCall.save();

    res.status(200).json(scheduledCall);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
