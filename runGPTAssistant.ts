import { sleep } from "bun";
import OpenAI from "openai";
import { toFile } from 'openai/uploads';

export const runGPTAssistant = async (msg: string, user?: string, image?: Buffer, imageFileName?: string): Promise<string | Buffer> => {
	const openai = new OpenAI({
		apiKey: process.env.CHATGPT_API_KEY,
	});

	if (!openai.apiKey) {
        throw new Error("Chat GPT API key not provided.");
	}

	const assistantId = process.env.CHATGPT_ASSISTANT_ID;

	if (!assistantId) {
		throw new Error("Assistant ID not provided.");
	}

	const upload = image ? await openai.files.create({
		file: await toFile(image, imageFileName),
		purpose: "assistants",
	  }) : null;

	const thread = await openai.beta.threads.create({
		messages: [
			{
				role: "user",
				content: msg,
				attachments: upload ? [{ file_id: upload.id, tools: [{ type: "file_search" }] }] : null,
			},
		],
	});

	const run = await openai.beta.threads.runs.create(thread.id, {
		assistant_id: assistantId,
		additional_instructions: user ? `Please address the user as ${user}.` : null,
	});

	let result: OpenAI.Beta.Threads.Runs.Run = null;
	let interval = 0;
	do {
		result = await openai.beta.threads.runs.retrieve(thread.id, run.id);
		console.log("Waiting for completion. Current status: " + result.status);
		interval++;
		await sleep(5000);
	} while (result.status !== "completed" && interval <= 10);

	if (result.status !== "completed") {
		await openai.beta.threads.runs.cancel(thread.id, run.id);
		throw new Error("Request timed out.");
	}

	const messages = await openai.beta.threads.messages.list(thread.id, {
		order: "desc",
	});
	const content = messages.data[0].content[0];
	let response: {content: string; type: string};
	if(content.type === "text") {
		response = { content: content.text.value, type: "text" };
	}
	else if(content.type === "image_file") {
		response = { content: content.image_file.file_id, type: "image" };
	}
	else {
		response = { content: content.image_url.url, type: "text" }
	}

	if (response.type === "text") {
		return response.content;
	}
    if(response.type === "image") {
        const file = await openai.files.content(response.content);
        const img = Buffer.from(await file.arrayBuffer());
        return img;
    }
}