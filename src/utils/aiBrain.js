/**
 * AI Brain for ShopGenie 🧞‍♂️ (Dynamic Data-Driven Mode)
 * 
 * Logic:
 * 1. Analyze User Input -> Extract Tokens.
 * 2. Search & Score Products based on input tokens + product data.
 * 3. Generate Response dynamically using ONLY the found product data.
 *    (No hardcoded "prescribed" paragraphs).
 */

// --- 1. UTILS ---

const stopWords = ['de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'tu', 'mi', 'mis', 'mis', 'yo', 'me', 'necesito', 'quiero', 'busco', 'tienes', 'hay'];

const tokenize = (text) => {
    return text.toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~?¿!¡()]/g, "")
        .split(/\s+/)
        .filter(word => !stopWords.includes(word) && word.length > 2);
};

// --- 2. DYNAMIC SPECS PARSER ---
// Extracts real specs from the product description on the fly
const extractProductSpecs = (product) => {
    const text = (product.nombre + " " + product.descripcion).toLowerCase();
    const specs = [];

    // RAM
    const ram = text.match(/(\d+)\s?gb\s?ram/) || text.match(/ram\s?(\d+)\s?gb/);
    if (ram) specs.push(`Memoria RAM de ${ram[1]}GB`);

    // Storage
    const storage = text.match(/(\d+)\s?(gb|tb)\s?ssd/) || text.match(/(\d+)\s?(gb|tb)\s?disco/);
    if (storage) specs.push(`Almacenamiento de ${storage[0].toUpperCase()}`);

    // Processor (Generic extraction)
    const cpu = text.match(/(intel|ryzen|amd|core)\s?[\w-]+(\s\w+)?/);
    if (cpu) specs.push(`Procesador ${cpu[0].toUpperCase()}`);

    // GPU
    if (text.match(/rtx|gtx|radeon|rx|nvidia/)) specs.push("Tarjeta Gráfica Dedicada");

    // Screen
    const screen = text.match(/(\d{2,}\.?\d*)\s?ulgadas/) || text.match(/(\d{2,}\.?\d*)\s?"/);
    if (screen) specs.push(`Pantalla de ${screen[1]}"`);

    return specs;
};

// --- 3. SCORING ENGINE ---
// Scores products based on how many user tokens match the product text
const scoreProduct = (product, userTokens) => {
    let score = 0;
    const productText = (product.nombre + " " + product.descripcion + " " + product.categoria).toLowerCase();

    userTokens.forEach(token => {
        if (product.nombre.toLowerCase().includes(token)) score += 20; // High priority for name match
        else if (productText.includes(token)) score += 5; // Medium for description
    });

    return score;
};

// --- 4. DYNAMIC RESPONSE BUILDER ---
// Builds a sentence based solely on the data found
const buildDynamicResponse = (product, userQuery) => {
    const specs = extractProductSpecs(product);
    const price = parseFloat(product.precio_final || product.precio).toFixed(2);

    // Intro
    let response = `Para lo que buscas ("${userQuery}"), encontré el **${product.nombre}**.`;

    // Body: List specs dynamically if found
    if (specs.length > 0) {
        response += `\n\nDestaca por tener:\n` + specs.map(s => `* ${s}`).join('\n');
    } else {
        response += `\n\nEs un equipo con excelentes características para su gama.`;
    }

    // Conclusion based on specs (Logic, not hardcoded text)
    response += `\n\n Precio: **$${price}**.`;

    return response;
};

// --- PUBLIC API ---

export const aiBrain = {
    processQuery: (query, products, services) => {
        const tokens = tokenize(query);

        // 1. Check for Technical/Service keywords first (Dynamic check)
        // If user asks for "repair", "fail", "slow", check services
        const isTechnical = tokens.some(t => ['reparacion', 'tecnico', 'lento', 'falla', 'pantalla', 'virus', 'mantenimiento', 'servicios'].includes(t));

        if (isTechnical) {
            const relevantServices = services.filter(s =>
                tokens.some(t => s.nombre.toLowerCase().includes(t) || s.descripcion?.toLowerCase().includes(t))
            );

            if (relevantServices.length > 0) {
                return {
                    id: Date.now(),
                    text: `He encontrado estos servicios que podrían ayudarte con tu problema de "${query}":`,
                    isBot: true,
                    products: relevantServices.map(s => ({ ...s, categoria: 'Servicio' }))
                };
            }
        }

        // 2. Product Search
        // Score all products
        let candidates = products.map(p => ({
            product: p,
            score: scoreProduct(p, tokens)
        }));

        // Filter and Sort
        candidates = candidates
            .filter(c => c.score > 0) // Only matches
            .sort((a, b) => b.score - a.score);

        const bestMatch = candidates[0];

        if (bestMatch) {
            return {
                id: Date.now(),
                text: buildDynamicResponse(bestMatch.product, query),
                isBot: true,
                products: candidates.slice(0, 3).map(c => c.product)
            };
        }

        // 3. Fallback (No matches found)
        return {
            id: Date.now(),
            text: `No encontré productos específicos para "${query}" en nuestro catálogo actual, pero aquí tienes algunas sugerencias populares:`,
            isBot: true,
            products: products.slice(0, 3) // Show generic suggestions if nothing matches
        };
    }
};
