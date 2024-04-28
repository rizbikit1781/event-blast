import { Schema } from "mongoose"
import { unique } from "next/dist/build/utils"


const userSchema = new Schema({
    clerkId: { type : String, required: true, unique: true},
    email: { type: String, required: true, unique: true}
})