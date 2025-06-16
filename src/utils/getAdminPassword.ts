export function getAdminPasswordFromEnv(): string {
    const password = process.env.ADMIN_PASSWORD;
    if (!password || password.trim() === '') {
        throw new Error('Missing ADMIN_PASSWORD in environment variables.');
    }
    return password;
}
