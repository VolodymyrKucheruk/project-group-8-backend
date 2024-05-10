import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateContactFavorite,
} from "../controllers/contactsControllers.js";
import validateBody from "../helpers/validateBody.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../models/contactsSchemas.js";
import isValidId from "../helpers/isValidId.js";
import { authenticate } from "../helpers/authenticate.js";


const contactsRouter = express.Router();

contactsRouter.get("/", authenticate, getAllContacts);
contactsRouter.get("/:id", authenticate, isValidId("id"), getOneContact);
contactsRouter.delete("/:id",authenticate, isValidId("id"), deleteContact);
contactsRouter.post("/",authenticate, validateBody(createContactSchema), createContact);
contactsRouter.put(
  "/:id",
  authenticate,
  isValidId("id"),
  validateBody(updateContactSchema),
  updateContact
);
contactsRouter.patch(
  "/:id/favorite",
  authenticate,
  isValidId("id"),
  validateBody(updateContactSchema),
  updateContactFavorite
);

export default contactsRouter;
