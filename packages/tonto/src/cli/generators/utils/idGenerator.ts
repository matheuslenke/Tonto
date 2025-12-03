/**
 * Generates a unique identifier string
 * Format: 20 lowercase alphanumeric characters
 * Example: "16gprmej15r4mimcjfbm"
 */
export function generateUniqueId(): string {
    const characters = "0123456789abcdefghijklmnopqrstuvwxyz";
    const idLength = 20;
    let id = "";

    for (let i = 0; i < idLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters[randomIndex];
    }

    return id;
}

