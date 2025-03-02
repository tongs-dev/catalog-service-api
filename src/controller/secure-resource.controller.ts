import { Controller, UseGuards, Get } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Controller for managing secure resources that require authentication.
 * All endpoints in this controller are protected by JWT authentication.
 */
@Controller("secure-resources")
@UseGuards(AuthGuard("jwt"))
export class SecureResourceController {
    /**
     * This endpoint requires authentication via a valid JWT token.
     * Request Format
     *     GET /api/secure-resources
     * Headers
     *     Authorization: Bearer $TOKEN
     *
     * Response Status Code
     *     - 200 OK - Successfully retrieves resource
     *     - 401 Unauthorized - Request does not include valid JWT token
     *
     * Example Request
     *     curl -X GET http://localhost:3000/api/secure-resources \
     *          -H "Authorization: Bearer $TOKEN"
     */
    @Get()
    async getResource() {
        return "Protected Resource";
    }
}