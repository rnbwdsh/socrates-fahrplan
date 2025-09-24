import PocketBase from 'pocketbase';

import type { TypedPocketBase } from './pocketbase-types.js';

export const pb = new PocketBase() as TypedPocketBase;
