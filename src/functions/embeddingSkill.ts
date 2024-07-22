import { app, Exception, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import OpenAI from 'openai';

export async function embeddingSkill(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const responses = [];
    try {
        context.log('Processing request for OpenAI Embeddings');
        const authorizationHeader = req.headers.get('authorization');

        const openAiApiKey = authorizationHeader.replace('Bearer ', ''); 
        context.log(req.body);
        const body = await req.json() as any;

        const values = body.values;
        context.log("Encoding " + values.length + " values");
        const openai = new OpenAI({
            apiKey: openAiApiKey
        });
        for await (const value of values) {
            const { recordId, data } = value;
            const { text, language, phraseList } = data;

            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: text,
            });

            const embedding = embeddingResponse.data[0].embedding;

            responses.push({
                recordId,
                data: { embedding },
                errors: null,
                warnings: null
            });
        }
    }
    catch (error : any) {
        context.error('Error processing values: ' + error);
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: error
            })
        };
    }

    return {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: responses })
    };
};

app.http('embeddingSkill', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: embeddingSkill
});
