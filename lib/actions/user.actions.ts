"use server";

import { CreateUserParams, UpdateUserParams } from "@/types";
import { handleError } from "../utils";
import { connectToDB } from "../database";
import User from "../database/models/user.model";
import Event from "../database/models/event.model";
import Order from "../database/models/order.model";
import { revalidatePath } from "next/cache";

export const createUser = async (user: CreateUserParams) => {
  try {
    await connectToDB();
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
};

export async function getUserById(userId: string) {
  try {
    await connectToDB();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

export const deleteUser = async (clerkId: string) => {
  try {
    await connectToDB();

    //find user to delete
    const userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) {
      throw new Error("User not found");
    }

    //unlink relationships
    await Promise.all([
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } }
      ),

      Order.updateMany(
        { _id: { $in: userToDelete.orders } },
        {
          $unset: { buyer: 1 },
        }
      ),
    ]);

    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
};

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDB();
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) {
      throw new Error("User update failed");
    }
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}
