// In production the frontend (vercel) and backend (render) are on different domains, so the auth cookies
// are cross-site and browsers only send them when they are SameSite=None + Secure.
// Locally both run on localhost (same site, plain http) so we use lax and non-secure cookies.
// Render sets RENDER=true on its servers, so production cookies are used there even if NODE_ENV is not set.
const isProduction = () => process.env.NODE_ENV === "production" || process.env.RENDER === "true"

// converts "15m", "1d", "10d", "3600" (seconds) into milliseconds, same formats jsonwebtoken accepts
const expiryToMs = (expiry) => {
    const match = String(expiry ?? "").trim().match(/^(\d+)\s*(s|m|h|d)?$/i)
    if (!match) return undefined
    const units = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }
    return Number(match[1]) * units[(match[2] || "s").toLowerCase()]
}

// options used for setting and clearing cookies, they must match or the browser keeps the old cookie
export const getCookieOptions = () => {
    const production = isProduction()
    return {
        httpOnly : true,
        secure : production,
        sameSite : production ? "none" : "lax",
        path : "/",
    }
}

export const accessTokenCookieOptions = () => ({
    ...getCookieOptions(),
    maxAge : expiryToMs(process.env.ACCESS_TOKEN_EXPIRY),
})

export const refreshTokenCookieOptions = () => ({
    ...getCookieOptions(),
    maxAge : expiryToMs(process.env.REFRESH_TOKEN_EXPIRY),
})
