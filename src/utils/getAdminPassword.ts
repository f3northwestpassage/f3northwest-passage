export function getAdminPasswordFromEnv(): string {
    const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (!password || password.trim() === '') {
        throw new Error('Missing NEXT_PUBLIC_ADMIN_PASSWORD in environment variables.');
    }
    return password;
}
