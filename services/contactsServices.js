import { Contact } from "../models/contactModel.js";

export async function listContacts(req) {
  const { _id: owner } = req.user;
  const { favorite } = req.query;
  const ownerFilter = { owner };
  if (favorite !== undefined) {
    ownerFilter.favorite = favorite === "true";
  }
  const { page = 1, limit = 25 } = req.query;
  const skip = (page - 1) * limit;
  const data = await Contact.find(ownerFilter)
    .skip(skip)
    .limit(limit)
    .populate("owner", "email");
  return data;
}

export async function getContactById(req, contactId) {
  const { _id: owner } = req.user;
  const foundContact = await Contact.findOne({ _id: contactId, owner });
  return foundContact || null;
}

export async function removeContact(req, contactId) {
  const { _id: owner } = req.user;
  const removedContact = await Contact.findOneAndDelete({
    _id: contactId,
    owner,
  });
  if (!removedContact) {
    return null;
  }
  return removedContact;
}


export async function addContact(contact) {
  const newContact = await Contact.create(contact);
  return newContact;
}

export async function updatesContact(req, id, body) {
  const { _id: owner } = req.user;
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: id, owner },
    body,
    { new: true }
  );
  return updatedContact;
}
export async function updateStatusContact(req, contactId, body) {
  const { favorite } = body;
  const { _id: owner } = req.user;
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactId, owner },
    { favorite },
    { new: true }
  );
  return updatedContact;
}
