import { GoogleGenerativeAI } from "@google/generative-ai";
import { createObject, updateObject } from "@/lib/functions/dbFunctions";

// Initialize the Gemini API with validation
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error(
    "Missing Gemini API key. Please add GEMINI_API_KEY to your .env.local file"
  );
}
const genAI = new GoogleGenerativeAI(apiKey);

// Set up a model with options for faster processing
const getModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0, // Lower temperature for more focused responses
      topP: 0.95, // Slightly lowers diversity for more targeted responses
      maxOutputTokens: 800, // Limit response length for speed
    },
  });
};

export async function POST(request) {
  try {
    // Validate API key is available
    if (!apiKey) {
      return Response.json(
        {
          success: false,
          message: "Server configuration error: Missing API key",
        },
        { status: 500 }
      );
    }

    // Parse the request body once
    const requestData = await request.json();
    const { inputData, userId } = requestData;

    if (!inputData) {
      return Response.json(
        { success: false, message: "No input data provided" },
        { status: 400 }
      );
    }

    // More concise and focused prompt for faster extraction
    const promptText = `
    Extract these fields from the text and respond ONLY with a valid JSON object:
    
    birthDate: YYYY-MM-DD format or empty string
    dateOfDeath: YYYY-MM-DD format or empty string
    facebook_link: URL or empty string
    instagram_link: URL or empty string
    whatsapp_link: URL or empty string
    name: Full name of the soldier
    rank: Military rank in Hebrew or empty
    lifeStory: Full story from the text
    warFellIn: War name in Hebrew or empty
    
    Format dates as YYYY-MM-DD and return a valid JSON object with empty strings for missing fields.
    DO NOT include explanations - respond ONLY with JSON.
    
    Text: ${inputData}
    `;

    // Create a timeout promise to limit response time
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI request timed out")), 15000)
    );

    // Access the model and generate content with timeout
    let soldierData;
    try {
      const model = getModel();

      // Race the AI request against the timeout
      const result = await Promise.race([
        model.generateContent(promptText),
        timeoutPromise,
      ]);

      const response = result.response;
      const text = response.text();

      // Extract JSON from the response
      try {
        // Attempt to extract JSON if it's wrapped in code blocks
        const jsonMatch = text.match(/```(?:json)?([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
          soldierData = JSON.parse(jsonMatch[1].trim());
        } else {
          // If no code blocks, try parsing the entire response
          soldierData = JSON.parse(text);
        }
      } catch (parseError) {
        console.error("Failed to parse JSON from Gemini response:", parseError);
        throw new Error("Failed to parse AI response");
      }
    } catch (aiError) {
      console.error("Gemini API error:", aiError);
      return Response.json(
        {
          success: false,
          message:
            aiError.message === "AI request timed out"
              ? "AI processing timed out. Please try with shorter text."
              : "Error processing with AI. Please check your data and try again.",
        },
        { status: 500 }
      );
    }

    // Ensure all required fields are present with default values
    const completeData = {
      birthDate: soldierData.birthDate || "",
      createdAt: new Date().toISOString(),
      createdBy: userId || "",
      dateOfDeath: soldierData.dateOfDeath || "",
      facebook_link: soldierData.facebook_link || "",
      id: "",
      images: [],
      instagram_link: soldierData.instagram_link || "",
      lifeStory: soldierData.lifeStory || inputData, // Fallback to original input if extraction failed
      name: soldierData.name || "",
      rank: soldierData.rank || "",
      tombLocation: "",
      updatedAt: new Date().toISOString(),
      updatedBy: userId || "",
      warFellIn: soldierData.warFellIn || "",
      whatsapp_link: soldierData.whatsapp_link || "",
    };

    // Create the soldier document in the database
    try {
      const docInfo = await createObject("soldiers", completeData);
      const soldierDocId = docInfo.id;

      // Update the soldier document to include its ID in the id field
      const updatedData = {
        ...completeData,
        id: soldierDocId,
      };

      // Use updateObject to update the document with its own ID
      await updateObject("soldiers", soldierDocId, { id: soldierDocId });

      return Response.json({
        success: true,
        message: "Soldier data extracted and saved successfully",
        soldierId: soldierDocId,
      });
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return Response.json(
        { success: false, message: "Failed to save to database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in extract-soldier API route:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
