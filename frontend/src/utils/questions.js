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

// NEW: Add this helper function
function tryFlexibleWordMatching(validParts, inputParts, tolerance) {
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

    if (!valid.includes(" ") && tokenEqual(valid, input, tolerance))
        return true;

    if (valid.includes(":"))
    {
        const splitByColon = valid.split(":");
        for (const part of splitByColon)
        {
            if (doesMatch(part.trim(), input, tolerance))
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
        // Create variations with replacements
        if (validAnswer.includes(original))
        {
            const newAnswer = validAnswer.replace(original, abbreviated);
            if (!answerList.includes(newAnswer))
            {
                answerList.push(newAnswer);
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
