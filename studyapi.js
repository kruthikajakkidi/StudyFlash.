import express from "express";
import OpenAI from "openai";
import { StudyModel } from '../models/StudyModel.js'; 

export const studyApp = express.Router();

//Groq client setup
const getClient = () => {
    return new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1"
    });
};

//Generate study plan
studyApp.post("/plans", async (req, res) => {
    try {
        //get req data
        const { topic, format, level } = req.body;
        const client = getClient();
        //prompt for AI
        const prompt = `Create a study plan for ${topic}. Format: ${format}. Level: ${level}.`;
        //call AI
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }]
        });
        //get AI response
        const generatedPlan = completion.choices[0].message.content;
        
        //save to db
        const newPlan = new StudyModel({
            topic,
            format,
            level,
            generatedPlan
        });

        await newPlan.save();
        console.log("Plan saved to MongoDB");
         //send response
        res.json({ message: "AI study plan generated and saved!", plan: generatedPlan});

    } catch (err) {
        //error handling
        console.error("Error:", err.message);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});