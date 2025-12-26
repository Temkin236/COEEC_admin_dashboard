/**
 * Decode JWT token without verification (client-side only)
 * This is safe for reading token data, but should never be used for authorization
 */
export const decodeToken = (token: string): any => {
  try {
    if (!token) return null
    
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('Invalid token format')
      return null
    }
    
    // Decode the payload (second part)
    const payload = parts[1]
    
    // Base64 decode (handle URL-safe base64)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) return true
    
    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch {
    return true
  }
}

/**
 * Get user data from token
 */
export const getUserFromToken = (token: string): any => {
  try {
    const decoded = decodeToken(token)
    if (!decoded) return null
    
    console.log('Full decoded token:', decoded)
    
    // Extract user information from token payload
    // Try different possible field names
    const userId = decoded.sub || decoded.userId || decoded.id || decoded.user_id
    const email = decoded.email || decoded.userEmail || decoded.user_email
    
    // Handle roles - might be array or string
    let role = decoded.role || decoded.userRole || decoded.user_role
    if (!role && decoded.roles && Array.isArray(decoded.roles)) {
      // If roles is an array, take the first one or join them
      role = decoded.roles[0] || (decoded.roles.length > 0 ? decoded.roles.join(',') : undefined)
    }
    
    const name = decoded.name || decoded.displayName || decoded.username || decoded.user_name
    
    // Parse permissions - they might be in different formats
    let permissions = []
    
    if (decoded.permissions) {
      if (Array.isArray(decoded.permissions)) {
        // If permissions are strings like "research.create"
        if (typeof decoded.permissions[0] === 'string') {
          permissions = decoded.permissions.map((perm: string) => {
            const [action, resource] = perm.split('.')
            const normalize = (s: string | undefined) => (s || '').toString().toLowerCase().trim()
            return {
              id: perm,
              action: normalize(action) || normalize(perm),
              resource: normalize(resource) || 'view',
              description: null,
            }
          })
        } else {
          // If already objects with action/resource
          permissions = decoded.permissions
        }
      }
    } else if (decoded.perms) {
      permissions = decoded.perms
    }
    
    console.log('Parsed user data:', { userId, email, role, name, permissions })
    
    return {
      id: userId,
      email: email,
      role: role,
      name: name,
      permissions: permissions,
    }
  } catch (error) {
    console.error('Error extracting user from token:', error)
    return null
  }
}
