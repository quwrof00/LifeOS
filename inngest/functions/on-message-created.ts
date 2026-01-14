import { inngest } from '@/inngest/client';
import prisma from '@/lib/prisma';
import { embedText } from '@/lib/cohere';
import { pineconeIndex as index } from '@/lib/pinecone';
import { Category, Mood } from '@prisma/client';

type Classification = {
  category?: string;
  mood?: string;
  summary?: string;
};

export const enrichMessage = inngest.createFunction(
  { id: 'enrich-message' },
  { event: 'message/created' },
  async ({ event }) => {
    const { messageId, content, userId } = event.data;

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/devstral-2512:free',
        messages: [
          {
            role: 'system',
            content: `You're an assistant that classifies messages.
            Return a JSON object with keys:
            - category: one of STUDY (any study notes), IDEA, RANT, TASK (to-do stuff), LOG (like a journal), MEDIA (anything media-related even rants), QUOTE, OTHER
            - mood: NEUTRAL, HAPPY, SAD, ANGRY, TIRED, ANXIOUS, EXCITED, BORED, REFLECTIVE
            - summary: a vivid one-sentence summary of the message.
            If unsure, default to:
            category: OTHER
            mood: NEUTRAL
            summary: ""`,
          },
          { role: 'user', content },
        ],
        temperature: 0.3,
        max_tokens: 256,
        response_format: { type: "json_object" }
      }),
    });

    const json = await aiRes.json();
    console.log(json);


    if (!aiRes.ok || !json.choices?.[0]?.message?.content) {
      throw new Error('AI classification failed');
    }

    let parsed: Classification = {};
    try {
      const raw = json.choices[0].message.content || '{}';
      console.log(raw);

      const cleaned = raw.trim().replace(/^```json|```$/g, '').trim();
      parsed = JSON.parse(cleaned);
      console.log(parsed);

    } catch {
      throw new Error('Invalid AI response format');
    }

    const category = parsed.category?.trim().toUpperCase() || 'OTHER';
    const mood = parsed.mood?.toUpperCase() || 'NEUTRAL';
    const summary = parsed.summary || '';

    await prisma.message.update({
      where: { id: messageId },
      data: {
        type: category as Category,
        mood: mood as Mood,
        summary,
      },
    });

    if (category === 'STUDY') {
      const embedding = await embedText([content]);

      await index.namespace(`${userId}_${messageId}`).upsert([
        {
          id: messageId,
          values: embedding[0],
          metadata: {
            content,
            userId,
          },
        },
      ]);
    }
    else if (category === 'MEDIA') {
      let boldness = null;
      let explanation = null;
      let confidence = null;

      try {
        const hotRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct:free',
            temperature: 0.3,
            max_tokens: 256,
            messages: [
              {
                role: 'system',
                content: `You are a media analyst.
Return ONLY valid JSON with keys:
  boldness (wrt public op) - "Cold Take", "Mild Take", "Hot Take", or "Nuclear Take"
  explanation  - one short sentence
  confidence (of the response) - integer 0–100

Example:
{"boldness":"Hot Take","explanation":"The opinion sharply disagrees with mainstream consensus.","confidence":88}`,
              },
              { role: 'user', content },
            ],
          }),
        });

        if (hotRes.ok) {
          const hotJson = await hotRes.json();
          const raw = hotJson.choices?.[0]?.message?.content?.trim();
          if (raw) {
            const clean = raw.replace(/```json|```/g, '').trim();
            const hotTake = JSON.parse(clean);
            boldness = hotTake.boldness;
            explanation = hotTake.explanation;
            confidence = hotTake.confidence;
          }
        } else {
          console.error('Hot take API failed:', await hotRes.text());
        }
      } catch (e) {
        console.error('Hot take analysis failed:', e);
      }

      await prisma.media.upsert({
        where: { messageId },
        create: {
          messageId,
          boldness: boldness || null,
          boldnessExplanation: explanation || null,
          boldnessConfidence: confidence || null,
        },
        update: {
          boldness: boldness || null,
          boldnessExplanation: explanation || null,
          boldnessConfidence: confidence || null,
        },
      });
    }

    return { enriched: true };
  }
);
