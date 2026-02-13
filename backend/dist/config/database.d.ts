import { Pool, PoolClient } from 'pg';
declare const pool: Pool;
export declare const query: (text: string, params?: Array<any>) => Promise<any>;
export declare const getClient: () => Promise<PoolClient>;
export declare const closePool: () => Promise<void>;
export default pool;
//# sourceMappingURL=database.d.ts.map