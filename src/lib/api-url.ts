const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim()

if (!configuredUrl) throw new Error('EXPO_PUBLIC_API_URL is not configured')

export const apiUrl = configuredUrl.replace(/\/+$/, '')
