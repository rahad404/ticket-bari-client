import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins"
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("ticketbari");

export const auth = betterAuth({
   database: mongodbAdapter(db, {
      client
   }),

   // Configure the user model with additional fields
   user: {
      additionalFields: {
         // role field
         role: {
            type: "string",
            input: true,
            required: false,
            defaultValue: "user", 
         },
         // isFraud field
         isFraud: {
            type: "boolean",
            required: false,
            defaultValue: false, // Automatically saves as false for every new registration
         },
      }
   },

   emailAndPassword: {
      enabled: true,
      autoSignIn: false,
   },
   socialProviders: {
      google: {
         clientId: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
   },


   // jwt implement
   session: {
      cookieCache: {
         enabled: true,
         // strategy: "jwt",
         maxAge: 7 * 24 * 60 * 60
      }
   },
   plugins: [
      jwt()
   ]
});
