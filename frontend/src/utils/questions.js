import {distance} from 'fastest-levenshtein'
const shuffleQuestions = (videoGames, numberVideoGames) => {
    let currentIndex = videoGames.length;
    let randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [videoGames[currentIndex], videoGames[randomIndex]] = [
            videoGames[randomIndex],
            videoGames[currentIndex],
        ];
    }

    return videoGames.slice(0, numberVideoGames);
};

const createQuestions = (videoGames,questionTypes,timeToAnswer) => {
    return videoGames.map((videoGame) => {
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        return {
            ...videoGame,
            time_to_answer:timeToAnswer,
            question_type:questionType
        }
    })
}


const romanHash = {
    i: 1,
    v: 5,
    x: 10,
    l: 50,
    c: 100,
    d: 500,
    m: 1000,
};
const romanCharacters = Object.keys(romanHash);

function romanToInt(s)
{
    s = s.toLowerCase();

    let accumulator = 0;
    for (let i = 0; i < s.length; i++)
    {
        if (s[i] === "i" && s[i + 1] === "v")
        {
            accumulator += 4;
            i++;
        }
        else if (s[i] === "i" && s[i + 1] === "x")
        {
            accumulator += 9;
            i++;
        }
        else if (s[i] === "x" && s[i + 1] === "l")
        {
            accumulator += 40;
            i++;
        }
        else if (s[i] === "x" && s[i + 1] === "c")
        {
            accumulator += 90;
            i++;
        }
        else if (s[i] === "c" && s[i + 1] === "d")
        {
            accumulator += 400;
            i++;
        }
        else if (s[i] === "c" && s[i + 1] === "m")
        {
            accumulator += 900;
            i++;
        }
        else
        {
            accumulator += romanHash[s[i]];
        }
    }
    return accumulator;
}

function isRomanNumber(str)
{
    return [...str].every(c => romanCharacters.includes(c));
}

function isLetterOrDigit(char)
{
    return char >= 'a' && char <= 'z'
        || char >= 'A' && char <= 'Z'
        || char >= '0' && char <= '9';
}

function normalizePunctuation(str) {
    return str
        .replace(/'/g, "")           // Remove apostrophes: "don't" -> "dont"
        .replace(/-/g, " ")          // Convert hyphens to spaces: "Spider-Man" -> "Spider Man"
        .replace(/&/g, " and ")      // Normalize ampersands: "D&D" -> "D and D"
        .replace(/\./g, "")          // Remove periods: "Dr." -> "Dr"
        .replace(/:/g, " ")          // Convert colons to spaces in some contexts
        .replace(/\s+/g, " ")        // Normalize multiple spaces to single space
        .trim();
}

// Helper function to check if a token contains numbers or roman numerals
function containsNumber(token) {
    const cleanToken = toAsciiCharSet(token.trim()).toLowerCase();
    return !isNaN(cleanToken) || isRomanNumber(cleanToken);
}

// Helper function to convert numbers to roman numerals
function intToRoman(num) {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];

    let result = "";
    for (let i = 0; i < values.length; i++) {
        while (num >= values[i]) {
            result += symbols[i];
            num -= values[i];
        }
    }
    return result;
}

// Helper function to generate roman/regular number variations
function generateNumberVariations(text) {
    const variations = [];
    const words = text.split(' ');

    for (let i = 0; i < words.length; i++) {
        const word = words[i].trim();
        const cleanWord = toAsciiCharSet(word).toLowerCase();

        // If it's a regular number, create roman version
        if (!isNaN(cleanWord) && cleanWord !== "") {
            const num = parseInt(cleanWord, 10);
            if (num > 0 && num <= 50) { // Only convert reasonable numbers
                const romanVersion = intToRoman(num);
                const newWords = [...words];
                newWords[i] = romanVersion;
                variations.push(newWords.join(' '));
            }
        }
        // If it's a roman numeral, create regular number version
        else if (isRomanNumber(cleanWord)) {
            const num = romanToInt(cleanWord);
            const newWords = [...words];
            newWords[i] = num.toString();
            variations.push(newWords.join(' '));
        }
    }

    return variations;
}

// NEW: Add this helper function
function tryFlexibleWordMatching(validParts, inputParts, tolerance) {
    // Check if any part contains numbers - if so, enforce strict matching
    const validHasNumbers = validParts.some(part => containsNumber(part));
    const inputHasNumbers = inputParts.some(part => containsNumber(part));

    // If one side has numbers and the other doesn't, they cannot match
    if (validHasNumbers !== inputHasNumbers) {
        return false;
    }

    // If both sides have numbers, enforce strict matching
    if (validHasNumbers && inputHasNumbers) {
        // For numbered games, we need exact word count and strict number matching
        if (validParts.length !== inputParts.length) {
            return false;
        }

        // All parts must match exactly, including numbers
        return validParts.every((validPart, index) => {
            if (index >= inputParts.length) return false;
            return tokenEqual(validPart, inputParts[index], tolerance);
        });
    }

    // For non-numbered games, use flexible matching
    // Try substring matching - check if input is contained in valid or vice versa
    const validStr = validParts.join(" ").toLowerCase();
    const inputStr = inputParts.join(" ").toLowerCase();

    // Check if input is a significant substring of valid answer
    if (validStr.includes(inputStr) && inputStr.length >= validStr.length * 0.6) {
        return true;
    }

    // Check if valid is a significant substring of input
    if (inputStr.includes(validStr) && validStr.length >= inputStr.length * 0.6) {
        return true;
    }

    // Try partial word matching - see if most words match
    let matchedWords = 0;
    for (const inputPart of inputParts) {
        for (const validPart of validParts) {
            if (tokenEqual(validPart, inputPart, tolerance)) {
                matchedWords++;
                break;
            }
        }
    }

    // Accept if at least 70% of words match
    const matchRatio = matchedWords / Math.max(validParts.length, inputParts.length);
    return matchRatio >= 0.7;
}

function tokenEqual(valid, input, tolerance)
{
    const cleanValid = toAsciiCharSet(valid.trim()).toLowerCase();
    const cleanInput = toAsciiCharSet(input.trim()).toLowerCase();

    //console.log(`Check if token match: "${cleanValid}" =?= "${cleanInput}" (originally "${valid}" and "${input}")`);

    if (isRomanNumber(cleanValid))
    {
        // Roman number as int must match exactly input as int
        return isNaN(input) ? cleanValid == cleanInput : romanToInt(cleanValid) == parseInt(cleanInput, 10);
    }
    if (!isNaN(cleanValid) && !isNaN(cleanInput))
    {
        // Numbers must be exactly equal
        return parseInt(cleanValid, 10) == parseInt(cleanInput, 10);
    }
    else
    {
        const validToCompare = cleanValid.replaceAll(" ", "");
        const inputToCompare = cleanInput.replaceAll(" ", "");
        const allowedErrors = Math.floor(cleanValid.length / tolerance);

        // String tokens should match with 1 mistake every <tolerance> characters
        return distance(validToCompare, inputToCompare) <= allowedErrors;
    }
}

function toAsciiCharSet(str, keepSpaces)
{
    // First normalize punctuation
    str = normalizePunctuation(str);

    // Then apply existing logic
    // normalize decomposes Unicode characters to their components, like é = e + ̀
    // NFKD means we also want to decompose things like œ to o + e
    // filter to only key letters and digits (and spaces if parameter is at true)
    // join characters back into a string
    return [...str.normalize("NFKD")]
        .filter(char => isLetterOrDigit(char) || keepSpaces && char == " ")
        .join("");
}

function doesMatch(valid, input, tolerance)
{
    //console.log(`Checking if propositions matches: ${valid} =?= ${input}`);

    // GLOBAL NUMBER VALIDATION: Check for number conflicts at the top level
    // This ensures ALL matching paths enforce strict number validation
    const validTokens = valid.split(" ").filter(part => part.length > 0);
    const inputTokens = input.split(" ").filter(part => part.length > 0);

    const validHasNumbers = validTokens.some(part => containsNumber(part));
    const inputHasNumbers = inputTokens.some(part => containsNumber(part));

    // If both sides have numbers, check for conflicts before any other matching
    if (validHasNumbers && inputHasNumbers) {
        const validNumbers = validTokens.filter(part => containsNumber(part));
        const inputNumbers = inputTokens.filter(part => containsNumber(part));

        // Check if any numbers conflict
        let hasConflict = false;
        for (const validNum of validNumbers) {
            for (const inputNum of inputNumbers) {
                if (!tokenEqual(validNum, inputNum, tolerance)) {
                    hasConflict = true;
                    break;
                }
            }
            if (hasConflict) break;
        }

        // If there's a number conflict, reject the match immediately
        if (hasConflict) {
            return false;
        }
    }

    if (!valid.includes(" ") && tokenEqual(valid, input, tolerance))
        return true;

    if (valid.includes(":"))
    {
        const splitByColon = valid.split(":");
        for (const part of splitByColon)
        {
            const trimmedPart = part.trim();

            // Pre-check: if both the part and input contain numbers,
            // ensure they don't have conflicting numbers BEFORE calling doesMatch
            const partParts = trimmedPart.split(" ").filter(p => p.length > 0);
            const inputParts = input.split(" ").filter(p => p.length > 0);

            const partHasNumbers = partParts.some(p => containsNumber(p));
            const inputHasNumbers = inputParts.some(p => containsNumber(p));

            // If both have numbers, check for conflicts first
            if (partHasNumbers && inputHasNumbers) {
                // Extract numbers from both sides and compare
                const partNumbers = partParts.filter(p => containsNumber(p));
                const inputNumbers = inputParts.filter(p => containsNumber(p));

                // Check if any numbers conflict
                let hasConflict = false;
                for (const partNum of partNumbers) {
                    for (const inputNum of inputNumbers) {
                        if (!tokenEqual(partNum, inputNum, tolerance)) {
                            hasConflict = true;
                            break;
                        }
                    }
                    if (hasConflict) break;
                }

                // If there's a number conflict, skip this part entirely
                if (hasConflict) {
                    continue;
                }
            }

            // Only call doesMatch if there are no number conflicts
            if (doesMatch(trimmedPart, input, tolerance))
            {
                return true;
            }
        }
    }

    const validParts = valid.split(" ").filter(part => part.length > 0);
    const inputParts = input.split(" ").filter(part => part.length > 0);

    // NEW: Try exact word count match first (existing logic)
    if (inputParts.length == validParts.length)
    {
        const allPartsEquals = validParts.every(
            (validPart, index) => tokenEqual(validPart, inputParts[index], tolerance));
        if (allPartsEquals)
            return true;
    }

    // NEW: Try flexible word count matching
    if (tryFlexibleWordMatching(validParts, inputParts, tolerance)) {
        return true;
    }

    return false;
}

const defaultOptions = {
    /** Means that 1 error is tolerated every five characters. */
    tolerance: 5,
    /** An object mapping abbreviated strings to their full counterpart.  */
    abbreviations: {
        // Common gaming abbreviations
        "Brothers": "Bros",
        "Bros": "Brothers",
        "versus": "vs",
        "vs": "versus",
        "and": "&",
        "&": "and",
        "The Legend of": "Legend of",
        "Legend of": "The Legend of",
        "Super Mario": "Mario",
        "Mario": "Super Mario",
        "Final Fantasy": "FF",
        "FF": "Final Fantasy",
        "Street Fighter": "SF",
        "SF": "Street Fighter",
        "Mortal Kombat": "MK",
        "MK": "Mortal Kombat",
        "Grand Theft Auto": "GTA",
        "GTA": "Grand Theft Auto",
        "Call of Duty": "COD",
        "COD": "Call of Duty",
        "World of Warcraft": "WoW",
        "WoW": "World of Warcraft",
        "Counter-Strike": "CS",
        "CS": "Counter-Strike",
        "Battlefield": "BF",
        "BF": "Battlefield",
        "The Elder Scrolls": "Elder Scrolls",
        "Elder Scrolls": "The Elder Scrolls",
        "Assassin's Creed": "AC",
        "AC": "Assassin's Creed",
        "Metal Gear Solid": "MGS",
        "MGS": "Metal Gear Solid",
        "Resident Evil": "RE",
        "RE": "Resident Evil",
        "Dead or Alive": "DOA",
        "DOA": "Dead or Alive",
        "Kingdom Hearts": "KH",
        "KH": "Kingdom Hearts",
        "Dragon Quest": "DQ",
        "DQ": "Dragon Quest",
        "Tekken": "TK",
        "TK": "Tekken",
        "Pokemon": "Pokémon",
        "Pokémon": "Pokemon",
        // Articles (optional words)
        "The ": "",
        "A ": "",
        "An ": ""
    }
};

const answerListCache = {};

function getOrComputeAnswerList(validAnswer, options)
{
    if (answerListCache[validAnswer] != undefined)
        return answerListCache[validAnswer];

    const answerList = [ validAnswer ];

    // Process abbreviations
    for (const [original, abbreviated] of Object.entries(options.abbreviations))
    {
        // Skip empty abbreviations (articles)
        if (abbreviated === "") continue;

        // Create variations with replacements
        if (validAnswer.includes(original))
        {
            const newAnswer = validAnswer.replace(original, abbreviated);
            if (!answerList.includes(newAnswer))
            {
                answerList.push(newAnswer);

                // For numbered games, also create attached form (e.g., "BF 2" -> "BF2")
                const attachedForm = newAnswer.replace(/\s+/g, "");
                if (attachedForm !== newAnswer && !answerList.includes(attachedForm))
                {
                    answerList.push(attachedForm);
                }

                // Generate roman/regular number variations
                const romanRegularVariations = generateNumberVariations(newAnswer);
                romanRegularVariations.forEach(variation => {
                    if (!answerList.includes(variation)) {
                        answerList.push(variation);

                        // Also create attached form for the variation
                        const attachedVariation = variation.replace(/\s+/g, "");
                        if (attachedVariation !== variation && !answerList.includes(attachedVariation)) {
                            answerList.push(attachedVariation);
                        }
                    }
                });
            }
        }

        // Also try case-insensitive matching
        const originalLower = original.toLowerCase();
        const validAnswerLower = validAnswer.toLowerCase();
        if (validAnswerLower.includes(originalLower))
        {
            // Find the actual case in the original string
            const index = validAnswerLower.indexOf(originalLower);
            const actualCase = validAnswer.substring(index, index + original.length);
            const newAnswer = validAnswer.replace(actualCase, abbreviated);
            if (!answerList.includes(newAnswer))
            {
                answerList.push(newAnswer);

                // For numbered games, also create attached form
                const attachedForm = newAnswer.replace(/\s+/g, "");
                if (attachedForm !== newAnswer && !answerList.includes(attachedForm))
                {
                    answerList.push(attachedForm);
                }
            }
        }
    }

    // Handle numbered abbreviations (like BF2, FF7, etc.)
    for (const [original, abbreviated] of Object.entries(options.abbreviations))
    {
        // Skip empty abbreviations (articles)
        if (abbreviated === "") continue;

        // Check if validAnswer starts with an abbreviation followed by a number/roman numeral
        const abbreviatedLower = abbreviated.toLowerCase();
        const validAnswerLower = validAnswer.toLowerCase();

        // Pattern: abbreviation + space + number/roman (e.g., "bf 2", "ff vii")
        const spacePattern = new RegExp(`^${abbreviatedLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(.+)$`, 'i');
        const spaceMatch = validAnswerLower.match(spacePattern);
        if (spaceMatch) {
            const numberPart = spaceMatch[1];
            const expandedAnswer = original + " " + numberPart;
            if (!answerList.some(answer => answer.toLowerCase() === expandedAnswer.toLowerCase())) {
                answerList.push(expandedAnswer);
            }
        }

        // Pattern: abbreviation + number/roman directly attached (e.g., "bf2", "ffvii")
        const attachedPattern = new RegExp(`^${abbreviatedLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(.+)$`, 'i');
        const attachedMatch = validAnswerLower.match(attachedPattern);
        if (attachedMatch) {
            const numberPart = attachedMatch[1];
            // Only process if the remaining part looks like a number or roman numeral
            if (!isNaN(numberPart) || isRomanNumber(numberPart)) {
                const expandedAnswer = original + " " + numberPart;
                if (!answerList.some(answer => answer.toLowerCase() === expandedAnswer.toLowerCase())) {
                    answerList.push(expandedAnswer);
                }

            }
        }
    }

    // Generate additional variations by removing common articles
    const articlesToRemove = ["The ", "A ", "An "];
    for (const article of articlesToRemove)
    {
        for (const answer of [...answerList])
        {
            if (answer.startsWith(article))
            {
                const withoutArticle = answer.substring(article.length);
                if (!answerList.includes(withoutArticle))
                {
                    answerList.push(withoutArticle);
                }
            }
        }
    }

    answerListCache[validAnswer] = answerList;
    return answerList;
}

/**
 * Checks if an answer
 * @param {string} validAnswer
 * @param {string} answer
 * @param {object} options
 */
function isGoodAnswer(validAnswer, answer, options)
{
    options = Object.assign({}, defaultOptions, options);
    answer = answer.trim();

    const validAnswerList = getOrComputeAnswerList(validAnswer, options);
    for (const va of validAnswerList)
    {
        if (doesMatch(va, answer, options.tolerance))
            return true;
    }

    return false;
}


export {shuffleQuestions,createQuestions,isGoodAnswer}
