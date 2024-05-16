import { Water } from "../models/waterModel.js";

//Додає новий об'єкт колекції waters авторизованим користувачем
export async function addWater(...data) {
  const newWater = new Water(...data);
  console.log(newWater);
  await newWater.save();
  return newWater;
}

//Оновлення об'єкту колекції waters авторизованим користувачем
export async function updatesWater(req, id, body) {
  const { _id: owner } = req.user;
  const updatedWater = await Water.findOneAndUpdate({ _id: id, owner }, body, {
    new: true,
  });
  return updatedWater;
}

//видалення об'єкту колекції waters авторизованим користувачем
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

// Повертає listMonth
//===========
export async function listMonth(req) {
  console.log(req.params);
  const { _id: owner, dailyWaterNorma } = req.user;
  const list = await Water.aggregate([
    { $match: { owner } },
    { $unset: ["createdAt", "updatedAt"] },
    { $sort: { timeDose: 1 } },
    {
      $group: {
        _id: "$dateDose",
        totalAmount: { $sum: "$amountDose" },
      },
    },
  ]);

  const dailyList = {};
  list.forEach((item) => {
    const date = item._id;
    const totalAmount = item.totalAmount;

    // Обчислення відсотка спожитої води від денної норми та округлення до цілого числа
    const percentage = Math.round((totalAmount / dailyWaterNorma) * 100);

    dailyList[date] = { totalAmount, percentage };
  });

  return dailyList;
}
