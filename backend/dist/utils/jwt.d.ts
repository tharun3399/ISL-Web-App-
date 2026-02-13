export interface JWTPayload {
    id: number;
    email: string;
    name: string;
    iat?: number;
    exp?: number;
}
export declare const generateToken: (payload: JWTPayload) => string;
export declare const verifyToken: (token: string) => JWTPayload | null;
export declare const decodeToken: (token: string) => JWTPayload | null;
//# sourceMappingURL=jwt.d.ts.map