export interface UserInfo {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    password_hash: string;
}
export declare class UserModel {
    static findById(id: number): Promise<UserInfo | null>;
    static findByEmail(email: string): Promise<UserInfo | null>;
    static create(name: string, email: string, phone: string, password: string): Promise<UserInfo>;
    static validatePassword(email: string, password: string): Promise<UserInfo | null>;
    static getAll(): Promise<UserInfo[]>;
    static update(id: number, updates: Partial<UserInfo>): Promise<UserInfo | null>;
    static delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=User.d.ts.map