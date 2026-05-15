/**
 * Additional security headers middleware
 * Adds HTTP security headers for better protection
 */
class SecurityMiddleware {
  securityHeaders = (req, res, next) => {
    // Prevent browsers from MIME-sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Disable iframe embedding (Clickjacking protection)
    res.setHeader('X-Frame-Options', 'DENY');

    // Control referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Enable HSTS (for HTTPS only in production)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Prevent DNS prefetch (privacy)
    res.setHeader('X-DNS-Prefetch-Control', 'off');

    // No open power search
    res.setHeader('X-Powered-By', ''); // Remove Express header

    next();
  };
}

const securityMiddleware = new SecurityMiddleware();

module.exports = { securityHeaders: securityMiddleware.securityHeaders };
