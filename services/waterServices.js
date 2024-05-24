import { Water } from "../models/waterModel.js";
import mongoose from "mongoose";

export async function addWater(data, owner) {
  const newWater = new Water({ ...data, owner });
  await newWater.save();

  const ObjectId = mongoose.Types.ObjectId;

  const result = await Water.findById(new ObjectId(newWater._id));
  return result;
}

export async function updatesWater(req, id, body) {
  const { _id: owner } = req.user;
  const updatedWater = await Water.findOneAndUpdate({ _id: id, owner }, body, {
    new: true,
  });
  return updatedWater;
}
//==========
export async function removeWater(req, id) {
  const { _id: owner } = req.user;

  const removedWater = await Water.findOneAndDelete({
    _id: id,
    owner,
  });

  if (!removedWater) {
    return null;
  }

  const updatedWaterArray = await Water.find({ owner });

  return updatedWaterArray;
}

export async function listMonthByDay(req) {
  const { _id: owner, dailyWaterNorma } = req.user;
  const { date } = req.params;

  const year = date.substring(0, 4);
  const month = date.substring(5, 7);

  const list = await Water.aggregate([
    { $match: { owner, dateDose: { $regex: `^${year}-${month}` } } },
    { $unset: ["createdAt", "updatedAt"] },
    { $sort: { timeDose: 1 } },
    {
      $group: {
        _id: "$dateDose",
        totalAmount: { $sum: "$amountDose" },
      },
    },
  ]);

  const monthlyList = list.map((item) => {
    const dateDose = item._id;
    const totalAmount = item.totalAmount;
    const percentage = Math.round((totalAmount / dailyWaterNorma) * 100);

    return { dateDose, percentage };
  });

  return monthlyList;
}

export async function listDay(req) {
  const { _id: owner, dailyWaterNorma } = req.user;
  const { dateDose } = req.body;

  const list = await Water.find({ owner, dateDose });

  const dailyList = list.map((item) => {
    const { timeDose, amountDose } = item;
    const percentage = Math.round((amountDose / dailyWaterNorma) * 100);

    return { timeDose, amountDose, percentage };
  });

  return dailyList;
}

export async function listDate(req) {
  const { _id: owner, dailyWaterNorma } = req.user;
  const date = req.params.date;

  const list = await Water.find({ owner, dateDose: date });

  const dailyList = list.map((item) => {
    const { _id, timeDose, amountDose } = item;
    const percentage = Math.round((amountDose / dailyWaterNorma) * 100);

    return { _id, timeDose, amountDose, percentage };
  });

  return dailyList;
}
