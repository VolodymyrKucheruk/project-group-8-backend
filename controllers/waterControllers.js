import {
  addWater,
  updatesWater,
  removeWater,
  listMounth,
} from "../services/waterServices.js";

import HttpError from "../helpers/HttpError.js";

export const createWater = async (req, res) => {
  const { _id: owner } = req.user;

  try {
    const result = await addWater({ ...req.body, owner });
    res.status(201).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateWater = async (req, res) => {
  const { id } = req.params;

  try {
    if (!Object.keys(req.body).length) {
      throw HttpError(400, "Body must have at least one field");
    }
    const result = await updatesWater(req, id, req.body);
    if (!result) {
      throw HttpError(404);
    }
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteWater = async (req, res) => {
  const { id } = req.params;
  try {
    const removedWater = await removeWater(req, id);
    if (!removedWater) {
      throw HttpError(404);
    }
    res.status(200).json(removedWater);
  } catch (error) {
    handleError(error, res);
  }
};

export const getListMounth = async (req, res) => {
  try {
    const result = await listMounth(req);
    res.status(200).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

const handleError = (error, res) => {
  const status = error.status || 500;
  const message = error.message || "Server error";
  res.status(status).json({ message });
};
