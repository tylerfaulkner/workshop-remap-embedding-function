import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import OpenAI from 'openai';

export async function embeddingSkill(req: HttpRequest, context: InvocationContext): Promise<any> {
    context.log('Processing request for OpenAI Embeddings');
    const authorizationHeader = req.headers['authorization'];
    const openAiApiKey = authorizationHeader.replace('Bearer ', ''); 

    const values = req.body.values;
    const responses = [];


    const openai = new OpenAI({
        apiKey: openAiApiKey
    });

    for await (const value of values()) {
        const { recordId, data } = value;
        const { text, language, phraseList } = data;

        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-v1',
            input: text,
        });

        const embedding = embeddingResponse.data

        responses.push({
            recordId,
            data: { embedding },
            errors: null,
            warnings: null
        });
    }

    return { values: responses };
};

app.http('embeddingSkill', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: embeddingSkill
});
