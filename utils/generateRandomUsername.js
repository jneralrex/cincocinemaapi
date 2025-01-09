const User = require("../models/user.model");

const generateRandomUsername = async (username) => {
    const suggestions = [];
    const maxSuggestion = 3;
    const maxAttempts = 100;

    let attempts = 0;

    while (suggestions.length < maxSuggestion && attempts < maxAttempts) {
        const suggestion = `${username}${Math.random.toString(36).substring(2, 5)}`;
        const exist = await User.findOne({ username: suggestion });

        if (!exist && !suggestion.includes(suggestion)) {
            suggestions.push(suggestion);
        }

        attempts++;
    };

    if (suggestions.length === 0) {
        suggestions.push("No available suggestion at the moment")
    };

    return suggestions;
};

module.exports = generateRandomUsername;
