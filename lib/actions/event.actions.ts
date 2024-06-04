"use server"

import { CreateEventParams, DeleteEventParams, GetAllEventsParams, UpdateEventParams, GetEventsByUserParams, GetRelatedEventsByCategoryParams } from "@/types"
import { handleError } from "../utils"
import { connectToDB } from "../database"
import User from "../database/models/user.model"
import Event from "../database/models/event.model"
import Category from "../database/models/category.model"
import { revalidatePath } from "next/cache"

const populateEvent: any = async (query: any) => {
   return query
   .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
   .populate({ path: 'category', model: Category, select: '_id name'})
}

const getCategoryByName = async (name: string) => {
   return Category.findOne({ name: { $regex: name, $options: 'i' } })
 }

export const createEvent = async ({ event, userId, path }: CreateEventParams) => {
 try {
    await connectToDB();

    const organizer = await User.findById(userId);

    if(!organizer) {
        throw new Error("Organizer not found")
    }

    const newEvent = await Event.create({ ...event, category: event.categoryId, organizer: userId})

    return JSON.parse(JSON.stringify(newEvent));
 } catch (error) {
    handleError(error)
 }
}

export const getEventById = async (eventId: string) => {
   try {
      await connectToDB();

      const event = await populateEvent(Event.findById(eventId));

      if(!event) {
         throw new Error("Event not found");
      }

      return JSON.parse(JSON.stringify(event));

   } catch (error) {
      handleError(error);
   }
}


export const getAllEvents= async ({query, limit = 6, page, category}: GetAllEventsParams) => {
   try {
      await connectToDB();

      const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {}
      const categoryCondition = category ? await getCategoryByName(category) : null
      const conditions = {
         $and: [titleCondition, categoryCondition ? { category: categoryCondition._id } : {}],
      }

    const skipAmount = (Number(page) - 1) * limit

      const eventsQuery = Event.find(conditions)
         .sort({ createAt: 'desc' })
         .skip(0)
         .limit(limit)

      const events = await populateEvent(eventsQuery);
      const eventsCount = await Event.countDocuments(conditions)

      return {
         data: JSON.parse(JSON.stringify(events)),
         totalPages: Math.ceil(eventsCount / limit)
      }
   } catch (error) {
      handleError(error);
   }
}

export const deleteEvent = async ({eventId, path} : DeleteEventParams) => {
   try {
      await connectToDB();

      const deletedEvent = await Event.findByIdAndDelete(eventId);

      if(deletedEvent) revalidatePath(path)

   } catch (error) {
      handleError(error);
   }
}

export async function updateEvent({ userId, event, path }: UpdateEventParams) {
   try {
     await connectToDB()
 
     const eventToUpdate = await Event.findById(event._id)
     if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== userId) {
       throw new Error('Unauthorized or event not found')
     }
 
     const updatedEvent = await Event.findByIdAndUpdate(
       event._id,
       { ...event, category: event.categoryId },
       { new: true }
     )
     revalidatePath(path)
 
     return JSON.parse(JSON.stringify(updatedEvent))
   } catch (error) {
     handleError(error)
   }
 }

 export async function getEventsByUser({ userId, limit = 6, page }: GetEventsByUserParams) {
   try {
     await connectToDB()
 
     const conditions = { organizer: userId }
     const skipAmount = (page - 1) * limit
 
     const eventsQuery = Event.find(conditions)
       .sort({ createdAt: 'desc' })
       .skip(skipAmount)
       .limit(limit)
 
     const events = await populateEvent(eventsQuery)
     const eventsCount = await Event.countDocuments(conditions)
 
     return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
   } catch (error) {
     handleError(error)
   }
 }

 export async function getRelatedEventsByCategory({
   categoryId,
   eventId,
   limit = 3,
   page = 1,
 }: GetRelatedEventsByCategoryParams) {
   try {
     await connectToDB()
 
     const skipAmount = (Number(page) - 1) * limit
     const conditions = { $and: [{ category: categoryId }, { _id: { $ne: eventId } }] }
 
     const eventsQuery = Event.find(conditions)
       .sort({ createdAt: 'desc' })
       .skip(skipAmount)
       .limit(limit)
 
     const events = await populateEvent(eventsQuery)
     const eventsCount = await Event.countDocuments(conditions)
 
     return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
   } catch (error) {
     handleError(error)
   }
 }