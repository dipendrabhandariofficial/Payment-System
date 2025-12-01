
// Generate realistic-looking tokens
export function generateMockToken(user, expiresIn = 3600) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn
    };
    const body = btoa(JSON.stringify(payload));
    const signature = btoa(Math.random().toString(36));
    return `${header}.${body}.${signature}`;
}
