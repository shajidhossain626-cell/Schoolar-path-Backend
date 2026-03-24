const Anthropic = require('@anthropic-ai/sdk')
const { success, error } = require('../utils/response')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are ScholarPath BD's AI Scholarship Advisor — an expert helping Bangladeshi students find and win international scholarships.

Available scholarships in our database:
- DAAD (Germany): Fully funded, €934/month, Master's/PhD, deadline March 31, 2025
- Chevening (UK): Fully funded, £1,393/month, Master's, deadline November 5, 2025
- MEXT (Japan): Fully funded, ¥143,000/month, All levels, deadline May 26, 2025
- Fulbright (USA): Fully funded, Master's/PhD, deadline February 15, 2026
- GKS/KGSP (South Korea): Fully funded, ₩900,000/month, Master's/PhD, deadline April 30, 2025
- CSC (China): Fully funded, ¥3,000/month, All levels, deadline March 15, 2025
- Vanier (Canada): Fully funded, CAD $50,000/year, PhD only, deadline November 1, 2025
- Australia Awards: Fully funded, AUD $26,000/year, Bachelor's/Master's, deadline April 30, 2025
- Heinrich Böll (Germany): Partial, €850/month, Master's/PhD
- Commonwealth (UK): Fully funded, Master's, deadline December 20, 2025

Our services: Basic (৳2,500) · Standard (৳5,000) · Premium (৳8,000)

Guidelines:
- Be warm, encouraging, and specific
- Give actionable step-by-step advice
- Reference specific scholarships when relevant
- Keep responses concise (150-300 words)
- Use bullet points for lists
- Mention ScholarPath services when helpful`

// POST /api/ai/ask
const ask = async (req, res) => {
  const { question, history = [], context = '' } = req.body

  if (!question?.trim()) return error(res, 'Question is required.', 400)

  try {
    // Build messages from history
    const messages = [
      ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: context ? `${context}\n\nQuestion: ${question}` : question },
    ]

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 600,
      system:     SYSTEM_PROMPT,
      messages,
    })

    const answer = response.content[0]?.text || 'I could not generate a response. Please try again.'
    return success(res, { answer, tokens: response.usage })

  } catch (e) {
    console.error('AI error:', e.message)
    // Return intelligent fallback
    return success(res, { answer: getFallback(question), fallback: true })
  }
}

// Smart local fallback
function getFallback(q) {
  const lower = q.toLowerCase()
  if (lower.includes('daad') || lower.includes('germany'))
    return '**DAAD Scholarship** — Germany\'s most prestigious award:\n\n• **Amount:** €934/month + full tuition + travel\n• **Deadline:** March 31, 2025\n• **Requirements:** CGPA ≥ 3.0, IELTS 6.5, 2 years work experience\n• **Key tip:** Contact a German professor BEFORE applying.\n\nNeed help? Our Standard Package (৳5,000) includes SOP writing by DAAD alumni.'
  if (lower.includes('chevening') || lower.includes('uk'))
    return '**Chevening Scholarship** — UK government\'s flagship award:\n\n• **Amount:** Full tuition + £1,393/month + flights\n• **Deadline:** November 5, 2025\n• **Key:** Chevening selects for LEADERSHIP, not just academics\n• **Tip:** Apply to 3 UK universities simultaneously.'
  if (lower.includes('ielts'))
    return '**IELTS Requirements:**\n\n• DAAD Germany: 6.5\n• Chevening UK: 6.5 (no band < 5.5)\n• Fulbright USA: 7.0\n• Australia Awards: 6.5\n• GKS Korea: 5.5–6.0\n\nNeed IELTS prep help? Ask about our counseling packages.'
  if (lower.includes('document') || lower.includes('sop'))
    return '**Essential Documents:**\n\n• ✅ Certified academic transcripts\n• ✅ Statement of Purpose (2 pages max)\n• ✅ CV (Europass for European scholarships)\n• ✅ 2–3 Recommendation Letters\n• ✅ IELTS/TOEFL certificate\n• ✅ Passport copy\n\n**SOP Tip:** Be specific about research goals and your return plan for Bangladesh.'
  return 'I can help you with:\n\n• Finding the right scholarship for your profile\n• SOP and motivation letter writing tips\n• Document checklists for specific scholarships\n• IELTS score requirements\n• Country-specific application guides\n\nWhat would you like to know about?'
}

module.exports = { ask }
