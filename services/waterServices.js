import { Water } from "../models/waterModel.js";
import mongoose from "mongoose";

export async function addWater(...data) {
  const newWater = new Water(...data);
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

export async function removeWater(req, id) {
  const { _id: owner } = req.user;
  const removedWater = await Water.findOneAndDelete({
    _id: id,
    owner,
  });
  if (!removedWater) {
    return null;
  }
  return removedWater;
}
//=======
//стара відповідь за місяць
//{ "2024-05-21": { "totalAmount": 14352, "percentage": 957 }, "2024-05-20": { "totalAmount": 900, "percentage": 60 }, "2024-05-22": { "totalAmount": 2050, "percentage": 137 } }
// export async function listMonth(req) {
//   const { _id: owner, dailyWaterNorma } = req.user;

//   const { dateDose } = req.body;

//   const year = dateDose.substring(0, 4);
//   const month = dateDose.substring(5, 7);

//   const list = await Water.aggregate([
//     { $match: { owner, dateDose: { $regex: `^${year}-${month}` } } },
//     { $unset: ["createdAt", "updatedAt"] },
//     { $sort: { timeDose: 1 } },
//     {
//       $group: {
//         _id: "$dateDose",
//         totalAmount: { $sum: "$amountDose" },
//       },
//     },
//   ]);

//   const dailyList = {};
//   list.forEach((item) => {
//     const date = item._id;
//     const totalAmount = item.totalAmount;

//     const percentage = Math.round((totalAmount / dailyWaterNorma) * 100);

//     dailyList[date] = { totalAmount, percentage };
//   });

//   return dailyList;
// }

//=======
//масив даних за місяць:[{"dateDose":"2024-05-21","totalAmount":14352,"percentage":957},{"dateDose":"2024-05-20","totalAmount":900,"percentage":60},{"dateDose":"2024-05-22","totalAmount":2050,"percentage":137}]
export async function listMonth(req) {
  const { _id: owner, dailyWaterNorma } = req.user;
  const { dateDose } = req.body;

  const year = dateDose.substring(0, 4);
  const month = dateDose.substring(5, 7);

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

  const dailyList = list.map((item) => {
    const dateDose = item._id;
    const totalAmount = item.totalAmount;
    const percentage = Math.round((totalAmount / dailyWaterNorma) * 100);

    return { dateDose, totalAmount, percentage };
  });

  return dailyList;
}
//==========
export async function listMonthByDay(req) {
  const { _id: owner, dailyWaterNorma } = req.user;
  const { date } = req.params; // Отримуємо дату з параметрів маршруту

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

    return { dateDose, totalAmount, percentage };
  });

  return monthlyList;
}

//==========
//відповідь масив за день [{"timeDose":"23:01","amountDose":500,"percentage":33},{"timeDose":"23:55","amountDose":400,"percentage":27}]
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
//==========
//минула відповідь за день {"list":[{"amount":500,"time":"23:01"},{"amount":400,"time":"23:55"}],"totalWater":900,"percent":60}
// export async function listDay(req) {
//   const { _id: owner, dailyWaterNorma } = req.user;

//   const { dateDose } = req.body;

//   const list = await Water.aggregate([
//     {
//       $match: { owner, dateDose },
//     },
//     {
//       $group: {
//         _id: null,
//         totalWater: { $sum: "$amountDose" },
//         doses: { $push: { amount: "$amountDose", time: "$timeDose" } },
//       },
//     },
//   ]);

//   const { totalWater } = list.length > 0 ? list[0] : { totalWater: 0 };

//   const percent = (totalWater / dailyWaterNorma) * 100;

//   return {
//     list: list[0]?.doses || [],
//     totalWater,
//     percent,
//   };
// }
//===========
//відповідь за датою з фронтенду [{"timeDose":"23:01","amountDose":500,"percentage":33},{"timeDose":"23:55","amountDose":400,"percentage":27}]
export async function listDate(req) {
  const { _id: owner, dailyWaterNorma } = req.user;
  const date = req.params.date; // Отримання значення дати з параметрів шляху

  const list = await Water.find({ owner, dateDose: date }); // Фільтрація за датою date

  const dailyList = list.map((item) => {
    const { timeDose, amountDose } = item;
    const percentage = Math.round((amountDose / dailyWaterNorma) * 100);

    return { timeDose, amountDose, percentage };
  });

  return dailyList;
}
