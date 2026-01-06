/**
 * AI Brain for ShopGenie 🧞‍♂️ (FREE MODE - NO KEYS REQUIRED)
 * 
 * Provider: Pollinations.ai (OpenAI/Generic Wrapper)
 * - completely free
 * - no API Key required
 * - no CORS issues
 * - works directly in browser
 */

// --- 1. LOCAL SEARCH (Context Retrieval) ---

const stopWords = ['de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'tu', 'mi', 'mis', 'mis', 'yo', 'me'];

const tokenize = (text) => {
    if (!text) return [];
    return text.toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~?¿!¡()]/g, "")
        .split(/\s+/)
        .filter(word => !stopWords.includes(word) && word.length > 2);
};

const getEffectivePrice = (product) => {
    if ((product.tiene_descuento === 1 || product.tiene_descuento === true) && product.precio_final) {
        return parseFloat(product.precio_final);
    }
    return parseFloat(product.precio_base || product.precio);
};

const scoreProduct = (product, userTokens) => {
    let score = 0;
    const name = product.nombre || "";
    const description = product.descripcion || "";
    const category = product.categoria || "";
    const productText = (name + " " + description + " " + category).toLowerCase();
    const price = getEffectivePrice(product);

    if (isNaN(price) || price === 0) return -999;

    userTokens.forEach(token => {
        // HUGE BOOST for Name match (50pts).
        if (name.toLowerCase().includes(token)) score += 50;

        // Lower weight for description/text (10pts)
        if (productText.includes(token)) score += 10;

        // Boost for career/usage keywords
        if (['32gb', 'rtx', 'i7', 'i9', 'diseño', 'gamer', 'rendering', 'arquitectura', 'medicina', 'programacion', 'oficina', 'estudiante'].includes(token) && productText.includes(token)) {
            score += 15;
        }
    });

    return score;
};

// ... (Pollinations Client remains same)

export const aiBrain = {
    processQuery: async (query, products, services, history = []) => {
        // ... (Intent detection/Support logic remains same)
        const qLower = query.toLowerCase();

        // Keywords for Support/Failure
        const supportKeywords = [
            'ruido', 'lento', 'falla', 'ayuda', 'reparar', 'limpiar', 'suena', 'calienta', 'virus', 'pantalla azul', 'error', 'problema',
            'mantenimiento', 'soporte', 'técnico', 'arreglar', 'no funciona', 'roto', 'lenta',
            'no enciende', 'no prende', 'no carga', 'pantalla negra', 'se traba', 'se congela', 'ayudame', 'urgente',
            'probelma', 'poblema', 'fayo', 'dañado', 'rompio', 'malogro'
        ];
        const isSupport = supportKeywords.some(k => qLower.includes(k));

        let topProducts = [];
        let contextText = "";
        let promptMode = "";

        // --- STEP 2: BRANCHED LOGIC ---

        if (isSupport) {
            // ... (Support logic same as before)
            // Copying support logic for completeness in replacement block
            promptMode = "SUPPORT";
            if (!Array.isArray(services)) services = [];
            const tokens = tokenize(query);
            const relevantServices = services.filter(s => {
                const text = (s.nombre + " " + s.descripcion).toLowerCase();
                return tokens.some(t => text.includes(t));
            });
            const serviceCandidates = relevantServices.length > 0 ? relevantServices : services.slice(0, 5);
            contextText = serviceCandidates.map(s => `SERVICE: ${s.nombre} - ${s.descripcion}`).join('\n');
            if (!contextText) contextText = "No specific services found. Suggest general technical maintenance.";

        } else {
            // === MODE B: SALES / PRODUCTS ===
            promptMode = "SALES";

            if (!Array.isArray(products)) products = [];

            // A. DEDUPLICATE products by Name
            const uniqueProducts = [];
            const seenNames = new Set();
            products.forEach(p => {
                if (!seenNames.has(p.nombre)) {
                    seenNames.add(p.nombre);
                    uniqueProducts.push(p);
                }
            });

            const tokens = tokenize(query);
            let candidates = uniqueProducts.map(p => ({
                product: p,
                score: scoreProduct(p, tokens)
            })).filter(c => c.score > 0).sort((a, b) => b.score - a.score);

            // THRESHOLD FILTER: If the best match is weak (score < 40), it likely only matched a description word.
            // A strong name match gives 50+. A description match gives 10-25.
            // If the user searches "Disco", and we have NO disks, best match might be Laptop (10pts). 
            // We want to filter that out.
            const STRICT_THRESHOLD = 40;

            // Only apply threshold if query is specific (short). If query is long ("laptop for gaming"), score spread might differ.
            // For simple component searches ("disco", "ram", "mouse"), we want strict matches.
            if (tokens.length < 3) {
                candidates = candidates.filter(c => c.score >= STRICT_THRESHOLD);
            }

            // B. SELECTION STRATEGY
            topProducts = candidates.slice(0, 3).map(c => c.product);

            // BACKFILL (Only if we have at least 1 valid match in the category)
            if (topProducts.length > 0 && topProducts.length < 3) {
                const primaryCategory = topProducts[0].categoria;
                if (primaryCategory) {
                    const saneFillers = uniqueProducts
                        .filter(p => !topProducts.includes(p)
                            && p.categoria === primaryCategory
                            && getEffectivePrice(p) > 0)
                        .slice(0, 2);
                    topProducts = [...topProducts, ...saneFillers];
                }
            }

            // NO MATCH FOUND?
            if (topProducts.length === 0) {
                contextText = "NO MATCHING PRODUCTS FOUND IN INVENTORY.";
            } else {
                contextText = topProducts.map((p, index) => {
                    const name = p.nombre || "Producto";
                    const price = getEffectivePrice(p).toFixed(2);
                    let specs = "";
                    try {
                        if (p.especificaciones) {
                            const parsed = typeof p.especificaciones === 'string' ? JSON.parse(p.especificaciones) : p.especificaciones;
                            specs = Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join('; ');
                        }
                    } catch (e) { specs = "Detalles no disponibles"; }

                    const desc = (p.descripcion || "").substring(0, 200);
                    return `[OPTION_${index + 1}] ID: ${p.id} | NAME: ${name} | PRICE: $${price} | SPECS: ${specs || desc}`;
                }).join('\n\n');
            }
        }

        // --- STEP 3: PROMPT CONSTRUCTION ---

        let systemInstruction = "";
        const recentHistory = history.slice(-2).map(m => `${m.isBot ? 'Bot' : 'User'}: ${m.text}`).join('\n');

        if (promptMode === "SUPPORT") {
            systemInstruction = `
                Role: ShopGenie Technical Support.
                Language: Spanish.
                User Problem: "${query}"
                Available Services:
                ${contextText}
                
                Instructions:
                1. Acknowledge the problem with empathy.
                2. Recommend a Mantenimiento or Reparación service from Context.
                3. DO NOT sell products.
                4. Be helpful.
            `.trim();
        } else {
            // SALES PROMPT

            if (contextText.includes("NO MATCHING PRODUCTS")) {
                systemInstruction = `
                    Role: ShopGenie Assistant.
                    Language: Spanish.
                    STATUS: Out of Stock.
                    Query: "${query}"
                    
                    Instructions:
                    1. Apologize politely.
                    2. State clearly that we do not have "${query}" in stock right now.
                    3. Do NOT recommend random products.
                    4. Keep it successful (~30 words).
                 `.trim();
            } else {
                systemInstruction = `
                    Role: Senior Tech Consultant at ShopGenie.
                    Language: Spanish.
                    
                    INVENTORY OPTIONS (You MUST pick 2 DIFFERENT ones if available):
                    ${contextText}
                    
                    USER QUER: "${query}"
                    
                    INSTRUCTIONS:
                    1. **Analysis**: Start directly by confirming you understand their needs.
                    2. **Recommendation**: Present the best options naturally.
                       - "The [Product 1] is excellent because [Reason]..."
                       - "Alternatively, the [Product 2] offers [Benefit]..."
                    3. **Conclusion**: End with a clear recommendation based on their priorities.
    
                    RULES:
                    - Do NOT use headers like "Introduction", "Comparison", or "Verdict".
                    - Write in a natural, conversational tone.
                    - Do NOT use "X" or "Y" variables. Use real words.
                    - IGNORE prices if they are 0.00.
                    - Length: ~200 words.
                `.trim();
            }
        }

        // --- STEP 4: EXECUTE ---
        let responseText = await callPollinationsAI(systemInstruction);

        if (!responseText) responseText = "⚠️ Error de conexión con el Asesor Virtual.";

        // FIX: Ensure frontend receives a valid 'precio' field for the card display
        const productsWithPrice = (promptMode === "SUPPORT" ? [] : topProducts).map(p => ({
            ...p,
            precio: getEffectivePrice(p)
        }));

        return {
            id: Date.now(),
            text: responseText,
            isBot: true,
            products: productsWithPrice
        };
    }
};
